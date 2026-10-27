#!/usr/bin/env bash
# Bina versi web (PWA) Wazlee ke folder dist/ — digunakan oleh .github/workflows/pages.yml
set -euo pipefail
OUT=${1:-dist}
rm -rf "$OUT" && cp -r www "$OUT"
mkdir -p "$OUT/sounds"
cp assets/sounds/azan.mp3 "$OUT/sounds/" 2>/dev/null || true
cp assets/sounds/azan_subuh.mp3 "$OUT/sounds/" 2>/dev/null || true
echo 'window.WZ_FLAGS = { azan: true, web: true };' > "$OUT/build-flags.js"
[ -n "${WZ_DOMAIN:-}" ] && echo "$WZ_DOMAIN" > "$OUT/CNAME"
touch "$OUT/.nojekyll"
# Senarai app shell untuk cache luar talian (tanpa surah, peta & bunyi — dicache bila dibuka)
SHELL=$(cd "$OUT" && { echo "./"; find . -type f \( -name '*.html' -o -name '*.css' -o -name '*.js' -o -name '*.webmanifest' -o -name '*.png' -o -name '*.svg' -o -name '*.woff2' -o -name '*.ttf' \) \
  ! -path './quran/s/*' ! -name 'maplibre-gl.js' ! -name 'sw.js' | sed 's|^\./||' | sort; echo "quran/index.json"; } | python3 -c 'import json,sys;print(json.dumps([l.strip() for l in sys.stdin if l.strip()]))')
BUILD=${GITHUB_SHA:-local}; BUILD=${BUILD:0:8}-$(date +%s)
python3 - "$OUT/sw.js" "$BUILD" "$SHELL" <<'PY'
import sys; p,b,s=sys.argv[1:4]; t=open(p).read().replace('__BUILD__',b).replace('__SHELL__',s); open(p,'w').write(t)
PY
echo "PWA siap: $OUT ($(echo "$SHELL" | python3 -c 'import json,sys;print(len(json.load(sys.stdin)))') fail shell)"
