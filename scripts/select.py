#!/usr/bin/env python3
"""Отбирает из results.csv рабочие конфиги и печатает их (по одному на строку).

Критерии:
  1. status == "passed" И download (mbps) >= MIN_MBPS.
  2. Тип защиты: оставляем только Reality и TLS. `security=none` и конфиги без
     явного security выкидываем — плейнтекст-VLESS первым режется РФ-DPI, и
     "подключился, но интернета нет" чаще всего именно из-за них.

Порядок вывода: сперва Reality (стойче к DPI), потом TLS; внутри каждого яруса —
по скорости (быстрые сверху). Опциональный cap top-N.

Usage: select.py <results.csv> <min_mbps> <cap>
Столбцы CSV xray-knife v10:
  link,status,reason,tls,ip,delay,code,download,upload,location,ttfb,connect_time
"""
import sys
import csv


def security_tier(link):
    """0 = reality, 1 = tls, None = слабый (none/без security) -> выкинуть."""
    low = link.lower()
    if "security=reality" in low:
        return 0
    if "security=tls" in low:
        return 1
    return None


def main():
    path = sys.argv[1]
    min_mbps = float(sys.argv[2]) if len(sys.argv) > 2 else 8.0
    cap = int(sys.argv[3]) if len(sys.argv) > 3 else 0  # 0 = без ограничения

    rows = []
    dropped_weak = 0
    try:
        with open(path, newline="", encoding="utf-8", errors="ignore") as f:
            reader = csv.DictReader(f)
            for r in reader:
                if (r.get("status") or "").strip().lower() != "passed":
                    continue
                try:
                    dl = float(r.get("download") or 0)
                except ValueError:
                    dl = 0.0
                if dl < min_mbps:
                    continue
                link = (r.get("link") or "").strip()
                if not link:
                    continue
                tier = security_tier(link)
                if tier is None:
                    dropped_weak += 1
                    continue
                rows.append((tier, dl, link))
    except FileNotFoundError:
        return  # нет CSV -> пустой вывод

    # Reality (tier 0) → TLS (tier 1); внутри яруса — по скорости (desc).
    rows.sort(key=lambda x: (x[0], -x[1]))

    reality = sum(1 for t, _, _ in rows if t == 0)
    tls = sum(1 for t, _, _ in rows if t == 1)
    sys.stderr.write(
        "отбор: reality=%d, tls=%d, выкинуто слабых (none/без security)=%d\n"
        % (reality, tls, dropped_weak)
    )

    if cap and cap > 0:
        if len(rows) > cap:
            sys.stderr.write(
                "cap top-%d: отброшено ещё %d\n" % (cap, len(rows) - cap)
            )
        rows = rows[:cap]

    for _, _, link in rows:
        sys.stdout.write(link + "\n")


if __name__ == "__main__":
    main()
