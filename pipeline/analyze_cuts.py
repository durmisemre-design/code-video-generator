"""Data-driven jump-cut analysis -> src/data/cuts-manifest.json   (sources are never modified)
Acoustic transients (100 ms windows over a 10 ms onset detector) AND hand/object motion must coincide.
Output: 25-45 micro-clips, each 1.2-3.5 s (hard cap 4 s), 0.20 s pre / 0.25 s post handles, 45-90 s total.
Run: python3 pipeline/analyze_cuts.py"""
import json, os, numpy as np
from scipy.signal import butter, sosfilt

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CFG = json.load(open(f"{ROOT}/pipeline/config.json"))
SRC = json.load(open(f"{ROOT}/pipeline/sources.json"))["sources"]
C = CFG["cuts"]
SR, FPS = CFG["sampleRate"], CFG["fps"]
PRE, POST = CFG["trim"]["preRollSec"], CFG["trim"]["postRollSec"]
STEP = 0.01  # 10 ms detector grid


def load_audio(sid):
    return np.mean([np.load(f"{ROOT}/pipeline/cache/{sid}_a{i}.npy") for i in CFG["audioTracks"]], axis=0)


def envelope(x):
    """Broadband click/crinkle envelope (>800 Hz) in dB on a 10 ms grid."""
    y = sosfilt(butter(2, C["onsetHighpassHz"], "hp", fs=SR, output="sos"), x)
    b = int(SR * STEP); n = len(y) // b
    return 20 * np.log10(np.sqrt((y[: n * b].reshape(n, b) ** 2).mean(1)) + 1e-9)


def motion_curve(sid, n):
    m = np.load(f"{ROOT}/pipeline/cache/{sid}_motion.npy").astype(np.float32)
    d = np.concatenate([[0], np.abs(np.diff(m, axis=0)).mean((1, 2))])
    d = np.convolve(d, np.ones(3) / 3, "same")
    idx = np.minimum((np.arange(n) * STEP * 20).astype(int), len(d) - 1)
    return d[idx]


def candidates(sid):
    x = load_audio(sid); env = envelope(x); n = len(env)
    floor = np.percentile(env, 10)
    mot = motion_curve(sid, n)
    mot_med = np.median(mot)
    # onset strength: rise over the quiet baseline of the previous 0.4 s
    base = np.array([np.percentile(env[max(0, i - 40): max(1, i - 3)], 20) if i > 5 else env[i] for i in range(n)])
    rise = np.maximum(env - base, 0)
    # 100 ms windows
    w = 10; nw = n // w
    wr = rise[: nw * w].reshape(nw, w); wl = env[: nw * w].reshape(nw, w); wm = mot[: nw * w].reshape(nw, w)
    win_rise, win_lvl, win_mot = wr.max(1), wl.max(1) - floor, wm.max(1)
    ons = []
    for i in range(2, nw - 2):
        near_mot = win_mot[max(0, i - 5): i + 6].max()
        if (win_rise[i] >= C["minRiseDb"] and win_lvl[i] >= C["minLevelAboveFloorDb"] and near_mot >= C["motionVsMedian"] * mot_med
                and win_rise[i] == win_rise[max(0, i - 3): i + 4].max()):
            ons.append((i * 0.1, win_rise[i] + 0.5 * win_lvl[i] + 4 * near_mot / (mot_med + 1e-6)))
    return ons, env, floor, mot, mot_med


