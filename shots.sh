#!/bin/bash
E="/c/Program Files (x86)/Microsoft/Edge/Application/msedge.exe"
D=$(cd "$(dirname "$0")" && pwd -W)
mkdir -p "$(dirname "$0")/shots"
for i in ${@:-0 1 2 3 4 5 6 7 8 9 10}; do
  "$E" --headless=new --disable-gpu --hide-scrollbars --mute-audio --window-size=1920,1080 --virtual-time-budget=4000 \
    --user-data-dir="$TEMP/edge-shots" --screenshot="$D/shots/s$i.png" "file:///$D/index.html?still#$i" 2>/dev/null
done
