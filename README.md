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

**Текущая версия: v2.1.2** — проект живой, фиксы и фичи выходят по мере нахождения проблем.

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

**Какой файл качать** (Android 8.0 или новее):
- `my-app-vpn-…-arm64.apk` — для большинства телефонов;
- `my-app-vpn-…-arm32.apk` — для 32-битного Android (бюджетные и старые модели, например Samsung Galaxy A01 / A10 / A20 / A30, серии J и M). Если arm64 пишет «Приложение не установлено» — берите эту.

## Что умеет

- **Авто-режим** — нажал одну кнопку, приложение само находит рабочий сервер и подключается
- **Встроенный балансировщик** — постоянно проверяет серверы по **реальной доступности Telegram** (а не просто пингом) и держит самый быстрый рабочий
- **Бесшовное переключение** — если сервер заблокировали, трафик продолжает идти через другой без реконнекта (вы даже не заметите)
- **Фильтр стран** — российские серверы исключены по умолчанию (иначе балансировщик выбрал бы их из-за низкой задержки, а оттуда нет Telegram/YouTube); настраивается
- Список серверов обновляется автоматически в фоне, пока вы заняты своими делами
- **Раздельное туннелирование** — выбираете, какие приложения идут мимо VPN (банки, Кинопоиск и т.д., чтобы не тормозили)
- Статистика трафика в реальном времени (смотреть на неё и чувствовать себя хакером)
- Работает на мобильном интернете, обходит блокировки операторов
- **Свои DNS-серверы** — Cloudflare, Google, Quad9, AdGuard, Яндекс или любой свой (DoH / обычный), запросы идут через туннель
- **«Только выбранные через VPN»** — обратный режим раздельного туннелирования, плюс «Выбрать все / Снять все / Инвертировать»
- **Раздача через точку доступа** — HTTP-прокси для настроек Wi-Fi и SOCKS5 с паролем для Telegram, с пошаговой инструкцией
- **Always-on VPN** и автоподключение при загрузке телефона
- **Своя подписка «MyAppVPN (авто-сбор)»** — бот сам находит и чистит публичные списки серверов (подробнее ниже)
- **Новый дизайн** со «стеклянными» элементами и **светлая тема** (Настройки → Оформление)
- **OpenFlux (Beta)** — свой выход на обычном веб-хостинге, когда обычные серверы не проходят

Минимальная версия Android: 8.0 (сборки для 64- и 32-битных телефонов)

## Как это вообще работает

В России операторы применяют так называемые белые списки — пропускают только «разрешённые» адреса, всё остальное режут. Приложение использует актуальные VLESS-серверы, которые работают через эти ограничения как отмычка: трафик идёт туда, куда нужно вам, а не туда, куда разрешил оператор.

