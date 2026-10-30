"""Acoustic-Valley Verified Unbroken Voiceover + Action-Matched B-Roll + Warm Chill BG Music & Subtle Transition SFX Builder.
1. Zero mid-sentence cuts: Every audio block is cut strictly inside verified <-62 dB acoustic silence valleys (>=200ms wide) with consecutive sentences from the same take kept 100% unbroken.
2. Intro Showcase (00:00 .. ~22.8s): Bottom half frames the horizontal speaker video naturally (no extreme face zoom!), while Top half showcases 'dji 3.png' (269€), 'dji mini 2.png' (109€), and silent box teaser clips.
3. Full-Screen Unboxing (~22.8s .. End): Right after 'Videoya geçelim!', full-screen unboxing videos (C002..C007) play in sync with every spoken sentence (starting with the Lidl knife slicing the box plastic in C002).
4. Pleasant chill background music ('public/audio/bg-music.wav') + subtle, tasteful low-passed transition air-whoosh/soft-click SFX ('public/audio/sfx-transitions.wav').
"""
import json, os, subprocess, numpy as np
from scipy.io import wavfile
from scipy.signal import butter, sosfilt, lfilter, resample_poly
from scipy.ndimage import minimum_filter1d, uniform_filter1d

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SR, FPS = 48000, 60
SPF = SR // FPS  # 800 samples / frame

WORD_FIX = {
    "DGI": "DJI",
    "DGI'nın": "DJI'nın",
    "Mig": "Mic",
    "mic'inizi": "Mic'inizi",
    "mic": "Mic",
    "mini": "Mini",
    "2'si": "2'si",
    "euroya": "Euro'ya",
    "Euro": "Euro",
    "Youtube'da": "YouTube'da",
}

def fix_word(w):
    w = w.strip()
    return WORD_FIX.get(w, w)


