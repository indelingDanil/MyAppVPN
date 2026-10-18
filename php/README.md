# Свой выход OpenFlux для MyAppVPN (Beta)

> 🇬🇧 English version below.

**OpenFlux** — экспериментальный режим MyAppVPN. Трафик идёт не через публичные VLESS-серверы, а через **ваш собственный выход** — PHP-скрипт на обычном веб-хостинге:

```
приложение → tun2socks → Xray → помощник OpenFlux (на телефоне) → http(s)://ваш-хостинг/phpbox.php → интернет
```

Когда это полезно: мобильный оператор пропускает только «белые» сайты, а ваш хостинг (например, российский [Beget](https://beget.com/p1444343)) в этот список попадает. Скрипт на хостинге уже сам ходит в Telegram, YouTube и т.д.

Ограничения режима: только TCP на порты 80/443 (DNS идёт через DoH автоматически), скорость скромная — от нескольких до ~15 Мбит/с в зависимости от хостинга, сессия переподключается раз в ~2 минуты (приложение делает это само).

> ⚠️ **Дисклеймер.** Учебный проект. Автор не несёт ответственности за использование. В РФ VPN-сервисы для обхода блокировок ограничены законом. Используя чужой хостинг как прокси, вы можете нарушить его правила — читайте условия хостера. На свой страх и риск.

## Что понадобится

- Хостинг с **PHP 8+**, где разрешены `stream_socket_client`, `stream_select`, `set_time_limit` и долгие запросы (≥ 2 минут). Подходит облачный хостинг Beget (проверено).
- 10 минут времени.

## Пошагово на Beget

1. **Зарегистрируйтесь** на [beget.com](https://beget.com/p1444343) и выберите тариф **облачного хостинга** (есть бесплатный пробный период).
2. **Создайте сайт.** Панель → «Сайты» → «Добавить сайт». Можно взять бесплатный технический поддомен вида `имя.ваш-логин.beget.tech`.
3. **Создайте FTP-доступ** к этому сайту: Панель → «FTP» → «Добавить», папка — корень сайта. Запишите логин и пароль.
4. **Скачайте файлы** из этой папки репозитория: `phpbox.php` и `config.example.php`.
5. **Настройте config.php.** Переименуйте `config.example.php` → `config.php` и:
   - впишите в `PHPBOX_TOKEN` длинную случайную строку (это ваш пароль от выхода; например, сгенерируйте 30+ символов);
   - раскомментируйте строку с `PHPBOX_BUS` и укажите папку **вне** `public_html` — на Beget каждый PHP-запрос получает свою изолированную `/tmp`, поэтому общая папка обязательна. Путь вида:
     `/home/<первая буква логина>/<логин>/<имя сайта>/ofbus`
     (полный путь к сайту виден в файловом менеджере Beget).
6. **Загрузите** `phpbox.php` и `config.php` по FTP в корень сайта (папку `public_html`). Подойдёт FileZilla или файловый менеджер в панели Beget.
7. **Проверьте:** откройте в браузере `http://ваш-сайт/phpbox.php` — должно показать `no`. Это нормально: без токена скрипт ничего не делает.
8. **В приложении:** Настройки → «Эксперименты» → «OpenFlux (Beta)» → вставьте адрес `http://ваш-сайт/phpbox.php` и токен → «Сохранить» → включите «Использовать OpenFlux» → на главном экране «Подключить».

## Важно знать

- **HTTPS.** На технических поддоменах `*.beget.tech` HTTPS нет, выход работает по `http://`. Провайдер тогда видит токен и адреса сайтов (содержимое HTTPS-сайтов всё равно зашифровано). Чтобы включить HTTPS — привяжите свой домен и выпустите бесплатный SSL-сертификат в панели Beget, затем используйте `https://`.
- **Один выход = несколько ваших устройств.** Каждое подключение держит на хостинге один PHP-процесс. На облачном хостинге комфортно до ~10 одновременных пользователей.
- **Токен никому не показывайте** — с ним любой сможет ходить через ваш хостинг.
- **Ограничения по пользователям и демо-режим** (несколько токенов, лимиты времени/трафика) поддерживаются тем же `phpbox.php` — см. комментарии в начале `config.example.php` и константы `PHPBOX_PERSONAL` / `PHPBOX_DEMO*` в коде.

## Откуда это

Серверный скрипт — `deploy/phpbox/phpbox.php` из проекта [OpenFlux](https://github.com/p1neappleXpress/OpenFlux) (GPL-3.0) с патчами MyAppVPN для Beget: точный стартовый отступ, «пробивание» 4-КБ буфера nginx, поддержка флага `\0fc` клиента 0.5, keepalive для быстрого освобождения процессов, токены и лимиты. Скрипт патча — `patch-phpbox.js`. Помощник на телефоне — в репозитории приложения, папка `openflux-bridge` (тоже GPL-3.0).

---

# Your own OpenFlux exit for MyAppVPN (Beta)

**OpenFlux** is an experimental MyAppVPN mode: traffic goes through **your own exit** — a PHP script on ordinary web hosting — instead of public VLESS servers. Useful when a mobile carrier only allows "whitelisted" sites and your host is one of them. TCP to ports 80/443 only (DNS goes over DoH automatically), modest speed, sessions reconnect every ~2 minutes automatically.

> ⚠️ **Disclaimer.** Educational project. The author is not responsible for how you use it. In Russia, VPN services for bypassing blocks are restricted by law. Using a host as a proxy may violate its terms. Use at your own risk.

**Steps ([Beget](https://beget.com/p1444343), tested):** create a cloud-hosting site (a free `*.beget.tech` subdomain works) → create FTP access to the site → rename `config.example.php` to `config.php`, set a long random `PHPBOX_TOKEN` and uncomment `PHPBOX_BUS` pointing to a folder **outside** `public_html` (Beget gives each PHP request a private `/tmp`) → upload `phpbox.php` + `config.php` to `public_html` → opening `http://your-site/phpbox.php` should print `no` → in the app: Settings → Experiments → OpenFlux (Beta) → paste the URL and token → Save → enable → Connect.

**Notes:** `*.beget.tech` subdomains have no HTTPS (the token and site names are visible on the path; HTTPS content stays encrypted) — attach your own domain with a free SSL certificate to use `https://`. Keep the token private. Each connection holds one PHP process; ~10 concurrent users is comfortable on cloud hosting.

Server script: OpenFlux `deploy/phpbox/phpbox.php` (GPL-3.0) with MyAppVPN patches (see `patch-phpbox.js`); phone-side bridge: `openflux-bridge` in the app repository (GPL-3.0).
