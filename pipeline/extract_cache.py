"""Stage-1 analysis cache: decodes low-res motion + per-track audio of every source (read-only on sources)."""
import subprocess, sys, os, numpy as np, json
from concurrent.futures import ThreadPoolExecutor
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FF = f"{ROOT}/node_modules/@remotion/compositor-darwin-arm64/ffmpeg"
ENV = {**os.environ, "DYLD_LIBRARY_PATH": f"{ROOT}/node_modules/@remotion/compositor-darwin-arm64"}
SRC = json.load(open(f"{ROOT}/pipeline/sources.json"))["sources"]
W, H, FPS = 96, 54, 20

def audio(s, i):
    out = f"{ROOT}/pipeline/cache/{s['id']}_a{i}.npy"
    if os.path.exists(out): return
    wav = out.replace(".npy", ".wav")
    subprocess.run([FF, "-v", "error", "-y", "-i", f"{ROOT}/{s['file']}", "-map", f"0:a:{i}", "-vn", "-ac", "1", "-ar", "48000", "-c:a", "pcm_s24le", wav], check=True, env=ENV)
    from scipy.io import wavfile
    sr, d = wavfile.read(wav)  # 24-bit decoded as int32 left-justified
    np.save(out, (d.astype(np.float64) / 2**31).astype(np.float32)); os.remove(wav)

def video(s):
    out = f"{ROOT}/pipeline/cache/{s['id']}_motion.npy"
    if os.path.exists(out): return
    p = subprocess.run([FF, "-v", "error", "-threads", "4", "-i", f"{ROOT}/{s['file']}", "-map", "0:v:0", "-vf", f"scale={W}:{H}:flags=area", "-r", str(FPS), "-pix_fmt", "gray", "-c:v", "rawvideo", "-f", "image2pipe", "-"], capture_output=True, env=ENV, check=True)
    np.save(out, np.frombuffer(p.stdout, dtype=np.uint8).reshape(-1, H, W))

if __name__ == "__main__":
    with ThreadPoolExecutor(6) as ex:
        list(ex.map(lambda a: audio(*a), [(s, i) for s in SRC for i in range(4)]))
        print("audio done", flush=True)
        list(ex.map(video, SRC))
    print("video done")