# ==============================================================================
# ACOUSTIC-VALLEY VERIFIED UNBROKEN AUDIO BLOCKS (Every t0 and t1 is < -61 dB!)
# ==============================================================================
# Format: (source_id, src_start_sec, src_end_sec, mode, broll_slices, label)
# Each broll_slice is (srcId, srcStartSec, durationWeight, subLabel)
AUDIO_BLOCKS = [
    # --- BLOCK 0: INTRO SPEAKER + TOP PRODUCT SHOWCASE (dji 3.png & dji mini 2.png) ---
    (
        "intro", 6.35, 28.82, "intro_showcase",
        [],  # Intro uses split showcase (Top: dji 3.png / dji mini 2.png / box preview; Bottom: speaker intro.mp4)
        "intro_full_unbroken"
    ),

    # --- BLOCK 1: UNBROKEN TAKE2 (0.20s .. 12.85s = 12.65s) ---
    # "İlk olarak Lidl'dan aldığım bu bıçakla açmaya çalıştım. (0.20..3.90s -> 3.70s)
    #  Sonra karşıma zaten büyük bir poşet çıktı. (3.90..7.35s -> 3.45s)
    #  Poşetin içinde de DJI'nın verdiği bize gerçekten kaliteli olan bir el çantası." (7.35..12.85s -> 5.50s)
    (
        "take2", 0.20, 12.85, "unboxing_broll",
        [
            ("C002", 9.60, 3.70 / 12.65, "unbox_lidl_bicakla_kutu_acilimi"),
            ("C002", 67.80, 3.45 / 12.65, "unbox_buyuk_ic_poset_cikisi"),
            ("C002", 88.50, 2.75 / 12.65, "unbox_kaliteli_siyah_el_cantasi_1"),
            ("C002", 113.80, 2.75 / 12.65, "unbox_kaliteli_siyah_el_cantasi_2"),
        ],
        "block1_knife_bag_pouch_unbroken"
    ),

    # --- BLOCK 2: UNBROKEN TAKE1 (14.90s .. 20.02s = 5.12s) ---
    # "Hemen modifiye tırnakları çıkıyor, rengarenk mikrofonunuza takabiliyorsunuz, değiştirebiliyorsun."
    # (Acoustic cut strictly at 20.02s to eliminate aborted "USB" utterance at 20.10s)
    (
        "take1", 14.90, 20.02, "unboxing_broll",
        [
            ("C003", 98.50, 0.50, "unbox_rengarenk_modifiye_tirnaklari_1"),
            ("C003", 113.50, 0.50, "unbox_rengarenk_modifiye_tirnaklari_2"),
        ],
        "block2_colorful_modifier_clips_unbroken"
    ),

    # --- BLOCK 3: UNBROKEN TAKE2 (23.10s .. 59.45s = 36.35s) ---
    # - 23.10..33.10s (10.0s): "DJI'nın bize verdiği kutu, içinde mikrofon ve aparatlarınızı bile saklayacağınız cidden kaliteli bir kutu."
    # - 33.10..38.05s (4.95s): "Burada kameraya bağlanacak girişi gösterdim."
    # - 38.05..42.65s (4.60s): "Burada iki tane daha tırnak veriyor bize, onlar orijinal olan klasik."
    # - 42.65..45.65s (3.00s): "Burada kamera bağlantısını gösteriyorum."
    # - 45.65..59.45s (13.80s): "Ve bu yakaya taktığınız tırnaklar tamamen mıknatıs ve aşırı güçlü mıknatıs. Arkadaşlar ciddi manada aşırı güçlü. Ben ikisini birleştirdiğimde açamamıştım, zorlanmıştım."
    (
        "take2", 23.10, 59.45, "unboxing_broll",
        [
            ("C003", 17.50, 3.30 / 36.35, "unbox_sarj_kutusu_jelatin"),
            ("C003", 23.80, 3.40 / 36.35, "unbox_sarj_kutusu_kapak_acilis"),
            ("C003", 33.50, 3.30 / 36.35, "unbox_sarj_kutusu_ic_gorunum"),
            ("C004", 13.80, 4.95 / 36.35, "unbox_kamera_baglanti_girisi"),
            ("C003", 139.50, 4.60 / 36.35, "unbox_iki_tane_orijinal_klasik_tirnak"),
            ("C003", 69.20, 3.00 / 36.35, "unbox_kamera_ses_kablosu"),
            ("C004", 53.50, 4.60 / 36.35, "unbox_asiri_guclu_miknatis_1"),
            ("C004", 138.00, 4.60 / 36.35, "unbox_asiri_guclu_miknatis_2"),
            ("C004", 188.50, 4.60 / 36.35, "unbox_asiri_guclu_miknatis_3"),
        ],
        "block3_case_camera_clips_cable_magnets_unbroken"
    ),

    # --- BLOCK 4: UNBROKEN TAKE2 (61.35s .. 74.25s = 12.90s) ---
    # - 61.35..66.15s (4.80s): "Burada telefonunuza takacağınız USB-C'yi gösterdim."
    # - 66.15..74.25s (8.10s): "Burada tekrar kutuya yerleştiriyorum. Kutuyu gerçekten çok sevdim. Aşırı şey hissettiriyor, kaliteli hissettiriyor."
    (
        "take2", 61.35, 74.25, "unboxing_broll",
        [
            ("C005", 8.50, 4.80 / 12.90, "unbox_telefon_usbc_aparati"),
            ("C005", 35.00, 4.05 / 12.90, "unbox_tekrar_kutuya_yerlestirme_1"),
            ("C005", 68.50, 4.05 / 12.90, "unbox_tekrar_kutuya_yerlestirme_2"),
        ],
        "block4_usbc_place_in_case_unbroken"
    ),

    # --- BLOCK 5: UNBROKEN TAKE1 (26.95s .. 34.90s = 7.95s) ---
    # "Kaliteli bence, yarısı metalken yarısı da plastik gibi hissettiriyor, o şekilde kutu şarj olabiliyor."
    (
        "take1", 26.95, 34.90, "unboxing_broll",
        [
            ("C005", 113.50, 0.50, "unbox_yarisi_metal_yarisi_plastik_1"),
            ("C005", 146.50, 0.50, "unbox_yarisi_metal_yarisi_plastik_sarj"),
        ],
        "block5_metal_plastic_charging_unbroken"
    ),

    # --- BLOCK 6: UNBROKEN TAKE1 (60.00s .. 87.65s = 27.65s) ---
    # - 60.00..70.55s (10.55s): "Ama genel olarak baktığımızda cihazın verdiği kalite cidden fiyatına göre kaliteli ve premium hissettiriyor, özellikle ses kalitesine bayıldım."
    # - 70.55..83.10s (12.55s): "Hani Mic 3'e gidip 259 Euro vereceğime gidip 109 Euro'ya böyle kaliteli bir malzeme almak için cidden beni mutlu etti."
    # - 83.10..87.65s (4.55s): "Ben açıkçası mutlu oldum satın almakla. Eğer bu modeli almak istiyorsanız..."
    (
        "take1", 60.00, 87.65, "unboxing_broll",
        [
            ("C004", 93.50, 5.25 / 27.65, "unbox_ruzgarlik_ve_premium_kalite"),
            ("C007", 0.50, 5.30 / 27.65, "unbox_kutu_ve_mikrofonlar_detay"),
            ("C003", 102.00, 6.25 / 27.65, "unbox_259_vs_109_euro_renkli_set"),
            ("C003", 162.40, 6.30 / 27.65, "unbox_tum_aksesuarlar_gorunum"),
            ("C004", 118.50, 4.55 / 27.65, "unbox_satin_almakla_mutlu_oldum"),
        ],
        "block6_overall_quality_price_happy_unbroken"
    ),

    # --- BLOCK 7: UNBROKEN TAKE1 (89.30s .. 93.80s = 4.50s) ---
    # "...alabilirsiniz, öneriyorum, gerçekten hiç düşünmenize bile gerek yok."
    (
        "take1", 89.30, 93.80, "unboxing_broll",
        [
            ("C004", 75.20, 1.0, "unbox_final_kesinlikle_oneriyorum"),
        ],
        "block7_final_recommendation_unbroken"
    ),
]


def load_speech_wav(sid):
    sr, d = wavfile.read(f"{ROOT}/pipeline/speech/{sid}_a0.wav")
    return d.astype(np.float64) / (2 ** 31)


