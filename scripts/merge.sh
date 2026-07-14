#!/usr/bin/env bash
# Сливает per-source results.csv (из артефактов matrix-джобов) в общий список,
# семантически дедуплицирует, отбирает Reality/TLS, топ-N по скорости -> output/.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
OUT="$ROOT/output"
mkdir -p "$OUT"

ART="${ART_DIR:-$ROOT/artifacts}"
MERGED="$ROOT/results.csv"
MIN_MBPS="${MIN_MBPS:-8}"   # 1 МБ/с
CAP="${CAP:-500}"

# Собрать все CSV: заголовок один раз, дальше строки без заголовка.
: > "$MERGED"
first=1
while IFS= read -r f; do
  [ -s "$f" ] || continue
  if [ "$first" = 1 ]; then cat "$f" >> "$MERGED"; first=0
  else tail -n +2 "$f" >> "$MERGED"; fi
done < <(find "$ART" -type f -name 'results.csv' 2>/dev/null | sort)

if [ "$first" = 1 ]; then
  echo "merge: не найдено ни одного results.csv в $ART" >&2
fi

# Отбор: passed + скорость + Reality/TLS + семантический дедуп + сортировка + cap.
python3 "$ROOT/scripts/select.py" "$MERGED" "$MIN_MBPS" "$CAP" csv > "$OUT/filtered.txt"

if [ -s "$OUT/filtered.txt" ]; then
  base64 -w0 "$OUT/filtered.txt" > "$OUT/filtered_b64.txt"
else
  : > "$OUT/filtered_b64.txt"
fi

PASSED="$(grep -c ',passed,' "$MERGED" 2>/dev/null || echo 0)"
K="$(grep -cE '://' "$OUT/filtered.txt" 2>/dev/null || echo 0)"
NOW="$(date -u '+%Y-%m-%d %H:%M UTC')"

cat > "$OUT/stats.md" <<EOF
# Статистика фильтрации

Обновлено: **$NOW** · режим: **full / matrix** (каждый источник — свой параллельный job)

| Этап | Кол-во |
|------|-------:|
| Прошли Cloudflare + скорость (все источники) | $PASSED |
| В подписке (Reality/TLS, ≥ ${MIN_MBPS} Мбит/с, top-$CAP) | $K |

> Каждый источник тестируется отдельным раннером (xray-knife: проба Cloudflare + speedtest),
> результаты сливаются и дедуплицируются. Скорость с раннера (дата-центр) — грубый отсев;
> финальный отбор из вашей сети делает балансировщик приложения.
EOF

echo "merge готов: passed=$PASSED, published=$K -> $OUT/" >&2