Серверы берутся из открытых источников (**[zieng2/wl](https://github.com/zieng2/wl)** Universal + **[igareck](https://github.com/igareck/vpn-configs-for-russia)** + наша собственная подписка **[MyAppVPN-subs](https://github.com/indelingDanil/MyAppVPN-subs)**) и обновляются каждый час — чтобы отмычка не затупилась. А чтобы выбрать действительно рабочий сервер, приложение проверяет каждый по реальной доступности Telegram: простого пинга недостаточно — сервер может «пинговаться», но трафик не пропускать.

## 📡 Своя подписка: MyAppVPN-subs

Отдельный репозиторий **[MyAppVPN-subs](https://github.com/indelingDanil/MyAppVPN-subs)** — бот на GitHub Actions, который сам:
- **находит** публичные VLESS-подписки на GitHub (раз в неделю);
- **выкидывает** удалённые источники (404) и те, что **не обновлялись больше недели**;
- раз в 3 часа **собирает** серверы, убирает дубли, проверяет, что они живые, и оставляет только защищённые (Reality / TLS);
- **публикует** очищенный список с флагом страны у каждого сервера.

В приложении (с v2.1.2) она уже встроена как «**MyAppVPN (авто-сбор)**» — ничего настраивать не нужно, отключается в Настройки → Подписки. Ссылка для других клиентов (v2rayNG, Hiddify и т.п.):

```
https://cdn.jsdelivr.net/gh/indelingDanil/MyAppVPN-subs@output/vless.txt
```

Запасные зеркала, списки по странам и статистика — в [README репозитория](https://github.com/indelingDanil/MyAppVPN-subs#readme). ⚠️ Бесплатные серверы держат неизвестные люди — не передавайте через них ничего ценного.

> Старый бета-фильтр из ветки `proxylist` отключён: его источник удалили, а новый бот делает то же самое лучше и сам находит источники.

## Как пользоваться

Всё просто:

1. Установить APK
2. Открыть приложение → нажать **ПОДКЛЮЧИТЬ**
3. Готово — приложение само найдёт рабочий сервер (статус «Поиск рабочего сервера…» → «Защищено») и подключится

Хотите выбрать сервер вручную? Переключатель **⚡ Авто | 📍 Вручную** на главном экране или вкладка **Серверы** → нажмите на нужный. Переключение идёт на лету, без переподключения.

Если нужно, чтобы какое-то приложение шло напрямую, без VPN: **Настройки → Выбор приложений** → отметить нужные (или наоборот — режим «Только выбранные через VPN»).

*(Банк скажет спасибо)*

## История версий

- **v1.0** — первый релиз
- **v1.0.1** — мелкие фиксы
- **v1.0.2** — фикс: watchdog ложно срабатывал и переключал серверы даже когда VPN работал нормально. Причина — Android блокировал HTTP-запрос внутри самой проверки. Заменил на TCP-чек, теперь не дёргается без причины
- **v1.0.3** — стабильность: защита от Doze mode, адаптивный watchdog (реакция за 40 сек вместо 90), мониторинг ошибок XRay, фильтрация медленных серверов. Добавлен источник igareck/vpn-configs-for-russia — пул вырос до 600+ серверов
- **v1.0.4** — health check через Telegram DC (реальная проверка обхода блокировок), зеркало xync.net для конфигов, раздача VPN через Wi-Fi hotspot (SOCKS5 прокси), фильтрация конфигов Украины
- **v1.0.5** — большой апдейт безопасности: фикс CVE (утечка IP через локальный SOCKS5 без аутентификации), IPv6-leak, DoH вместо открытого DNS, нейтральные уведомления, рандомизация watchdog-паттернов
- **v2.0.0** — авто-балансировщик: встроенный балансировщик Xray (observatory) сам выбирает рабочий сервер по реальной проверке Telegram и **бесшовно переключается** при блокировке. Переход на единую подписку zieng2/wl Universal + igareck (5 зеркал с фолбэком, в т.ч. работающие при ограничениях связи). Фильтр стран (РФ исключена по умолчанию). Мгновенный отклик при подключении и честный статус. Переработан UI: одна кнопка, понятные режимы Авто/Ручной. Фикс индикатора трафика
- **v2.1.0** — большой апдейт. Авто/Ручной переделан: переключение на лету в обе стороны, ручной режим больше не уходит сам на другой (в т.ч. российский) сервер, видно, через какой сервер идёт трафик. **Свои DNS-серверы** (идея от подписчика). Раздельное туннелирование: режим «только выбранные через VPN» и «выбрать все / инвертировать» (тоже идея из GitHub). Раздача через точку доступа переделана и наконец работает по инструкции. Always-on VPN и автозапуск при загрузке. Безопасность: kill switch не освобождает локальный порт, случайные порты на сессию, защита подписок от SSRF. Фиксы: base64-подписки, потерянный порт у серверов `host:port/?…`, один кривой сервер больше не роняет весь авто-режим, кнопка «Главная» в меню. Интерфейс полностью на русском (+ английский), новая вкладка «Поддержать»
- **v2.1.1-beta** (пререлиз) — экспериментальный режим **OpenFlux**: свой выход на обычном веб-хостинге вместо VLESS-серверов, сессии переживают обрывы. Демо-сервер для пробы (1 час или 2 ГБ разово, 8 мест), инструкция для своего выхода — ветка [`openflux-exit`](../../tree/openflux-exit)
- **v2.1.2** — **новый дизайн**: спокойная палитра с одним синим акцентом вместо неона, «стеклянная» плавающая нижняя панель, новая кнопка подключения, **светлая тема**. **Поддержка 32-битного Android** (отдельный APK arm32 — по просьбе подписчика). APK почти вдвое меньше (~53 МБ вместо ~95). **Своя подписка** [MyAppVPN-subs](https://github.com/indelingDanil/MyAppVPN-subs) с ботом, который сам находит и чистит источники. OpenFlux: режим коротких запросов для «тормозящих» операторов, запасной адрес сервера и кнопка «Диагностика подключения»

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

**Current version: v2.1.2** — the project is alive, fixes and features are released as issues are discovered.

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

**Which file** (Android 8.0 or newer):
- `my-app-vpn-…-arm64.apk` — for most phones;
- `my-app-vpn-…-arm32.apk` — for 32-bit Android (budget/older devices, e.g. Samsung Galaxy A01 / A10 / A20 / A30, J and M series). Use it if the arm64 build says "App not installed".

## Features

- **Auto mode** — one tap, the app finds a working server and connects
- **Built-in balancer** — continuously checks servers against **real Telegram availability** (not just ping) and keeps the fastest working one
- **Seamless failover** — if a server gets blocked, traffic keeps flowing through another one without reconnection (you won't even notice)
- **Country filter** — Russian servers are excluded by default (otherwise the balancer would pick them for low latency, but Telegram/YouTube don't work from there); customizable
- Server list updates automatically in the background while you go about your business
- **Split tunneling** — choose which apps bypass the VPN (banking apps, streaming services, etc., so they don't slow down)
- Real-time traffic statistics (staring at them makes you feel like a hacker)
- Works on mobile data, bypasses carrier blocks
- **Custom DNS servers** — Cloudflare, Google, Quad9, AdGuard, Yandex or your own (DoH / plain), queries go through the tunnel
- **"Only selected apps via VPN"** — the inverse split-tunnel mode, plus "Select all / Clear / Invert"
- **Hotspot sharing** — an HTTP proxy for Wi‑Fi settings and a password-protected SOCKS5 for Telegram, with a step-by-step guide
- **Always-on VPN** and auto-connect on boot
- **Our own "MyAppVPN (auto-collected)" subscription** — a bot finds and cleans public server lists (see below)
- **New design** with glass elements and a **light theme** (Settings → Appearance)
- **OpenFlux (Beta)** — your own exit on ordinary web hosting when regular servers don't get through

Minimum Android version: 8.0 (builds for 64-bit and 32-bit phones)

## How it works

In Russia, carriers use so-called whitelists — they only pass "approved" addresses and cut everything else. The app uses up-to-date VLESS servers that work through these restrictions like a picklock: traffic goes where *you* want, not where the carrier allows.

Servers are sourced from public repositories (**[zieng2/wl](https://github.com/zieng2/wl)** Universal + **[igareck](https://github.com/igareck/vpn-configs-for-russia)** + our own **[MyAppVPN-subs](https://github.com/indelingDanil/MyAppVPN-subs)**) and refreshed every hour — so the picklock doesn't get dull. To pick a truly working server, the app checks each one against real Telegram reachability: a simple ping isn't enough — a server can respond to pings but still not pass traffic.

## 📡 Our own subscription: MyAppVPN-subs

A separate repo, **[MyAppVPN-subs](https://github.com/indelingDanil/MyAppVPN-subs)**: a GitHub Actions bot that **discovers** public VLESS subscriptions on GitHub (weekly), **drops** deleted (404) sources and ones **not updated for over a week**, **collects** servers every 3 hours, dedupes them, checks they're alive, keeps only Reality / TLS, and **publishes** a cleaned list with a country flag on each server.

Since v2.1.2 it's built into the app as "**MyAppVPN (auto-collected)**" — nothing to set up; disable it in Settings → Subscriptions. Link for other clients (v2rayNG, Hiddify, etc.):

```
https://cdn.jsdelivr.net/gh/indelingDanil/MyAppVPN-subs@output/vless.txt
```

Mirrors, per-country lists and stats — in the [repo README](https://github.com/indelingDanil/MyAppVPN-subs#readme). ⚠️ Free servers are run by unknown people — don't send anything valuable through them.

> The old beta filter on the `proxylist` branch is disabled: its source was deleted, and the new bot does the same job better and finds sources on its own.

## How to use

It's simple:

1. Install the APK
2. Open the app → tap **CONNECT** (the UI follows your system language: Russian or English)
3. Done — the app will find a working server on its own (status: "Searching for a working server…" → "Protected") and connect

Want to pick a server manually? Use the **⚡ Auto | 📍 Manual** switch on the main screen or the **Servers** tab → tap the one you want. Switching happens live, no reconnect.

If you need a specific app to bypass the VPN: **Settings → Choose apps** → tick it (or the other way round — the "Only selected apps via VPN" mode).

*(Your banking app will thank you)*

## Version history

- **v1.0** — initial release
- **v1.0.1** — minor fixes
- **v1.0.2** — fix: watchdog was falsely triggered and switched servers even when the VPN worked fine. The cause — Android was blocking the HTTP request inside the check itself. Replaced with a TCP check; now it doesn't jump for no reason
- **v1.0.3** — stability: Doze mode protection, adaptive watchdog (reaction in 40 sec instead of 90), XRay error monitoring, filtering of slow servers. Added `igareck/vpn-configs-for-russia` source — the pool grew to 600+ servers
- **v1.0.4** — health check via Telegram DC (real circumvention test), `xync.net` mirror for configs, VPN sharing via Wi‑Fi hotspot (SOCKS5 proxy), filtering of Ukrainian configs
- **v1.0.5** — major security update: CVE fix (IP leak via local unauthenticated SOCKS5), IPv6-leak fix, DoH instead of plain DNS, neutral notifications, watchdog pattern randomization
- **v2.0.0** — auto-balancer: built-in Xray balancer (observatory) picks a working server based on real Telegram checks and **seamlessly switches** on block. Migrated to unified subscription `zieng2/wl Universal` + `igareck` (5 mirrors with fallback, including ones that work during connectivity restrictions). Country filter (Russia excluded by default). Instant connection response and honest status. Reworked UI: single button, clear Auto/Manual modes. Fixed traffic indicator
- **v2.1.0** — big update. Auto/Manual reworked: live switching both ways, manual mode no longer silently jumps to another (possibly Russian) server, you can see which server carries your traffic. **Custom DNS servers** (a follower's idea). Split tunneling: "only selected apps via VPN" mode and "select all / invert" (also a GitHub idea). Hotspot sharing rebuilt and finally works as documented. Always-on VPN and auto-connect on boot. Security: the kill switch keeps the local port bound, random per-session ports, SSRF-hardened subscriptions. Fixes: base64 subscriptions, lost port on `host:port/?…` servers, one broken server no longer takes down the whole Auto mode, the Home tab button. UI fully in Russian (+ English), new "Support" tab
- **v2.1.1-beta** (pre-release) — experimental **OpenFlux** mode: your own exit on ordinary web hosting instead of VLESS servers, sessions survive cuts. A demo server to try it (1 hour or 2 GB once, 8 slots); guide for your own exit — the [`openflux-exit`](../../tree/openflux-exit) branch
- **v2.1.2** — **new design**: a calm palette with a single blue accent instead of neon, a floating glass bottom bar, a new connect button, **light theme**. **32-bit Android support** (a separate arm32 APK, requested by a follower). The APK is almost half the size (~53 MB instead of ~95). **Our own subscription** [MyAppVPN-subs](https://github.com/indelingDanil/MyAppVPN-subs) with a bot that finds and cleans sources itself. OpenFlux: short-request mode for carriers that stall long responses, a fallback server address and a "Connection diagnostics" button

## Important

This is a personal project, not a startup or a service with investors. There's no telemetry or any other nonsense, simply because no one needs it here — not me, not you.

## Acknowledgments

Huge thanks to the **[zieng2/wl](https://github.com/zieng2/wl)** project — without this server source the app simply wouldn't exist. One person maintains an up-to-date list of working VLESS servers 24/7, for free, for everyone. A hero without a cape.

And a special thanks to **Claude (Anthropic)** — helped with development throughout the whole project 🤖

Yes, I use AI in development. No, I'm not a "vibe coder" — I'm a programmer who just consults a robot very often. It's like Stack Overflow, except the question tab doesn't get closed after five years. The difference from vibe coding is fundamental, I insist.