def load_words(sid):
    tr = json.load(open(f"{ROOT}/pipeline/speech/{sid}.json"))["transcription"]
    words = []
    for t in tr:
        w = fix_word(t["text"])
        if not w or w.lower() in ("abone", "ol"):
            continue
        words.append({
            "word": w,
            "start": t["offsets"]["from"] / 1000.0,
            "end": t["offsets"]["to"] / 1000.0,
        })
    return words


def biquad(kind, hz, gain_db, q=0.7, slope=0.7):
    A = 10 ** (gain_db / 40); w0 = 2 * np.pi * hz / SR; c, s = np.cos(w0), np.sin(w0)
    if kind == "peak":
        al = s / (2 * q)
        b = [1 + al * A, -2 * c, 1 - al * A]; a = [1 + al / A, -2 * c, 1 - al / A]
    else:
        al = s / 2 * np.sqrt((A + 1 / A) * (1 / slope - 1) + 2); r = 2 * np.sqrt(A) * al
        b = [A * ((A + 1) + (A - 1) * c + r), -2 * A * ((A - 1) + (A + 1) * c), A * ((A + 1) + (A - 1) * c - r)]
        a = [(A + 1) - (A - 1) * c + r, 2 * ((A - 1) - (A + 1) * c), (A + 1) - (A - 1) * c - r]
    return np.array(b) / a[0], np.array(a) / a[0]


def k_weight(x):
    b1 = [1.53512485958697, -2.69169618940638, 1.19839281085285]; a1 = [1, -1.69065929318241, 0.73248077421585]
    b2 = [1, -2, 1]; a2 = [1, -1.99004745483398, 0.99007225036621]
    return lfilter(b2, a2, lfilter(b1, a1, x))


def calc_lufs_mono(x):
    z = k_weight(x); blk, hop = int(0.4 * SR), int(0.1 * SR)
    ms = np.array([2.0 * (z[i: i + blk] ** 2).mean() for i in range(0, len(z) - blk + 1, hop)])
    l = -0.691 + 10 * np.log10(ms + 1e-20)
    ms1 = ms[l > -70]
    rel = -0.691 + 10 * np.log10(ms1.mean() + 1e-20) - 10
    ms2 = ms[l > max(-70, rel)]
    return -0.691 + 10 * np.log10(ms2.mean() + 1e-20)


def true_peak_db(x):
    up = resample_poly(x, 4, 1)
    return 20 * np.log10(np.abs(up).max() + 1e-12)


def master_voice_segment(seg):
    sos = butter(2, 85, "hp", fs=SR, output="sos")
    y = sosfilt(sos, seg)
    for kind, hz, g, q in [("peak", 180, 1.5, 0.8), ("peak", 380, -1.5, 1.2), ("peak", 3200, 2.5, 0.7), ("highshelf", 9000, 1.5, 0.7)]:
        b, a = biquad(kind, hz, g, q, q)
        y = lfilter(b, a, y)
    rms = np.sqrt(np.mean(y[np.abs(y) > np.percentile(np.abs(y), 35)] ** 2) + 1e-12)
    target_rms = 10 ** (-18.5 / 20)
    return y * (target_rms / rms)


def compress_and_limit_voice(x, target_lufs=-13.0, ceiling_db=-1.0):
    B = SR // 1000
    n = len(x) // B
    pk = np.abs(x[: n * B]).reshape(n, B).max(1)
    lvl = 20 * np.log10(pk + 1e-9)
    thr, ratio, knee = -22.0, 3.0, 6.0
    over = lvl - thr
    gr = np.where(over <= -knee / 2, 0.0,
                  np.where(over >= knee / 2, over * (1 - 1 / ratio),
                           (1 - 1 / ratio) * (over + knee / 2) ** 2 / (2 * knee)))
    ca, cr = np.exp(-1 / 12.0), np.exp(-1 / 80.0)
    sm = np.empty_like(gr); cur = 0.0
    for i, v in enumerate(gr.tolist()):
        c = ca if v > cur else cr
        cur = c * cur + (1 - c) * v
        sm[i] = cur
    g = np.interp(np.arange(len(x)), (np.arange(n) + 0.5) * B, 10 ** (-sm / 20))
    y = x * g

    ceil = 10 ** (ceiling_db / 20)
    gain = 10 ** ((target_lufs - calc_lufs_mono(y)) / 20)
    for _ in range(12):
        z = y * gain
        B2 = 24; n2 = len(z) // B2
        up = np.abs(resample_poly(z[: n2 * B2], 4, 1)).reshape(n2, B2 * 4).max(1)
        need = np.minimum(1.0, ceil * 0.992 / (up + 1e-12))
        L = max(3, int(4 * SR / 1000 / B2))
        hold = minimum_filter1d(need, 2 * L + 1, mode="nearest")
        rc = np.exp(-1 / (50 * 1e-3 * SR / B2)); lim = np.empty_like(hold); cur = 1.0
        for i, v in enumerate(hold.tolist()):
            cur = v if v < cur else rc * cur + (1 - rc) * v
            lim[i] = min(cur, v)
        sm2 = np.minimum(uniform_filter1d(lim, L, mode="nearest"), lim)
        g2 = np.interp(np.arange(len(z)), (np.arange(n2) + 0.5) * B2, sm2)
        out = z * g2
        tp = true_peak_db(out)
        if tp > ceiling_db:
            out *= 10 ** ((ceiling_db - tp) / 20)
        l = calc_lufs_mono(out)
        if abs(l - target_lufs) < 0.15:
            break
        gain *= 10 ** ((target_lufs - l) / 20)
    print(f"VOICE MASTER: {calc_lufs_mono(out):.2f} LUFS | True Peak: {true_peak_db(out):.2f} dBTP | Duration: {len(out)/SR:.2f}s")
    return out


