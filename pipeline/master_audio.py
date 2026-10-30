"""ASMR master: cuts-manifest.json -> constant-power crossfaded timeline -> DSP chain -> public/audio/asmr-cuts-master.wav
Chain: HPF 75Hz(12dB/oct) -> gentle spectral denoise -> tactile EQ -> transient-friendly 2:1 compressor
       -> LUFS normalise (-15) -> true-peak limiter (-1.5 dBTP).  Sources are only read.
Run: python3 pipeline/master_audio.py"""
import json, os, subprocess, numpy as np
from scipy.io import wavfile
from scipy.signal import butter, sosfilt, sosfiltfilt, stft, istft, resample_poly, lfilter
from scipy.ndimage import minimum_filter1d, uniform_filter1d

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CFG = json.load(open(f"{ROOT}/pipeline/config.json"))
MANIFEST = json.load(open(f"{ROOT}/src/data/cuts-manifest.json"))
SR, FPS = CFG["sampleRate"], CFG["fps"]
D = CFG["dsp"]
SPF = SR // FPS  # 800 samples / frame


def load_src(cid):
    return np.stack([np.load(f"{ROOT}/pipeline/cache/{cid}_a{i}.npy") for i in CFG["audioTracks"][:2]]).astype(np.float64)


# ---------------------------------------------------------------- 1. timeline + constant-power crossfade
def build_timeline():
    xf = int(SR * CFG["crossfade"]["ms"] / 1000)
    half = xf // 2
    parts = []  # (cid, f0, f1)
    for c in MANIFEST["cuts"]:
        parts.append((c["srcId"], c["srcStartFrame"], c["srcEndFrame"]))
    total = sum(p[2] - p[1] for p in parts) * SPF
    out = np.zeros((2, total + xf))
    cache, pos = {}, 0
    t = np.linspace(0, np.pi / 2, xf)
    fin, fout = np.sin(t), np.cos(t)  # sin^2+cos^2=1 -> constant power
    for k, (cid, f0, f1) in enumerate(parts):
        if cid not in cache: cache = {cid: load_src(cid)}
        src = cache[cid]
        a, b = f0 * SPF - half, f1 * SPF + half
        seg = np.zeros((2, b - a))
        lo, hi = max(a, 0), min(b, src.shape[1])
        seg[:, lo - a: hi - a] = src[:, lo:hi]
        w = np.ones(b - a)
        if k > 0: w[:xf] = fin
        else: w[:half] = 0; w[half:xf] = np.sin(np.linspace(0, np.pi / 2, xf - half))  # 20 ms edge ramp
        if k < len(parts) - 1: w[-xf:] = fout
        else: w[-half:] = 0
        out[:, pos: pos + (b - a)] += seg * w
        pos += (f1 - f0) * SPF
    return out[:, half: half + total], parts


