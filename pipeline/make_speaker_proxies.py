"""Upright 1080p all-intra proxies of the speaker videos.
Source files are 3840x2160 stored UPSIDE-DOWN with a 90deg display-matrix, so every player shows them sideways.
Correct upright landscape = raw frame rotated 180deg (hflip,vflip); metadata rotation is stripped from the proxy."""
import subprocess, os
from concurrent.futures import ThreadPoolExecutor
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
D = f"{ROOT}/node_modules/@remotion/compositor-darwin-arm64"
ENV = {**os.environ, "DYLD_LIBRARY_PATH": D}
JOBS = [("ses videosu.mov", "take1", "1920:1080", "30M"), ("ses videosu 2.mov", "take2", "1920:1080", "30M"), ("Giris videosu yatay donecek.mov", "intro", "3840:2160", "60M")]
def run(j):
    src, name, size, br = j
    out = f"{ROOT}/public/speaker/{name}.mp4"
    subprocess.run([f"{D}/ffmpeg", "-v", "error", "-y", "-noautorotate", "-display_rotation", "0", "-i", f"{ROOT}/public/{src}", "-map", "0:v:0", "-an",
                    "-vf", f"hflip,vflip,scale={size}:flags=lanczos,format=yuv420p", "-r", "60",
                    "-c:v", "h264_videotoolbox", "-b:v", br, "-g", "1", "-metadata:s:v:0", "rotate=0",
                    "-movflags", "+faststart", out], check=True, env=ENV)
    print("done", name, flush=True)
if __name__ == "__main__":
    with ThreadPoolExecutor(3) as ex: list(ex.map(run, JOBS))
