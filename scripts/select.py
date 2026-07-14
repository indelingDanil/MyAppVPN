#!/usr/bin/env python3
"""Отбирает конфиги и печатает их (по одному на строку). Два режима:

  csv   (по умолчанию) — вход results.csv от xray-knife: берём status==passed И
        download(mbps) >= MIN_MBPS, сортируем по скорости.
  plain — вход all.txt (просто vless:// по строкам, без тестов): для «лёгкого
        режима», когда живость/скорость меряет само приложение из РФ.

В обоих режимах оставляем только Reality и TLS (security=none и без явного
security выкидываем — плейнтекст первым режется РФ-DPI), Reality идёт сверху.
Опциональный cap top-N.

Usage: select.py <input> <min_mbps> <cap> [csv|plain]
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


def dedup_key(link):
    """Семантический ключ: proto + cred + host:port, без #фрагмента и ?query.
    Нужен для merge — один сервер приходит из нескольких источников под разными
    именами; иначе в топе будут дубли."""
    base = link.split("#", 1)[0]
    if "://" not in base:
        return link
    scheme, rest = base.split("://", 1)
    cred, hostpart = (rest.split("@", 1) + [""])[:2] if "@" in rest else ("", rest)
    hostport = hostpart.split("?", 1)[0].split("/", 1)[0]
    return "%s:%s@%s" % (scheme.lower(), cred, hostport)


def collect_csv(path, min_mbps):
    """-> (rows[(tier, dl, link)], dropped_weak). Дедуп по семантическому ключу
    (при слиянии источников): на дубль оставляем самый быстрый. Пусто, если нет файла."""
    best = {}  # key -> (tier, dl, link)
    dropped_weak = 0
    try:
        with open(path, newline="", encoding="utf-8", errors="ignore") as f:
            for r in csv.DictReader(f):
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
                k = dedup_key(link)
                if k not in best or dl > best[k][1]:
                    best[k] = (tier, dl, link)
    except FileNotFoundError:
        pass
    return list(best.values()), dropped_weak


def collect_plain(path):
    """-> (rows[(tier, idx, link)], dropped_weak). idx сохраняет исходный порядок."""
    rows, dropped_weak, idx = [], 0, 0
    try:
        with open(path, encoding="utf-8", errors="ignore") as f:
            for line in f:
                link = line.strip()
                if not link.lower().startswith("vless://"):
                    continue
                tier = security_tier(link)
                if tier is None:
                    dropped_weak += 1
                    continue
                rows.append((tier, idx, link))
                idx += 1
    except FileNotFoundError:
        pass
    return rows, dropped_weak


def main():
    path = sys.argv[1]
    min_mbps = float(sys.argv[2]) if len(sys.argv) > 2 else 8.0
    cap = int(sys.argv[3]) if len(sys.argv) > 3 else 0  # 0 = без ограничения
    mode = sys.argv[4] if len(sys.argv) > 4 else "csv"

    if mode == "plain":
        rows, dropped_weak = collect_plain(path)
        # Reality (0) → TLS (1); внутри яруса — исходный порядок (скорости нет).
        rows.sort(key=lambda x: (x[0], x[1]))
    else:
        rows, dropped_weak = collect_csv(path, min_mbps)
        # Reality (0) → TLS (1); внутри яруса — по скорости (desc).
        rows.sort(key=lambda x: (x[0], -x[1]))

    reality = sum(1 for t, _, _ in rows if t == 0)
    tls = sum(1 for t, _, _ in rows if t == 1)
    sys.stderr.write(
        "отбор (%s): reality=%d, tls=%d, выкинуто слабых=%d\n"
        % (mode, reality, tls, dropped_weak)
    )

    if cap and cap > 0:
        if len(rows) > cap:
            sys.stderr.write("cap top-%d: отброшено ещё %d\n" % (cap, len(rows) - cap))
        rows = rows[:cap]

    for _, _, link in rows:
        sys.stdout.write(link + "\n")


if __name__ == "__main__":
    main()
