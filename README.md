# Свой выход OpenFlux для MyAppVPN (Beta)

> 🇬🇧 English version below.

**OpenFlux** — экспериментальный режим MyAppVPN: трафик идёт не через публичные VLESS-серверы, а через **ваш собственный выход** на обычном веб-хостинге.

```
приложение → Xray → помощник OpenFlux (на телефоне) → http(s)://ваш-сайт/n/ → интернет
```

Когда полезно: мобильный оператор пропускает только «белые» сайты, а ваш хостинг (например, российский Beget) в этот список попадает. Выход на хостинге сам ходит в Telegram, YouTube и т.д.

> ⚠️ **Дисклеймер.** Учебный проект. Автор не несёт ответственности за использование. В РФ VPN-сервисы для обхода блокировок ограничены законом. Используя хостинг как прокси, вы можете нарушить его правила — читайте условия хостера. На свой страх и риск.

В этой ветке два варианта выхода:

| | **Node.js (рекомендуется)** — папка `node/` | PHP (запасной) — папка `php/` |
|---|---|---|
| Обрывы | сессии возобновляются, видео/загрузки/звонки **не рвутся** | хостинг рвёт сессию раз в 1,5–5 мин |
| Нагрузка | один процесс на всех | процесс на каждое подключение (~27 на аккаунт Beget) |
| Настройка | ~15 минут, нужен SSH | ~10 минут, хватит FTP |

Ограничения обоих: только TCP на порты 80/443 (DNS автоматически идёт через DoH), без IPv6, скорость зависит от хостинга.

## Вариант 1: Node.js на облачном хостинге Beget (проверено)

Beget официально запускает Node-приложения на виртуальном хостинге через Passenger — [их инструкция](https://beget.com/ru/kb/how-to/web-apps/node-js). Ниже — она же, применительно к выходу.

1. **Сайт.** Панель Beget → «Сайты» → добавьте сайт (подойдёт бесплатный поддомен `имя.логин.beget.tech`).
2. **SSH.** Подключитесь к аккаунту (`ssh логин@логин.beget.tech`, пароль из панели) и войдите в Docker-окружение, где работает Node:
   ```sh
   ssh localhost -p 222
   ```
3. **Node.js 20.** Проверьте `~/.local/bin/node -v`. Если Node нет или версия старая — установите по [разделу «Установка Node.js версии 18.x и выше»](https://beget.com/ru/kb/how-to/web-apps/node-js) (архив `node-v20.x-bionic` в `~/.local`).
4. **Папка выхода** — внутри папки сайта, но **вне** `public_html` (иначе файлы с токенами можно скачать из браузера). Сайт работает от своего изолированного пользователя, поэтому копию Node кладём рядом:
   ```sh
   SITE=~/имя.логин.beget.tech          # папка вашего сайта
   mkdir -p $SITE/ofnode/bin $SITE/ofnode/tmp $SITE/ofnode/data
   cp ~/.local/bin/node $SITE/ofnode/bin/node
   ```
5. **Файлы.** Загрузите в `$SITE/ofnode/` файл `node/app.js` из этой ветки. Скопируйте `node/config.example.json` → `$SITE/ofnode/config.json` и впишите свои токены (длинные случайные строки, 30+ символов). Секцию `demo` можно удалить — она нужна только для публичного демо.
   ```sh
   chmod 600 $SITE/ofnode/config.json
   ```
6. **Подключение к сайту.** Создайте папку `$SITE/public_html/n/` и в ней файл `.htaccess` (подставьте свой путь — полный путь видно командой `realpath $SITE`):
   ```
   PassengerNodejs /home/X/логин/имя.логин.beget.tech/ofnode/bin/node
   PassengerAppRoot /home/X/логин/имя.логин.beget.tech/ofnode
   PassengerAppType node
   PassengerStartupFile app.js
   PassengerBaseURI /n
   ```
7. **Запуск/перезапуск:** `touch $SITE/ofnode/tmp/restart.txt` (так же — после правки `config.json` или `app.js`).
8. **Проверка:** откройте `http://ваш-сайт/n/?k=wrong&s=abcdefgh&r=down&from=0` — должно показать `no` (это правильно: токен неверный).
9. **В приложении:** Настройки → «Эксперименты» → «OpenFlux (Beta)» → адрес `http://ваш-сайт/n/` и ваш токен → «Сохранить» → включите «Использовать OpenFlux» → «Подключить».

Один выход тянет несколько ваших устройств одновременно (у каждого может быть свой токен в `personal`).

## Вариант 2: PHP (без SSH)

Инструкция — в [`php/README.md`](php/README.md). Проще (только FTP), но сессии рвутся при каждом обрыве запроса хостингом.

## Важно знать

- **HTTPS.** На технических поддоменах `*.beget.tech` HTTPS нет, выход работает по `http://`: провайдер видит токен и адреса сайтов (содержимое HTTPS-сайтов всё равно зашифровано). Для HTTPS привяжите свой домен и выпустите бесплатный SSL в панели Beget, затем используйте `https://`.
- **Токен никому не показывайте** — с ним любой сможет ходить через ваш хостинг.
- Некоторые сайты не пускают подключения из сетей хостингов (например, госуслуги) — через выход они не откроются.

## Откуда это

Протокол — потоковый режим [OpenFlux](https://github.com/p1neappleXpress/OpenFlux) (GPL-3.0), расширенный возобновляемыми сессиями (`PROTOCOL-v2.md`). Выход на Node.js, помощник для телефона и PHP-патчи — проект MyAppVPN (GPL-3.0).

---

# Your own OpenFlux exit for MyAppVPN (Beta)

**OpenFlux** is an experimental MyAppVPN mode: traffic goes through **your own exit** on ordinary web hosting instead of public VLESS servers. Useful when a carrier only allows "whitelisted" sites and your host is one of them.

> ⚠️ **Disclaimer.** Educational project. The author is not responsible for how you use it. In Russia, VPN services for bypassing blocks are restricted by law. Using a host as a proxy may violate its terms. Use at your own risk.

**Recommended: Node.js exit (`node/`)** — sessions resume after the host cuts a request, so video/downloads/calls don't break. On Beget (tested): create a site → SSH in and `ssh localhost -p 222` → make sure Node 20 is in `~/.local` ([Beget guide](https://beget.com/ru/kb/how-to/web-apps/node-js)) → create `<site>/ofnode/{bin,tmp,data}` **outside** `public_html`, copy `~/.local/bin/node` to `ofnode/bin/node` → put `app.js` and `config.json` (from `config.example.json`, your own long random tokens) there → create `public_html/n/.htaccess` with `PassengerNodejs`, `PassengerAppRoot`, `PassengerAppType node`, `PassengerStartupFile app.js`, `PassengerBaseURI /n` → `touch ofnode/tmp/restart.txt` → `http://your-site/n/?k=wrong&s=abcdefgh&r=down&from=0` should print `no` → in the app: OpenFlux (Beta) → URL `http://your-site/n/` + token → Save → enable → Connect.

**Alternative: PHP exit (`php/`)** — FTP only, simpler, but sessions break whenever the host cuts a request. See `php/README.md`.

Limits: TCP to ports 80/443 only, no IPv6, no HTTPS on `*.beget.tech` subdomains (attach your own domain + free SSL for `https://`). Keep tokens private.
