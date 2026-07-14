#!/usr/bin/env bash
# Собирает финальные артефакты в output/:
#   filtered.txt      — plain-список конфигов (Reality сверху, cap top-N)
#   filtered_b64.txt  — base64 того же списка (подписка для v2rayN)
#   stats.md          — статистика + дата
#
# MODE=light (по умолчанию): US-раннер не в состоянии честно тестить РФ-SNI Reality
#   (доказано: ~0.7% проходит), поэтому НЕ тестим скорость/живость — берём all.txt,
#   оставляем Reality/TLS, top-N. Реальный отбор (живость/скорость/Telegram) делает
#   балансировщик приложения из РФ.
# MODE=full: берём results.csv от xray-knife (status=passed + порог скорости).
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
OUT="$ROOT/output"
mkdir -p "$OUT"

ALL="$ROOT/all.txt"
SURV="$ROOT/survivors_tg.txt"
CSV="$ROOT/results.csv"

MODE="${MODE:-light}"
MIN_MBPS="${MIN_MBPS:-8}"   # 1 МБ/с = 8 Мбит/с (только в full)
CAP="${CAP:-500}"

if [ "$MODE" = "light" ]; then
  python3 "$ROOT/scripts/select.py" "$ALL" 0 "$CAP" plain > "$OUT/filtered.txt"
else
  python3 "$ROOT/scripts/select.py" "$CSV" "$MIN_MBPS" "$CAP" csv > "$OUT/filtered.txt"
fi

# base64-подписка (без переносов) для клиентов вроде v2rayN
if [ -s "$OUT/filtered.txt" ]; then
  base64 -w0 "$OUT/filtered.txt" > "$OUT/filtered_b64.txt"
else
  : > "$OUT/filtered_b64.txt"
fi

N="$(grep -cE '://' "$ALL" 2>/dev/null || echo 0)"
K="$(grep -cE '://' "$OUT/filtered.txt" 2>/dev/null || echo 0)"
NOW="$(date -u '+%Y-%m-%d %H:%M UTC')"

if [ "$MODE" = "light" ]; then
  cat > "$OUT/stats.md" <<EOF
# Статистика фильтрации

Обновлено: **$NOW** · режим: **light** (отбор живости/скорости — в приложении)

| Этап | Кол-во |
|------|-------:|
| Уникальных конфигов (all) | $N |
| В подписке (Reality/TLS, top-$CAP) | $K |

> Источник — РФ-SNI Reality (обход белых списков). Такие конфиги нельзя честно
> протестировать с GitHub-раннера (он не в РФ), поэтому список отдаётся как есть,
> а живость/скорость/Telegram проверяет **балансировщик приложения из вашей сети**.
EOF
else
  A="$(grep -cE '://' "$SURV" 2>/dev/null || echo 0)"
  cat > "$OUT/stats.md" <<EOF
# Статистика фильтрации

Обновлено: **$NOW** · режим: **full**

| Этап | Кол-во |
|------|-------:|
| Уникальных конфигов (all) | $N |
| Прошли Cloudflare + живость | $A |
| Прошли по скорости (≥ ${MIN_MBPS} Мбит/с), cap top-$CAP | $K |

> Скорость мерилась с runner'а GitHub (дата-центр) — грубый отсев.
> Реальную скорость смотрите локально: правый клик по группе → «тест скорости».
EOF
fi

echo "Готово (MODE=$MODE): all=$N, published=$K -> $OUT/" >&2
