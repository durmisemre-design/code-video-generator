"""Generates lightweight, instant-seeking 1080p 60fps All-Intra (-g 1) MP4 clips for each cut in cuts-manifest.json
so Remotion Studio plays back at 60 FPS with ZERO black frames or seek delay."""
import json, os, subprocess
from concurrent.futures import ThreadPoolExecutor

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
D = f"{ROOT}/node_modules/@remotion/compositor-darwin-arm64"
FF = f"{D}/ffmpeg"
ENV = {**os.environ, "DYLD_LIBRARY_PATH": D}

def make_clip(task):
    in_file, start_sec, dur_sec, out_rel = task
    out_path = f"{ROOT}/public/{out_rel}"
    os.makedirs(os.path.dirname(out_path), exist_ok=True)
    subprocess.run([
        FF, "-v", "error", "-y",
        "-ss", f"{start_sec:.4f}",
        "-t", f"{dur_sec:.4f}",
        "-i", f"{ROOT}/{in_file}",
        "-map", "0:v:0", "-an",
        "-vf", "scale='if(gt(iw,ih),1920,1080)':'if(gt(iw,ih),1080,1920)':flags=bilinear,format=yuv420p",
        "-r", "60",
        "-c:v", "h264_videotoolbox", "-b:v", "18M", "-g", "1",
        "-movflags", "+faststart",
        out_path
    ], check=True, env=ENV)
    return out_rel

def main():
    manifest_path = f"{ROOT}/src/data/cuts-manifest.json"
    manifest = json.load(open(manifest_path))
    fps = manifest["fps"]

    tasks = []
    # Also transcode the Intro top-window teaser clip (C002 @ 4.2s for 7.2s)
    tasks.append(("public/A001_10281632_C002.mov", 4.20, 7.20, "clips/intro_teaser.mp4"))

    for c in manifest["cuts"]:
        idx = c["index"]
        raw_file = c.get("rawFile", c["file"])
        c["rawFile"] = raw_file
        start_sec = c.get("rawStartSec", c["srcStartSec"])
        c["rawStartSec"] = start_sec
        dur_sec = (c["durationFrames"] + 6) / fps
        clip_rel = f"clips/cut_{idx:02d}.mp4"
        tasks.append((raw_file, start_sec, dur_sec, clip_rel))
        c["file"] = f"public/{clip_rel}"
        c["srcStartFrame"] = 0
        c["srcEndFrame"] = c["durationFrames"]
        c["srcStartSec"] = 0.0
        c["srcEndSec"] = round(c["durationFrames"] / fps, 3)

    with ThreadPoolExecutor(6) as ex:
        for done in ex.map(make_clip, tasks):
            print("ready:", done, flush=True)

    json.dump(manifest, open(manifest_path, "w"), indent=2)
    print(f"ALL {len(tasks)} FAST PROXY CLIPS GENERATED!")

if __name__ == "__main__":
    main()