def build_clips(sid, dur):
    ons, env, floor, mot, mot_med = candidates(sid)
    clips, used_until = [], -1e9
    # merge onsets <1.0 s apart into one action cluster
    clusters = []
    for t, s in ons:
        if clusters and t - clusters[-1]["t1"] < C["clusterGapSec"]:
            clusters[-1]["t1"] = t; clusters[-1]["score"] += s * 0.5; clusters[-1]["peak"] = max(clusters[-1]["peak"], s)
        else:
            clusters.append({"t0": t, "t1": t, "score": s, "peak": s})
    for c in clusters:
        a = c["t0"] - PRE
        # action tail: follow decay above floor, max 3.5 s total
        j = int(c["t1"] / STEP); last = j; quiet = 0
        lim = int((c["t0"] + C["maxClipSec"] - PRE - POST) / STEP)
        while j < min(len(env) - 1, lim) and quiet < 35:
            j += 1
            if env[j] > floor + C["tailAboveFloorDb"]: last = j; quiet = 0
            else: quiet += 1
        b = last * STEP + POST
        b = min(b, a + C["maxClipSec"])
        if b - a < C["minClipSec"]: b = a + C["minClipSec"]
        a = max(0.0, a); b = min(dur - 0.05, b)
        f0, f1 = int(np.floor(a * FPS)), int(np.ceil(b * FPS))
        if f1 - f0 > C["maxClipSec"] * FPS: f1 = f0 + int(C["maxClipSec"] * FPS)
        if (f1 - f0) / FPS < C["minClipSec"] - 0.05 or a < used_until: continue
        clips.append({"srcId": sid, "srcStartFrame": f0, "srcEndFrame": f1, "score": float(c["score"]), "peak": float(c["peak"])})
        used_until = b
    return clips


def pick(all_clips, durs):
    total = sum(durs.values())
    picked = []
    for sid, d in durs.items():
        cs = sorted([c for c in all_clips if c["srcId"] == sid], key=lambda c: -c["score"])
        q = max(1, round(C["targetClips"] * d / total))
        sel = []
        for c in cs:  # spacing: avoid neighbouring slices of the same action
            if all(abs(c["srcStartFrame"] - s["srcStartFrame"]) > C["minSpacingSec"] * FPS for s in sel):
                sel.append(c)
            if len(sel) >= q: break
        picked += sel
    return picked


if __name__ == "__main__":
    allc, durs = [], {}
    for s in SRC:
        x = np.load(f"{ROOT}/pipeline/cache/{s['id']}_a0.npy"); durs[s["id"]] = len(x) / SR
        cl = build_clips(s["id"], durs[s["id"]]); allc += cl
        print(f"{s['id']}: {durs[s['id']]:6.1f}s -> {len(cl)} candidate clips")
    picked = pick(allc, durs)
    order = {s["id"]: i for i, s in enumerate(SRC)}
    picked.sort(key=lambda c: (order[c["srcId"]], c["srcStartFrame"]))
    files = {s["id"]: s["file"] for s in SRC}
    cuts, cur = [], 0
    for k, c in enumerate(picked):
        n = c["srcEndFrame"] - c["srcStartFrame"]
        cuts.append({"index": k, "srcId": c["srcId"], "file": files[c["srcId"]], "srcStartFrame": c["srcStartFrame"],
                     "srcEndFrame": c["srcEndFrame"], "srcStartSec": round(c["srcStartFrame"] / FPS, 3),
                     "srcEndSec": round(c["srcEndFrame"] / FPS, 3), "timelineFrom": cur, "durationFrames": n,
                     "score": round(c["score"], 2)})
        cur += n
    out = {"fps": FPS, "sampleRate": SR, "sourceSize": {"width": 3840, "height": 2160},
           "handles": {"preRollSec": PRE, "postRollSec": POST}, "crossfadeMs": CFG["crossfade"]["ms"],
           "totalFrames": cur, "totalSec": round(cur / FPS, 3), "cuts": cuts}
    json.dump(out, open(f"{ROOT}/src/data/cuts-manifest.json", "w"), indent=1)
    lens = [c["durationFrames"] / FPS for c in cuts]
    print(f"CLIPS {len(cuts)}  TOTAL {cur/FPS:.1f}s ({cur} frames)  clip len min/avg/max {min(lens):.2f}/{np.mean(lens):.2f}/{max(lens):.2f}")
    for s in SRC: print("  ", s["id"], sum(1 for c in cuts if c["srcId"] == s["id"]))

