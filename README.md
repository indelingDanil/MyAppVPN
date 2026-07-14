# MyAppVPN

**Содержание (table of content)**
- [Русский (оригинал)](#русский)
- [English (translation)](#english)

### ТГ где я уведомляю о новых релизах по [ссылке](https://t.me/myappvpn_dprog).

## Русский

VPN для Android. Сделан для себя и для людей — чтобы просто работало, а не чтобы продаться стартапу через год.

Более 4 000+ скачиваний за время жизни проекта (можете убедиться через релизноуты по версиям).

Если нравиться приложение поставьте "STAR"❤️

## Поддержка проекта

Планирую продолжать поддерживать приложение — обновлять, чинить, добавлять новое. По мере сил и пока не отвлёкся на что-нибудь другое.

Если приложение оказалось полезным и хочется поддержать — буду рад донату. Коплю на Mac, а если накоплю — попробую сделать версию и для iOS тоже. Так что ваш донат буквально приближает VPN для iPhone.

👉 [Задонатить CloudTips (RUB)](https://pay.cloudtips.ru/p/8c90d7a5)

👉 Задонатить USDT (TRC20): TB3Qn2guzVdj93kUi43KG8gQY6mruGZbNG

👉 Задонатить BTC (BTC): 16Bs15Mpu2HAYyVjgiLdwQC1yzLpbf2qyv

👉 Задонатить ETH (ERC20): 0x3704ecc83ea8b6a852d63dc82c0badcd761d8e6f

Спасибо всем, кто пользуется ❤️

**Текущая версия: v2.0.2** — проект живой, фиксы и фичи выходят по мере нахождения проблем.

> ⚠️ **Дисклеймер.** Это **учебный** проект — сделан в образовательных и исследовательских целях.
> Автор **не несёт ответственности** за то, как вы используете приложение. Помните: в РФ
> VPN-сервисы для обхода блокировок ограничены законом и могут считаться незаконными.
> Используете на свой страх и риск.

> **Кто хочет помочь:** отчёты → [#4 «Всемирная тестировка»](../../issues/4), идеи →
> [#5 «Всемирная идейная»](../../issues/5), пообщаться → [#6 «Всемирная флудильня»](../../issues/6).
> Любой фидбэк полезен. 🙌

## Скачать

👉 [Последняя версия APK — Releases](../../releases/latest)

**Установка:** скачать APK → при запросе разрешить установку из неизвестных источников (это стандартная процедура для любого APK не из Play Store, всё окей) → установить → наслаждаться интернетом.

> Требуется 64-битное устройство (arm64) с Android 8.0 или новее.

## Что умеет

- **Авто-режим** — нажал одну кнопку, приложение само находит рабочий сервер и подключается
- **Встроенный балансировщик** — постоянно проверяет серверы по **реальной доступности Telegram** (а не просто пингом) и держит самый быстрый рабочий
- **Бесшовное переключение** — если сервер заблокировали, трафик продолжает идти через другой без реконнекта (вы даже не заметите)
- **Фильтр стран** — российские серверы исключены по умолчанию (иначе балансировщик выбрал бы их из-за низкой задержки, а оттуда нет Telegram/YouTube); настраивается
- Список серверов обновляется автоматически в фоне, пока вы заняты своими делами
- **Раздельное туннелирование** — выбираете, какие приложения идут мимо VPN (банки, Кинопоиск и т.д., чтобы не тормозили)
- Статистика трафика в реальном времени (смотреть на неё и чувствовать себя хакером)
- Работает на мобильном интернете, обходит блокировки операторов

Минимальная версия Android: 8.0

## Как это вообще работает

В России операторы применяют так называемые белые списки — пропускают только «разрешённые» адреса, всё остальное режут. Приложение использует актуальные VLESS-серверы, которые работают через эти ограничения как отмычка: трафик идёт туда, куда нужно вам, а не туда, куда разрешил оператор.

Серверы берутся из открытых источников (**[zieng2/wl](https://github.com/zieng2/wl)** Universal + **[igareck](https://github.com/igareck/vpn-configs-for-russia)**) и обновляются каждый час — чтобы отмычка не затупилась. А чтобы выбрать действительно рабочий сервер, приложение проверяет каждый по реальной доступности Telegram: простого пинга недостаточно — сервер может «пинговаться», но трафик не пропускать.

## 🧪 Бета: авто-фильтр прокси-листа

Экспериментальное дополнение (ветка [`proxylist`](../../tree/proxylist)): GitHub Actions раз в час отбирает публичные подписки и оставляет только те **VLESS**-серверы, через которые реально открывается Telegram и которые проходят грубый порог скорости (≥ 1 МБ/с). Обновляется автоматически.

Готовый plain-список для подписки в приложении:

```
https://raw.githubusercontent.com/indelingDanil/MyAppVPN/proxylist/output/filtered.txt
```

Подробности и оговорки — в [README ветки proxylist](../../tree/proxylist#readme). ⚠️ Это бета: список и формат могут меняться.

## Как пользоваться

Всё просто:

1. Установить APK
2. Открыть приложение → нажать **Connect**
3. Готово — приложение само найдёт рабочий сервер (статус «Поиск рабочего сервера…» → «Защищено») и подключится

Хотите выбрать сервер вручную? Вкладка **Servers** → нажмите на нужный. Вернуться к авто — кнопка **⚡ Авто** на главном экране.

Если нужно, чтобы какое-то приложение шло напрямую, без VPN: **Settings → Split Tunneling** → выбрать нужное приложение.

*(Банк скажет спасибо)*

## История версий

- **v1.0** — первый релиз
- **v1.0.1** — мелкие фиксы
- **v1.0.2** — фикс: watchdog ложно срабатывал и переключал серверы даже когда VPN работал нормально. Причина — Android блокировал HTTP-запрос внутри самой проверки. Заменил на TCP-чек, теперь не дёргается без причины
- **v1.0.3** — стабильность: защита от Doze mode, адаптивный watchdog (реакция за 40 сек вместо 90), мониторинг ошибок XRay, фильтрация медленных серверов. Добавлен источник igareck/vpn-configs-for-russia — пул вырос до 600+ серверов
- **v1.0.4** — health check через Telegram DC (реальная проверка обхода блокировок), зеркало xync.net для конфигов, раздача VPN через Wi-Fi hotspot (SOCKS5 прокси), фильтрация конфигов Украины
- **v1.0.5** — большой апдейт безопасности: фикс CVE (утечка IP через локальный SOCKS5 без аутентификации), IPv6-leak, DoH вместо открытого DNS, нейтральные уведомления, рандомизация watchdog-паттернов
- **v2.0.0** — авто-балансировщик: встроенный балансировщик Xray (observatory) сам выбирает рабочий сервер по реальной проверке Telegram и **бесшовно переключается** при блокировке. Переход на единую подписку zieng2/wl Universal + igareck (5 зеркал с фолбэком, в т.ч. работающие при ограничениях связи). Фильтр стран (РФ исключена по умолчанию). Мгновенный отклик при подключении и честный статус. Переработан UI: одна кнопка, понятные режимы Авто/Ручной. Фикс индикатора трафика

## Важно

Это личный проект, не стартап и не сервис с инвесторами. Никакой телеметрии и прочей ерунды нет просто потому, что это никому здесь не нужно — ни мне, ни вам.

## Благодарности

Огромное спасибо проекту **[zieng2/wl](https://github.com/zieng2/wl)** — без этого источника серверов приложения бы просто не существовало. Человек в одиночку поддерживает актуальный список рабочих VLESS-серверов 24/7, бесплатно, для всех. Герой без плаща.

И отдельное спасибо **Claude (Anthropic)** — помогал с разработкой на протяжении всего проекта 🤖

Да, я использую ИИ в разработке. Нет, я не вайбкодер — я программист, который просто очень часто советуется с роботом. Это как Stack Overflow, только вкладка с вопросом не закрывается через пять лет. Разница с вайбкодингом принципиальная, я настаиваю.

---

## English

A VPN for Android. Built for myself and for people — to just work, not to be sold to a startup in a year.

4,000+ downloads over the project's lifetime (check the release notes by version if you want proof).

If you like the app, drop a ⭐ "STAR" ❤️  

## Support the project

I plan to keep maintaining the app — updating, fixing, adding new features — as long as I have the energy and haven't gotten distracted by something else.

If the app has been useful and you'd like to support it, I'll be happy to receive a donation. I'm saving up for a Mac; if I manage to get one, I'll try to make an iOS version too. So your donation is literally bringing a VPN for iPhone closer.

👉 [Donate via CloudTips (RUB)](https://pay.cloudtips.ru/p/8c90d7a5)

👉 Donate USDT (TRC20): `TB3Qn2guzVdj93kUi43KG8gQY6mruGZbNG`

👉 Donate BTC (BTC): `16Bs15Mpu2HAYyVjgiLdwQC1yzLpbf2qyv`

👉 Donate ETH (ERC20): `0x3704ecc83ea8b6a852d63dc82c0badcd761d8e6f`

Thank you to everyone who uses the app ❤️

**Current version: v2.0.2** — the project is alive, fixes and features are released as issues are discovered.

> ⚠️ **Disclaimer.** This is an **educational** project — made for learning and research purposes.
> The author **is not responsible** for how you use the application. Remember: in Russia,
> VPN services intended to bypass blocking are restricted by law and may be considered illegal.
> Use at your own risk.

> **If you want to help:** bug reports → [#4 «Worldwide Testing»](../../issues/4), ideas →
> [#5 «Worldwide Ideas»](../../issues/5), just chat → [#6 «Worldwide Flood Zone»](../../issues/6).
> Any feedback is valuable. 🙌

## Download

👉 [Latest APK — Releases](../../releases/latest)

**Installation:** download the APK → when prompted, allow installation from unknown sources (this is standard for any APK not from the Play Store, nothing to worry about) → install → enjoy the internet.

> Requires a 64-bit device (arm64) with Android 8.0 or newer.

## Features

- **Auto mode** — one tap, the app finds a working server and connects
- **Built-in balancer** — continuously checks servers against **real Telegram availability** (not just ping) and keeps the fastest working one
- **Seamless failover** — if a server gets blocked, traffic keeps flowing through another one without reconnection (you won't even notice)
- **Country filter** — Russian servers are excluded by default (otherwise the balancer would pick them for low latency, but Telegram/YouTube don't work from there); customizable
- Server list updates automatically in the background while you go about your business
- **Split tunneling** — choose which apps bypass the VPN (banking apps, streaming services, etc., so they don't slow down)
- Real-time traffic statistics (staring at them makes you feel like a hacker)
- Works on mobile data, bypasses carrier blocks

Minimum Android version: 8.0

## How it works

In Russia, carriers use so-called whitelists — they only pass "approved" addresses and cut everything else. The app uses up-to-date VLESS servers that work through these restrictions like a picklock: traffic goes where *you* want, not where the carrier allows.

Servers are sourced from public repositories (**[zieng2/wl](https://github.com/zieng2/wl)** Universal + **[igareck](https://github.com/igareck/vpn-configs-for-russia)**) and refreshed every hour — so the picklock doesn't get dull. To pick a truly working server, the app checks each one against real Telegram reachability: a simple ping isn't enough — a server can respond to pings but still not pass traffic.

## 🧪 Beta: proxy-list auto-filter

An experimental companion (the [`proxylist`](../../tree/proxylist) branch): an hourly GitHub Action filters public subscriptions and keeps only the **VLESS** servers that actually reach Telegram through the proxy and pass a rough speed gate (≥ 1 MB/s). Updates automatically.

Ready-made plain list to subscribe in the app:

```
https://raw.githubusercontent.com/indelingDanil/MyAppVPN/proxylist/output/filtered.txt
```

Details and disclaimers — in the [proxylist branch README](../../tree/proxylist#readme). ⚠️ This is beta: the list and format may change.

## How to use

It's simple:

1. Install the APK
2. Open the app → tap **Connect**
3. Done — the app will find a working server on its own (status: "Searching for a working server…" → "Protected") and connect

Want to pick a server manually? Go to the **Servers** tab → tap the one you want. Switch back to auto — hit the **⚡ Auto** button on the main screen.

If you need a specific app to bypass the VPN: **Settings → Split Tunneling** → select the app.

*(Your banking app will thank you)*

## Version history

- **v1.0** — initial release
- **v1.0.1** — minor fixes
- **v1.0.2** — fix: watchdog was falsely triggered and switched servers even when the VPN worked fine. The cause — Android was blocking the HTTP request inside the check itself. Replaced with a TCP check; now it doesn't jump for no reason
- **v1.0.3** — stability: Doze mode protection, adaptive watchdog (reaction in 40 sec instead of 90), XRay error monitoring, filtering of slow servers. Added `igareck/vpn-configs-for-russia` source — the pool grew to 600+ servers
- **v1.0.4** — health check via Telegram DC (real circumvention test), `xync.net` mirror for configs, VPN sharing via Wi‑Fi hotspot (SOCKS5 proxy), filtering of Ukrainian configs
- **v1.0.5** — major security update: CVE fix (IP leak via local unauthenticated SOCKS5), IPv6-leak fix, DoH instead of plain DNS, neutral notifications, watchdog pattern randomization
- **v2.0.0** — auto-balancer: built-in Xray balancer (observatory) picks a working server based on real Telegram checks and **seamlessly switches** on block. Migrated to unified subscription `zieng2/wl Universal` + `igareck` (5 mirrors with fallback, including ones that work during connectivity restrictions). Country filter (Russia excluded by default). Instant connection response and honest status. Reworked UI: single button, clear Auto/Manual modes. Fixed traffic indicator

## Important

This is a personal project, not a startup or a service with investors. There's no telemetry or any other nonsense, simply because no one needs it here — not me, not you.

## Acknowledgments

Huge thanks to the **[zieng2/wl](https://github.com/zieng2/wl)** project — without this server source the app simply wouldn't exist. One person maintains an up-to-date list of working VLESS servers 24/7, for free, for everyone. A hero without a cape.

And a special thanks to **Claude (Anthropic)** — helped with development throughout the whole project 🤖

Yes, I use AI in development. No, I'm not a "vibe coder" — I'm a programmer who just consults a robot very often. It's like Stack Overflow, except the question tab doesn't get closed after five years. The difference from vibe coding is fundamental, I insist.
