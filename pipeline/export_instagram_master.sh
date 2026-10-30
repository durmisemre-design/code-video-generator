#!/usr/bin/env bash
set -e

ROOT="/Users/emre/Desktop/Video animation"
FF="$ROOT/node_modules/@remotion/compositor-darwin-arm64/ffmpeg"
export DYLD_LIBRARY_PATH="$ROOT/node_modules/@remotion/compositor-darwin-arm64"

INPUT_RENDER="$ROOT/out/render-4k-master.mp4"
MASTER_AUDIO="$ROOT/public/audio/voice-mastered.wav"
OUT_FILE="$ROOT/out/instagram-reels-4k-master.mp4"
DESKTOP_FILE="/Users/emre/Desktop/instagram-reels-4k-master.mp4"

echo "=== Muxing and Mastering Final 4K 60FPS Instagram Video ==="
"$FF" -v error -y \
  -i "$INPUT_RENDER" \
  -i "$MASTER_AUDIO" \
  -map 0:v:0 \
  -map 1:a:0 \
  -c:v h264_videotoolbox \
  -b:v 60M \
  -pix_fmt yuv420p \
  -color_primaries bt709 -color_trc bt709 -colorspace bt709 \
  -c:a aac \
  -b:a 320k \
  -ar 48000 \
  -movflags +faststart \
  "$OUT_FILE"

cp "$OUT_FILE" "$DESKTOP_FILE"
echo "=== EXPORT COMPLETE ==="
echo "Master saved to: $OUT_FILE"
echo "Desktop copy: $DESKTOP_FILE"