# ---------------------------------------------------------------- 2. DSP blocks
def highpass(x, hz, order_db):
    sos = butter(order_db // 6, hz, "hp", fs=SR, output="sos")
    return sosfilt(sos, x, axis=-1)


def denoise(x, red_db, prof_sec, pct):
    """Gentle Wiener-style spectral attenuation; max reduction capped (3-6 dB), smoothed -> no gating / musical noise."""
    gmin = 10 ** (-red_db / 20)
    n, hop = 2048, 512
    out = np.zeros_like(x)
    for ch in range(x.shape[0]):
        f, t, Z = stft(x[ch], SR, nperseg=n, noverlap=n - hop)
        mag = np.abs(Z)
        noise = np.percentile(mag, pct, axis=1, keepdims=True) * 1.6
        snr = np.maximum(mag ** 2 - noise ** 2, 0) / (mag ** 2 + 1e-20)
        g = np.clip(np.sqrt(snr), gmin, 1.0)
        g = uniform_filter1d(g, 5, axis=0)  # freq smoothing
        # time smoothing: fast attack (gain up), slow release (gain down)
        gs = g.copy()
        a_up, a_dn = 0.2, 0.7
        for i in range(1, g.shape[1]):
            c = np.where(g[:, i] > gs[:, i - 1], a_up, a_dn)
            gs[:, i] = c * gs[:, i - 1] + (1 - c) * g[:, i]
        _, y = istft(Z * gs, SR, nperseg=n, noverlap=n - hop)
        out[ch] = y[: x.shape[1]] if len(y) >= x.shape[1] else np.pad(y, (0, x.shape[1] - len(y)))
    return out


def biquad(kind, hz, gain_db, q=None, slope=None):
    A = 10 ** (gain_db / 40); w0 = 2 * np.pi * hz / SR; c, s = np.cos(w0), np.sin(w0)
    if kind == "peak":
        al = s / (2 * q)
        b = [1 + al * A, -2 * c, 1 - al * A]; a = [1 + al / A, -2 * c, 1 - al / A]
    else:  # highshelf (RBJ)
        al = s / 2 * np.sqrt((A + 1 / A) * (1 / slope - 1) + 2); r = 2 * np.sqrt(A) * al
        b = [A * ((A + 1) + (A - 1) * c + r), -2 * A * ((A - 1) + (A + 1) * c), A * ((A + 1) + (A - 1) * c - r)]
        a = [(A + 1) - (A - 1) * c + r, 2 * ((A - 1) - (A + 1) * c), (A + 1) - (A - 1) * c - r]
    return np.array(b) / a[0], np.array(a) / a[0]


def tactile_eq(x):
    for band in D["eq"]:
        b, a = biquad(band["type"], band["hz"], band["gainDb"], band.get("q"), band.get("slope"))
        x = lfilter(b, a, x, axis=-1)
    return x


def smooth_follow(level_db, thr, ratio, knee, att_ms, rel_ms, rate):
    """Block-rate gain computer with attack/release ballistics (linked stereo)."""
    over = level_db - thr
    gr = np.where(over <= -knee / 2, 0.0,
                  np.where(over >= knee / 2, over * (1 - 1 / ratio),
                           (1 - 1 / ratio) * (over + knee / 2) ** 2 / (2 * knee)))  # reduction in dB (>=0)
    ca, cr = np.exp(-1 / (att_ms * 1e-3 * rate)), np.exp(-1 / (rel_ms * 1e-3 * rate))
    out = np.empty_like(gr); y = 0.0
    for i, v in enumerate(gr.tolist()):
        c = ca if v > y else cr
        y = c * y + (1 - c) * v
        out[i] = y
    return out


def compressor(x, p):
    B = SR // 1000  # 1 ms blocks
    n = x.shape[1] // B
    peak = np.abs(x[:, : n * B]).reshape(2, n, B).max(axis=(0, 2))
    lvl = 20 * np.log10(peak + 1e-9)
    gr = smooth_follow(lvl, p["thresholdDb"], p["ratio"], p["kneeDb"], p["attackMs"], p["releaseMs"], 1000)
    g = 10 ** (-gr / 20)
    gi = np.interp(np.arange(x.shape[1]), (np.arange(n) + 0.5) * B, g)
    return x * gi


# ---------------------------------------------------------------- 3. loudness / true peak
def k_weight(x):
    # BS.1770 K-weighting at 48 kHz
    b1 = [1.53512485958697, -2.69169618940638, 1.19839281085285]; a1 = [1, -1.69065929318241, 0.73248077421585]
    b2 = [1, -2, 1]; a2 = [1, -1.99004745483398, 0.99007225036621]
    return lfilter(b2, a2, lfilter(b1, a1, x, axis=-1), axis=-1)


def lufs(x):
    z = k_weight(x); blk, hop = int(0.4 * SR), int(0.1 * SR)
    ms = np.array([(z[:, i: i + blk] ** 2).mean(1).sum() for i in range(0, z.shape[1] - blk + 1, hop)])
    l = -0.691 + 10 * np.log10(ms + 1e-20)
    ms1 = ms[l > -70]
    rel = -0.691 + 10 * np.log10(ms1.mean() + 1e-20) - 10
    ms2 = ms[l > max(-70, rel)]
    return -0.691 + 10 * np.log10(ms2.mean() + 1e-20)


def true_peak_db(x):
    up = resample_poly(x, 4, 1, axis=-1)
    return 20 * np.log10(np.abs(up).max() + 1e-12)


def limiter(x, ceil_db, look_ms, rel_ms):
    ceil = 10 ** (ceil_db / 20)
    B = 24; n = x.shape[1] // B
    up = np.abs(resample_poly(x[:, : n * B], 4, 1, axis=-1)).reshape(2, n, B * 4).max(axis=(0, 2))
    need = np.minimum(1.0, ceil * 0.995 / (up + 1e-12))
    L = max(3, int(look_ms * SR / 1000 / B))
    hold = minimum_filter1d(need, 2 * L + 1, mode="nearest")
    rc = np.exp(-1 / (rel_ms * 1e-3 * SR / B)); out = np.empty_like(hold); y = 1.0
    for i, v in enumerate(hold.tolist()):
        y = v if v < y else rc * y + (1 - rc) * v
        out[i] = min(y, v)
    sm = uniform_filter1d(out, L, mode="nearest")
    sm = np.minimum(sm, np.maximum(out, 0))  # never above hold requirement
    g = np.interp(np.arange(x.shape[1]), (np.arange(n) + 0.5) * B, sm)
    y = x * g
    tp = true_peak_db(y)
    if tp > ceil_db: y *= 10 ** ((ceil_db - tp) / 20)  # safety trim
    return y


def master():
    x, parts = build_timeline()
    print(f"timeline {x.shape[1]/SR:.1f}s from {len(parts)} segments")
    x = highpass(x, D["highpass"]["hz"], D["highpass"]["orderDbPerOct"])
    x = denoise(x, D["denoise"]["reductionDb"], D["denoise"]["noiseProfileSec"], D["denoise"]["floorPercentile"])
    x = tactile_eq(x)
    x = compressor(x, D["compressor"])
    target = D["loudness"]["targetLufs"]
    gain = 10 ** ((target - lufs(x)) / 20)
    for it in range(14):  # limiter eats loudness -> iterate gain
        y = limiter(x * gain, D["limiter"]["truePeakCeilingDbTP"], D["limiter"]["lookaheadMs"], D["limiter"]["releaseMs"])
        l = lufs(y); print(f"  iter {it}: {l:.2f} LUFS  TP {true_peak_db(y):.2f} dBTP")
        if abs(l - target) < 0.2: break
        gain *= 10 ** ((target - l) / 20)
    return y


if __name__ == "__main__":
    y = master()
    os.makedirs(f"{ROOT}/public/audio", exist_ok=True)
    tmp = f"{ROOT}/pipeline/cache/_master32.wav"
    wavfile.write(tmp, SR, (np.clip(y.T, -1, 1) * (2 ** 31 - 1)).astype(np.int32))
    ff = f"{ROOT}/node_modules/@remotion/compositor-darwin-arm64/ffmpeg"
    subprocess.run([ff, "-v", "error", "-y", "-i", tmp, "-c:a", "pcm_s24le", f"{ROOT}/public/audio/asmr-cuts-master.wav"], check=True,
                   env={**os.environ, "DYLD_LIBRARY_PATH": os.path.dirname(ff)})
    os.remove(tmp)
    print(f"FINAL {lufs(y):.2f} LUFS  {true_peak_db(y):.2f} dBTP  {y.shape[1]/SR:.2f}s -> public/audio/asmr-cuts-master.wav")
