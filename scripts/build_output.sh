#!/usr/bin/env bash
# Собирает финальные артефакты в output/:
#   filtered.txt      — plain-список рабочих конфигов (быстрые сверху, cap top-N)
#   filtered_b64.txt  — base64 того же списка (подписка для v2rayN)
#   stats.md          — было / прошли Telegram / прошли по скорости + дата
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
OUT="$ROOT/output"
mkdir -p "$OUT"

ALL="$ROOT/all.txt"
SURV="$ROOT/survivors_tg.txt"
CSV="$ROOT/results.csv"

MIN_MBPS="${MIN_MBPS:-8}"   # 1 МБ/с = 8 Мбит/с (download в CSV — mbps)
CAP="${CAP:-500}"

python3 "$ROOT/scripts/select.py" "$CSV" "$MIN_MBPS" "$CAP" > "$OUT/filtered.txt"

# base64-подписка (без переносов) для клиентов вроде v2rayN
if [ -s "$OUT/filtered.txt" ]; then
  base64 -w0 "$OUT/filtered.txt" > "$OUT/filtered_b64.txt"
else
  : > "$OUT/filtered_b64.txt"
fi

N="$(grep -cE '://' "$ALL" 2>/dev/null || echo 0)"
A="$(grep -cE '://' "$SURV" 2>/dev/null || echo 0)"
K="$(grep -cE '://' "$OUT/filtered.txt" 2>/dev/null || echo 0)"
NOW="$(date -u '+%Y-%m-%d %H:%M UTC')"

cat > "$OUT/stats.md" <<EOF
# Статистика фильтрации

Обновлено: **$NOW**

| Этап | Кол-во |
|------|-------:|
| Уникальных конфигов (all) | $N |
| Прошли Cloudflare + живость | $A |
| Прошли по скорости (≥ ${MIN_MBPS} Мбит/с), cap top-$CAP | $K |

> Скорость мерилась с runner'а GitHub (дата-центр, обычно США) — это **грубый** отсев.
> Реальную скорость из вашего ISP смотрите локально в v2rayN: правый клик по группе → «тест скорости».
EOF

echo "Готово: all=$N, cf=$A, speed=$K -> $OUT/" >&2
