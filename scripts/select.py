#!/usr/bin/env python3
"""Отбирает из results.csv рабочие конфиги и печатает их (по одному на строку).

Критерии: status == "passed" И download (mbps) >= MIN_MBPS.
Сортировка по download (быстрые сверху), опциональный cap top-N.

Usage: select.py <results.csv> <min_mbps> <cap>
Столбцы CSV xray-knife v10:
  link,status,reason,tls,ip,delay,code,download,upload,location,ttfb,connect_time
"""
import sys
import csv


def main():
    path = sys.argv[1]
    min_mbps = float(sys.argv[2]) if len(sys.argv) > 2 else 8.0
    cap = int(sys.argv[3]) if len(sys.argv) > 3 else 0  # 0 = без ограничения

    rows = []
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
                rows.append((dl, link))
    except FileNotFoundError:
        return  # нет CSV -> пустой вывод

    rows.sort(key=lambda x: x[0], reverse=True)
    if cap and cap > 0:
        dropped = max(0, len(rows) - cap)
        if dropped:
            sys.stderr.write(
                "cap top-%d: отброшено %d медленных конфигов\n" % (cap, dropped)
            )
        rows = rows[:cap]

    for _, link in rows:
        sys.stdout.write(link + "\n")


if __name__ == "__main__":
    main()
