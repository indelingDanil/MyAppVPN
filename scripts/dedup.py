#!/usr/bin/env python3
"""Семантический дедуп конфигов из stdin -> stdout.

Ключ дедупа = протокол + учётные данные (uuid/пароль) + host + port,
БЕЗ учёта #name-фрагмента и query-параметров. Это схлопывает один и тот же
сервер, встречающийся под разными именами в разных подписках — чего не делает
обычный `sort -u` (ловит только точные дубли).
"""
import sys
import base64
import json


def _b64decode(s: str) -> bytes:
    s = s.strip()
    pad = "=" * (-len(s) % 4)
    return base64.b64decode(s + pad)


def key(line: str):
    line = line.strip()
    if not line:
        return None
    base = line.split("#", 1)[0]  # отбрасываем #name-фрагмент
    if "://" not in base:
        return None
    scheme = base.split("://", 1)[0].lower()

    if scheme == "vmess":
        # vmess://<base64(json)>
        try:
            payload = base.split("://", 1)[1]
            j = json.loads(_b64decode(payload).decode("utf-8", "ignore"))
            return "vmess:%s:%s:%s" % (
                j.get("add", ""), j.get("port", ""), j.get("id", ""),
            )
        except Exception:
            return base

    # vless / trojan / ss: scheme://<cred>@<host>:<port>?query
    try:
        rest = base.split("://", 1)[1]
        if "@" in rest:
            cred, hostpart = rest.split("@", 1)
        else:
            cred, hostpart = "", rest
        hostport = hostpart.split("?", 1)[0].split("/", 1)[0]
        return "%s:%s@%s" % (scheme, cred, hostport)
    except Exception:
        return base


def main():
    seen = set()
    for line in sys.stdin:
        k = key(line)
        if k is None:
            continue
        if k in seen:
            continue
        seen.add(k)
        # Часть источников хранит конфиги с HTML-экранированием (&amp; вместо &),
        # что ломает разбор query-параметров в клиентах. Разэкранируем.
        clean = line.strip().replace("&amp;", "&")
        sys.stdout.write(clean + "\n")


if __name__ == "__main__":
    main()
