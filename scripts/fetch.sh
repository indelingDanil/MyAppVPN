#!/usr/bin/env bash
# Скачивает все подписки из sources.txt, декодирует base64 при необходимости,
# оставляет только строки-конфиги и делает семантический дедуп -> all.txt
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SOURCES="$ROOT/sources.txt"
OUT="$ROOT/all.txt"

# Приложение MyAppVPN понимает только VLESS — фильтруем и публикуем только его.
SCHEMES='vless://'

TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT
RAW="$TMP/raw.txt"
: > "$RAW"

if [ ! -f "$SOURCES" ]; then
  echo "sources.txt не найден: $SOURCES" >&2
  exit 1
fi

while IFS= read -r line || [ -n "$line" ]; do
  url="$(printf '%s' "$line" | tr -d '[:space:]')"
  [ -z "$url" ] && continue
  case "$url" in \#*) continue ;; esac

  # github.com/OWNER/REPO/raw/[refs/heads/]BRANCH/PATH отдаёт 302-редирект и
  # часто ратлимитится с IP Actions-раннера (тогда часть источников молча
  # отваливается). Бьём НАПРЯМУЮ в raw.githubusercontent.com — 200, CDN, без редиректа.
  url="$(printf '%s' "$url" \
    | sed -E 's#^https?://github\.com/([^/]+)/([^/]+)/raw/refs/heads/#https://raw.githubusercontent.com/\1/\2/#' \
    | sed -E 's#^https?://github\.com/([^/]+)/([^/]+)/raw/#https://raw.githubusercontent.com/\1/\2/#')"

  echo "Fetching: $url" >&2
  body="$(curl -fsSL --max-time 90 --retry 4 --retry-delay 3 --retry-all-errors "$url" 2>/dev/null || true)"
  if [ -z "$body" ]; then
    echo "  -> пусто/ошибка, пропуск" >&2
    continue
  fi

  before="$(grep -acE "$SCHEMES" "$RAW" 2>/dev/null || true)"
  if printf '%s' "$body" | grep -qiE "$SCHEMES"; then
    printf '%s\n' "$body" >> "$RAW"
  else
    decoded="$(printf '%s' "$body" | base64 -d 2>/dev/null || true)"
    if printf '%s' "$decoded" | grep -qiE "$SCHEMES"; then
      printf '%s\n' "$decoded" >> "$RAW"
      echo "  -> декодировано из base64" >&2
    else
      echo "  -> конфигов не найдено, пропуск" >&2
      continue
    fi
  fi
  after="$(grep -acE "$SCHEMES" "$RAW" 2>/dev/null || true)"
  echo "  -> +$(( ${after:-0} - ${before:-0} )) vless (итого ${after:-0})" >&2
done < "$SOURCES"

RAW_COUNT="$(grep -acE "$SCHEMES" "$RAW" || true)"
{ grep -aiE "^$SCHEMES" "$RAW" || true; } | python3 "$ROOT/scripts/dedup.py" > "$OUT"
UNIQ_COUNT="$(grep -cE '://' "$OUT" || true)"

echo "Скачано строк-конфигов: ${RAW_COUNT:-0}" >&2
echo "Уникальных после дедупа: ${UNIQ_COUNT:-0} -> $OUT" >&2