def compute_focus(src_id, start_sec, end_sec):
    vid = np.load(f"{ROOT}/pipeline/cache/{src_id}_motion.npy").astype(np.float32)
    i0 = max(0, int(start_sec * 20))
    i1 = min(len(vid), int(end_sec * 20) + 1)
    diff = np.abs(np.diff(vid[i0:i1], axis=0))
    if len(diff) == 0:
        return 0.40, 0.52
    w = diff.mean(0) + 1e-6
    ys = (np.arange(54) + 0.5) / 54
    xs = (np.arange(96) + 0.5) / 96
    fy = float((w.sum(1) * ys).sum() / w.sum())
    fx = float((w.sum(0) * xs).sum() / w.sum())
    return round(fx, 3), round(fy, 3)


def generate_chill_bg_music_and_sfx(total_frames, transition_frames):
    """Synthesizes a warm, cozy, modern lo-fi Rhodes & sub-bass background groove ('bg-music.wav')
    and ultra-subtle, non-cheesy low-passed air-whoosh/soft-felt transition accents ('sfx-transitions.wav')."""
    n_samples = total_frames * SPF
    t = np.arange(n_samples, dtype=np.float64) / SR

    # 92 BPM chill tech-review progression: Fmaj9 -> Em7 -> Dm9 -> Cmaj9 (2 bars = 5.217s per loop)
    bpm = 92.0
    beat_sec = 60.0 / bpm
    bar_sec = 4.0 * beat_sec
    chords = [
        # (bass_hz, [chord_hz...])
        (87.31, [174.61, 220.00, 261.63, 329.63, 392.00]),   # Fmaj9
        (82.41, [164.81, 196.00, 246.94, 293.66, 392.00]),   # Em7
        (73.42, [146.83, 174.61, 220.00, 261.63, 329.63]),   # Dm9
        (65.41, [130.81, 164.81, 196.00, 246.94, 293.66]),   # Cmaj9
    ]

    left = np.zeros(n_samples, dtype=np.float64)
    right = np.zeros(n_samples, dtype=np.float64)

    n_bars = int(np.ceil((n_samples / SR) / bar_sec)) + 1
    rng = np.random.default_rng(42)

    for b_idx in range(n_bars):
        c_start = int(b_idx * bar_sec * SR)
        if c_start >= n_samples:
            break
        c_len = min(int(bar_sec * SR * 1.08), n_samples - c_start)
        ct = np.arange(c_len, dtype=np.float64) / SR
        bass_hz, notes = chords[b_idx % len(chords)]

        # Warm electric piano (Rhodes) pad with gentle tremolo & bell attack
        env = (1.0 - np.exp(-ct / 0.035)) * np.exp(-ct / (bar_sec * 0.85))
        env *= np.linspace(1.0, 0.0, c_len) ** 0.35
        trem_l = 1.0 + 0.12 * np.sin(2 * np.pi * 3.2 * ct)
        trem_r = 1.0 + 0.12 * np.cos(2 * np.pi * 3.2 * ct)

        pad_l = np.zeros(c_len)
        pad_r = np.zeros(c_len)
        for n_i, f_hz in enumerate(notes):
            # Slight detune & stereo spread per voice
            tone = np.sin(2 * np.pi * f_hz * ct) + 0.18 * np.sin(2 * np.pi * (f_hz * 2.0) * ct) * np.exp(-ct / 0.35)
            pan = 0.25 + 0.5 * (n_i / max(1, len(notes) - 1))
            pad_l += tone * np.cos(pan * np.pi / 2)
            pad_r += tone * np.sin(pan * np.pi / 2)

        # Warm sub-bass on beats 1 and 2.5
        bass = np.zeros(c_len)
        for b_off in (0.0, 1.5 * beat_sec, 2.5 * beat_sec):
            bs = int(b_off * SR)
            if bs < c_len:
                bl = min(int(1.4 * beat_sec * SR), c_len - bs)
                bt = np.arange(bl) / SR
                b_env = (1.0 - np.exp(-bt / 0.018)) * np.exp(-bt / 0.55)
                bass[bs: bs + bl] += (np.sin(2 * np.pi * bass_hz * bt) + 0.25 * np.sin(2 * np.pi * bass_hz * 2 * bt)) * b_env

        left[c_start: c_start + c_len] += 0.18 * pad_l * env * trem_l + 0.22 * bass
        right[c_start: c_start + c_len] += 0.18 * pad_r * env * trem_r + 0.22 * bass

    # Soft lo-fi pulse kick & brushed hat per beat
    n_beats = int((n_samples / SR) / (beat_sec / 2))
    for step in range(n_beats):
        st = int(step * (beat_sec / 2) * SR)
        if st + int(0.18 * SR) >= n_samples:
            break
        if step % 4 == 0:
            # Soft warm heartbeat kick (52Hz..95Hz pitch drop)
            kl = int(0.14 * SR)
            kt = np.arange(kl) / SR
            f_inst = 52.0 + 48.0 * np.exp(-kt / 0.022)
            phase = 2 * np.pi * np.cumsum(f_inst) / SR
            k_wave = np.sin(phase) * np.exp(-kt / 0.048) * 0.18
            left[st: st + kl] += k_wave
            right[st: st + kl] += k_wave
        elif step % 4 == 2:
            # Ultra-soft muted rim/brush
            rl = int(0.055 * SR)
            rt = np.arange(rl) / SR
            noise = rng.standard_normal(rl) * np.exp(-rt / 0.012) * 0.035
            left[st: st + rl] += noise * 0.9
            right[st: st + rl] += noise * 1.1

    # Low-pass filter at 1750 Hz so music stays warm and never competes with voice clarity
    sos_lp = butter(3, 1750, "lp", fs=SR, output="sos")
    sos_hp = butter(2, 48, "hp", fs=SR, output="sos")
    left = sosfilt(sos_hp, sosfilt(sos_lp, left))
    right = sosfilt(sos_hp, sosfilt(sos_lp, right))

    # Normalize music to -18 LUFS (then ducked in Remotion to sit around -28 LUFS under speech)
    cur_lufs = calc_lufs_mono(0.5 * (left + right))
    gain = 10 ** ((-18.0 - cur_lufs) / 20)
    left *= gain
    right *= gain

    # Smooth 0.6s fade-in and 1.2s fade-out
    fi = int(0.6 * SR)
    fo = int(1.2 * SR)
    left[:fi] *= np.linspace(0, 1, fi)
    right[:fi] *= np.linspace(0, 1, fi)
    left[-fo:] *= np.linspace(1, 0, fo)
    right[-fo:] *= np.linspace(1, 0, fo)

    # Save bg-music.wav
    ff = f"{ROOT}/node_modules/@remotion/compositor-darwin-arm64/ffmpeg"
    tmp_m = f"{ROOT}/pipeline/speech/_bgm32.wav"
    stereo_m = np.stack([np.clip(left, -0.95, 0.95), np.clip(right, -0.95, 0.95)], axis=-1)
    wavfile.write(tmp_m, SR, (stereo_m * (2 ** 31 - 1)).astype(np.int32))
    subprocess.run([ff, "-v", "error", "-y", "-i", tmp_m, "-c:a", "pcm_s24le", f"{ROOT}/public/audio/bg-music.wav"],
                   check=True, env={**os.environ, "DYLD_LIBRARY_PATH": os.path.dirname(ff)})
    os.remove(tmp_m)

    # Generate subtle, warm, organic transition SFX ('sfx-transitions.wav') ONLY at key transitions
    sfx_l = np.zeros(n_samples, dtype=np.float64)
    sfx_r = np.zeros(n_samples, dtype=np.float64)
    for f_tr, kind in transition_frames:
        center = int(f_tr * SPF)
        dur = int(0.18 * SR) if kind == "major" else int(0.12 * SR)
        s0 = max(0, center - dur // 2)
        s1 = min(n_samples, s0 + dur)
        L = s1 - s0
        if L < 400:
            continue
        st = np.arange(L) / SR
        win = np.sin(np.pi * np.arange(L) / L) ** 1.6
        # Filtered warm air whoosh + soft felt thump (zero harsh high-frequency clicks!)
        raw_n = rng.standard_normal(L)
        sos_bp = butter(2, [140, 680 if kind == "major" else 520], "bp", fs=SR, output="sos")
        whoosh = sosfilt(sos_bp, raw_n) * win
        whoosh /= (np.abs(whoosh).max() + 1e-9)
        thump = np.sin(2 * np.pi * (95.0 * np.exp(-st / 0.04)) * st) * np.exp(-st / 0.045)
        amp = 0.14 if kind == "major" else 0.08
        pan_env = np.linspace(0.35, 0.65, L)
        sig_m = amp * (0.65 * whoosh + 0.35 * thump)
        sfx_l[s0:s1] += sig_m * np.cos(pan_env * np.pi / 2) * 1.4
        sfx_r[s0:s1] += sig_m * np.sin(pan_env * np.pi / 2) * 1.4

    tmp_s = f"{ROOT}/pipeline/speech/_sfx32.wav"
    stereo_s = np.stack([np.clip(sfx_l, -0.95, 0.95), np.clip(sfx_r, -0.95, 0.95)], axis=-1)
    wavfile.write(tmp_s, SR, (stereo_s * (2 ** 31 - 1)).astype(np.int32))
    subprocess.run([ff, "-v", "error", "-y", "-i", tmp_s, "-c:a", "pcm_s24le", f"{ROOT}/public/audio/sfx-transitions.wav"],
                   check=True, env={**os.environ, "DYLD_LIBRARY_PATH": os.path.dirname(ff)})
    os.remove(tmp_s)
    print(f"BG MUSIC & SUBTLE SFX GENERATED: {len(transition_frames)} tasteful transition cues")


def build_everything():
    wavs = {sid: load_speech_wav(sid) for sid in ("intro", "take1", "take2")}
    raw_words = {sid: load_words(sid) for sid in ("intro", "take1", "take2")}
    src_files = {s["id"]: s["file"] for s in json.load(open(f"{ROOT}/pipeline/sources.json"))["sources"]}

    xf_samples = int(0.030 * SR)  # 30ms smooth fade at silent valley boundaries
    t_xf = np.linspace(0, np.pi / 2, xf_samples)
    fade_in, fade_out = np.sin(t_xf), np.cos(t_xf)

    segments_meta = []
    timeline_words = []
    broll_cuts = []
    audio_chunks = []
    cursor_frames = 0
    intro_end_frame = 0

    for idx, (sid, t0, t1, mode, broll_specs, label) in enumerate(AUDIO_BLOCKS):
        f0 = int(round(t0 * FPS))
        f1 = int(round(t1 * FPS))
        slot_frames = f1 - f0

        s0, s1 = f0 * SPF, f1 * SPF
        raw_seg = wavs[sid][s0:s1].copy()
        proc_seg = master_voice_segment(raw_seg)

        if len(proc_seg) > 2 * xf_samples:
            proc_seg[:xf_samples] *= fade_in
            proc_seg[-xf_samples:] *= fade_out

        audio_chunks.append(proc_seg)
        tl_start_sec = cursor_frames / FPS

        if idx == 7:
            # Block 7 ("alabilirsiniz, öneriyorum, gerçekten hiç düşünmenize bile gerek yok.")
            # Acoustically spoken across 89.50s .. 93.35s in take1
            b7_words = [
                ("alabilirsiniz,", 89.50, 90.25),
                ("öneriyorum,", 90.35, 90.95),
                ("gerçekten", 91.05, 91.95),
                ("hiç", 92.00, 92.35),
                ("düşünmenize", 92.38, 92.85),
                ("bile", 92.85, 93.08),
                ("gerek", 93.08, 93.25),
                ("yok.", 93.25, 93.55),
            ]
            for w_txt, ws_src, we_src in b7_words:
                ws = tl_start_sec + (ws_src - t0)
                we = tl_start_sec + (we_src - t0)
                timeline_words.append({
                    "word": w_txt,
                    "startSec": round(ws, 3),
                    "endSec": round(we, 3),
                    "startFrame": int(round(ws * FPS)),
                    "endFrame": int(round(we * FPS)),
                    "segmentIndex": idx,
                })
        else:
            for w in raw_words[sid]:
                if sid == "intro" and w["end"] <= 6.80:
                    continue
                if idx == 1 and w["start"] >= 12.35:
                    continue
                if idx == 3 and w["start"] >= 58.92:
                    continue
                if idx == 5 and w["start"] >= 34.60:
                    continue
                if idx == 6 and w["end"] <= 60.18:
                    continue
                ov_s = max(w["start"], t0)
                ov_e = min(w["end"], t1)
                if ov_e - ov_s >= 0.04:
                    ws = tl_start_sec + max(0.0, w["start"] - t0)
                    we = tl_start_sec + min(slot_frames / FPS, max(w["end"] - t0, (w["start"] - t0) + 0.12))
                    if sid == "intro" and idx == 0 and w["word"] == "3'e" and ws < 0.70:
                        ws = 0.45
                    if we > ws + 1.1:
                        ws = we - 0.65
                    timeline_words.append({
                        "word": w["word"],
                        "startSec": round(ws, 3),
                        "endSec": round(we, 3),
                        "startFrame": int(round(ws * FPS)),
                        "endFrame": int(round(we * FPS)),
                        "segmentIndex": idx,
                    })

        if idx == 0:
            timeline_words.insert(0, {
                "word": "DJI",
                "startSec": 0.15,
                "endSec": 0.45,
                "startFrame": 9,
                "endFrame": 27,
                "segmentIndex": 0,
            })
            intro_end_frame = slot_frames
        elif idx == 4:
            # Insert "Burada" at start of Block 4 (61.40..61.48s in take2)
            ws_b = tl_start_sec + 0.04
            we_b = tl_start_sec + 0.14
            timeline_words.insert(len(timeline_words) - 14, {
                "word": "Burada",
                "startSec": round(ws_b, 3),
                "endSec": round(we_b, 3),
                "startFrame": int(round(ws_b * FPS)),
                "endFrame": int(round(we_b * FPS)),
                "segmentIndex": idx,
            })

        # Build choreographed B-roll cuts for Phase 2 segments
        if mode == "unboxing_broll" and broll_specs:
            rem = slot_frames
            cur_sub = 0
            for b_i, (b_src, b_start_sec, weight, sub_label) in enumerate(broll_specs):
                b_dur = rem if b_i == len(broll_specs) - 1 else int(round(slot_frames * weight))
                rem -= b_dur
                bf0 = int(round(b_start_sec * FPS))
                bf1 = bf0 + b_dur
                fx, fy = compute_focus(b_src, b_start_sec, b_start_sec + b_dur / FPS)
                broll_cuts.append({
                    "index": len(broll_cuts),
                    "srcId": b_src,
                    "file": src_files[b_src],
                    "srcStartFrame": bf0,
                    "srcEndFrame": bf1,
                    "srcStartSec": round(bf0 / FPS, 3),
                    "srcEndSec": round(bf1 / FPS, 3),
                    "timelineFrom": cursor_frames + cur_sub,
                    "durationFrames": b_dur,
                    "score": 100.0,
                    "focusX": fx,
                    "focusY": fy,
                    "label": sub_label,
                })
                cur_sub += b_dur

        segments_meta.append({
            "index": idx,
            "sourceId": sid,
            "mode": mode,
            "speakerVideo": f"speaker/{sid}.mp4",
            "srcStartFrame": f0,
            "srcEndFrame": f1,
            "srcStartSec": round(f0 / FPS, 3),
            "srcEndSec": round(f1 / FPS, 3),
            "timelineFromFrame": cursor_frames,
            "speechDurationFrames": slot_frames,
            "pauseAfterFrames": 0,
            "durationFrames": slot_frames,
            "timelineStartSec": round(tl_start_sec, 3),
            "timelineEndSec": round((cursor_frames + slot_frames) / FPS, 3),
            "label": label,
        })
        cursor_frames += slot_frames

    full_vo = np.concatenate(audio_chunks)
    master_vo = compress_and_limit_voice(full_vo, target_lufs=-13.0, ceiling_db=-1.0)

    os.makedirs(f"{ROOT}/public/audio", exist_ok=True)
    tmp_wav = f"{ROOT}/pipeline/speech/_vo32.wav"
    stereo_vo = np.stack([master_vo, master_vo], axis=-1)
    wavfile.write(tmp_wav, SR, (np.clip(stereo_vo, -1, 1) * (2 ** 31 - 1)).astype(np.int32))
    ff = f"{ROOT}/node_modules/@remotion/compositor-darwin-arm64/ffmpeg"
    subprocess.run([ff, "-v", "error", "-y", "-i", tmp_wav, "-c:a", "pcm_s24le", f"{ROOT}/public/audio/voiceover-master.wav"],
                   check=True, env={**os.environ, "DYLD_LIBRARY_PATH": os.path.dirname(ff)})
    os.remove(tmp_wav)

    # Save cuts-manifest.json
    broll_total_frames = sum(c["durationFrames"] for c in broll_cuts)
    cuts_manifest = {
        "fps": FPS,
        "sampleRate": SR,
        "sourceSize": {"width": 3840, "height": 2160},
        "handles": {"preRollSec": 0.2, "postRollSec": 0.25},
        "crossfadeMs": 35,
        "brollStartFrame": intro_end_frame,
        "brollStartSec": round(intro_end_frame / FPS, 3),
        "totalFrames": broll_total_frames,
        "totalSec": round(broll_total_frames / FPS, 3),
        "cuts": broll_cuts,
    }
    json.dump(cuts_manifest, open(f"{ROOT}/src/data/cuts-manifest.json", "w"), indent=2)

    # Build tasteful transition cues (Intro card transitions + Major Unboxing chapter transitions)
    transition_frames = [
        (int(2.60 * FPS), "soft"),     # Intro card 1 -> VS comparison
        (int(5.20 * FPS), "soft"),     # Intro -> DJI Mic Mini 2 card
        (int(9.80 * FPS), "soft"),     # Intro -> 109€ vs 269€ comparison
        (int(15.80 * FPS), "soft"),    # Intro -> Box teaser video
        (intro_end_frame, "major"),    # "Videoya geçelim!" -> Full-screen Unboxing Lidl knife cut!
    ]
    # Add soft transition cues at major unboxing chapter boundaries
    for seg in segments_meta[2:]:
        transition_frames.append((seg["timelineFromFrame"], "soft"))

    generate_chill_bg_music_and_sfx(cursor_frames, transition_frames)
    print(f"INTRO END: frame {intro_end_frame} ({intro_end_frame/FPS:.2f}s) | UNBOXING B-ROLL: {len(broll_cuts)} cuts ({broll_total_frames/FPS:.2f}s)")

    return master_vo, segments_meta, timeline_words, cursor_frames, intro_end_frame


def compute_ducking_regions(master_vo, total_frames, intro_end_frame):
    hop = SPF
    n = min(total_frames, len(master_vo) // hop)
    rms = np.sqrt((master_vo[: n * hop].reshape(n, hop) ** 2).mean(1)) + 1e-9
    db = 20 * np.log10(rms)
    active = db > -38.0

    min_gap_frames = int(round(0.20 * FPS))
    i = intro_end_frame
    while i < n:
        if not active[i]:
            j = i
            while j < n and not active[j]:
                j += 1
            if (j - i) < min_gap_frames and i > intro_end_frame and j < n:
                active[i:j] = True
            i = j
        else:
            i += 1

    lookahead_frames = int(round(0.050 * FPS))
    regions = []
    i = intro_end_frame
    while i < n:
        if active[i]:
            j = i
            while j < n and active[j]:
                j += 1
            if j - i >= 4:
                f_start = max(intro_end_frame, i - lookahead_frames)
                f_end = min(total_frames, j + 2)
                if regions and f_start - regions[-1]["toFrame"] < min_gap_frames:
                    regions[-1]["toFrame"] = f_end
                else:
                    regions.append({
                        "fromFrame": int(f_start),
                        "toFrame": int(f_end),
                        "duckDb": -12.0,
                        "attackMs": 50,
                        "releaseMs": 140,
                    })
            i = j
        else:
            i += 1
    return regions


EMPHASIS_WORDS = {
    "iki", "katı", "kesinlikle", "izlemelisin",
    "dji", "dji'nın", "mini", "2'si", "3'e", "yarı", "fiyatına",
    "109", "euro'ya", "euro", "259", "kutu", "açılımını", "videoya", "geçelim",
    "lidl'dan", "bıçakla", "büyük", "poşet", "kaliteli", "el", "çantası",
    "modifiye", "rengarenk", "değiştirebiliyorsun",
    "mikrofon", "aparatlarınızı", "cidden", "kameraya", "orijinal", "klasik",
    "yakaya", "mıknatıs", "aşırı", "güçlü", "açamamıştım", "zorlanmıştım",
    "usb-c'yi", "çok", "sevdim", "metalken", "plastik", "şarj",
    "premium", "ses", "kalitesine", "bayıldım", "mutlu", "öneriyorum", "hiç", "gerek", "yok",
}


def is_emphasis_word(w):
    clean = w.strip(".,!?\"'’").lower()
    return clean in EMPHASIS_WORDS


def build_subtitles(timeline_words, hook_end_sec=3.80):
    words = sorted(timeline_words, key=lambda x: x["startSec"])
    words = [w for w in words if w["endSec"] > hook_end_sec + 0.02]
    if words and words[0]["startSec"] < hook_end_sec:
        words[0] = {**words[0], "startSec": hook_end_sec, "startFrame": int(round(hook_end_sec * FPS))}

    captions = []
    buf = []

    def flush():
        if not buf:
            return
        text = " ".join(x["word"] for x in buf)
        s_frame = buf[0]["startFrame"]
        e_frame = max(buf[-1]["endFrame"], s_frame + 10)
        cap_words = []
        for x in buf:
            cap_words.append({
                "word": x["word"],
                "startFrame": int(x["startFrame"]),
                "endFrame": int(max(x["endFrame"], x["startFrame"] + 6)),
                "emphasis": bool(is_emphasis_word(x["word"])),
            })
        captions.append({
            "index": len(captions),
            "text": text,
            "fromFrame": s_frame,
            "toFrame": e_frame,
            "startSec": round(s_frame / FPS, 3),
            "endSec": round(e_frame / FPS, 3),
            "wordCount": len(buf),
            "words": cap_words,
        })
        buf.clear()

    for w in words:
        if not buf:
            buf.append(w)
            continue
        cand_text = " ".join([x["word"] for x in buf] + [w["word"]])
        gap = w["startSec"] - buf[-1]["endSec"]
        prev_punct = buf[-1]["word"].endswith((".", ",", "!", "?"))
        if gap > 0.32 or (prev_punct and len(buf) >= 2) or len(buf) >= 4 or (len(cand_text) > 24 and len(buf) >= 2):
            flush()
            buf.append(w)
        elif len(cand_text) > 25:
            flush()
            buf.append(w)
        else:
            buf.append(w)
    flush()

    for i in range(len(captions) - 1):
        gap_f = captions[i + 1]["fromFrame"] - captions[i]["toFrame"]
        if 0 < gap_f <= 8 or gap_f < 0:
            captions[i]["toFrame"] = captions[i + 1]["fromFrame"]
            captions[i]["endSec"] = captions[i + 1]["startSec"]

    return captions


if __name__ == "__main__":
    master_vo, segments_meta, timeline_words, total_frames, intro_end_frame = build_everything()
    ducking = compute_ducking_regions(master_vo, total_frames, intro_end_frame)
    captions = build_subtitles(timeline_words, hook_end_sec=5.20)

    vo_manifest = {
        "fps": FPS,
        "sampleRate": SR,
        "totalFrames": total_frames,
        "totalSec": round(total_frames / FPS, 3),
        "introEndFrame": intro_end_frame,
        "introEndSec": round(intro_end_frame / FPS, 3),
        "hookDurationSec": 5.20,
        "hookDurationFrames": int(round(5.20 * FPS)),
        "hookTitle": {
            "line1": "DJI Mic 3’e 2 Katı Verme!",
            "line2": "109€ Mic Mini 2 Değer Mi?",
        },
        "voiceoverAudioFile": "audio/voiceover-master.wav",
        "asmrAudioFile": "audio/asmr-cuts-master.wav",
        "bgMusicFile": "audio/bg-music.wav",
        "sfxFile": "audio/sfx-transitions.wav",
        "segments": segments_meta,
        "duckingRegions": ducking,
        "captions": captions,
        "words": timeline_words,
    }
    json.dump(vo_manifest, open(f"{ROOT}/src/data/voiceover-manifest.json", "w"), indent=2, ensure_ascii=False)
    print(f"COMPLETE: total={total_frames} frames ({total_frames/FPS:.2f}s), introEnd={intro_end_frame} ({intro_end_frame/FPS:.2f}s), captions={len(captions)}")
