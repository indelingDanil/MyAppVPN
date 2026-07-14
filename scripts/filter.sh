#!/usr/bin/env bash
# Два прохода xray-knife:
#   Pass A — живость + доступность Telegram через проксю (быстро, без speedtest).
#            xray-knife с -u <telegram> помечает конфиг "passed" только если этот
#            URL реально открывается ЧЕРЕЗ проксю. txt-вывод содержит ТОЛЬКО passed.
#   Pass B — грубый замер скорости (speedtest через speed.cloudflare.com) только
#            по выжившим из A. CSV-вывод со столбцом download (mbps).
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
XK="${XK:-xray-knife}"

ALL="$ROOT/all.txt"
SURV="$ROOT/survivors_tg.txt"
CSV="$ROOT/results.csv"

TG_URL="${TG_URL:-https://web.telegram.org/}"
MAX_DELAY="${MAX_DELAY:-5000}"
PASS_A_THREADS="${PASS_A_THREADS:-100}"
PASS_B_THREADS="${PASS_B_THREADS:-30}"
RETRIES="${RETRIES:-1}"

if [ ! -s "$ALL" ]; then
  echo "all.txt пуст или отсутствует — запустите fetch.sh" >&2
  exit 1
fi

rm -f "$SURV" "$CSV"

echo "=== Pass A: живость + Telegram ($TG_URL), потоков=$PASS_A_THREADS ===" >&2
"$XK" http \
  -f "$ALL" \
  -u "$TG_URL" \
  -t "$PASS_A_THREADS" \
  -d "$MAX_DELAY" \
  --retries "$RETRIES" \
  --rip=false \
  -o "$SURV" -x txt

A_COUNT="$(grep -cE '://' "$SURV" 2>/dev/null || true)"
echo "Pass A выжило (alive + Telegram): ${A_COUNT:-0}" >&2

if [ ! -s "$SURV" ]; then
  echo "После Pass A никто не выжил — Pass B пропускаем." >&2
  # оставляем пустой results.csv, build_output разберётся
  : > "$CSV"
  exit 0
fi

echo "=== Pass B: speedtest по выжившим, потоков=$PASS_B_THREADS ===" >&2
"$XK" http \
  -f "$SURV" \
  -u "$TG_URL" \
  -p \
  -t "$PASS_B_THREADS" \
  -d "$MAX_DELAY" \
  --rip=false \
  -o "$CSV" -x csv

echo "Pass B готово -> $CSV" >&2
