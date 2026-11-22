<h1 align="center">MyAppVPN</h1>

<p align="center"><b>Ishlaydigan serverni oʻzi topadigan Android uchun Xray / VLESS VPN-mijoz.</b></p>

<p align="center">
  <a href="README.md">English</a> · <a href="README.ru.md">Русский</a> · <a href="README.fa.md">فارسی</a> · <a href="README.zh-CN.md">简体中文</a> · <a href="README.tr.md">Türkçe</a> · <a href="README.kk.md">Қазақша</a> · <b>Oʻzbekcha</b>
</p>

<p align="center">
  <a href="https://github.com/indelingDanil/MyAppVPN/releases/latest"><img src="https://img.shields.io/github/v/release/indelingDanil/MyAppVPN?label=release" alt="Soʻnggi versiya"></a>
  <a href="https://github.com/indelingDanil/MyAppVPN/releases"><img src="https://img.shields.io/github/downloads/indelingDanil/MyAppVPN/total?label=downloads" alt="Yuklab olishlar"></a>
  <a href="https://github.com/indelingDanil/MyAppVPN-CodeBase"><img src="https://img.shields.io/badge/license-GPL--3.0-blue" alt="Litsenziya GPL-3.0"></a>
  <img src="https://img.shields.io/badge/Android-8.0%2B-3DDC84?logo=android&logoColor=white" alt="Android 8.0+">
  <a href="https://indelingdanil.github.io/MyAppVPN/"><img src="https://img.shields.io/badge/website-indelingdanil.github.io%2FMyAppVPN-4D8DFF" alt="Website"></a>
  <a href="https://t.me/myappvpn_dprog"><img src="https://img.shields.io/badge/Telegram-channel-26A5E4?logo=telegram&logoColor=white" alt="Telegram kanali"></a>
</p>

## Bu nima

MyAppVPN — Android uchun Xray / VLESS mijozi. Bitta tugmani bosasiz — ilova ishlaydigan serverni oʻzi topadi, ulanadi va joriy server bloklansa, darhol boshqasiga oʻtadi. Serverlar ochiq roʻyxatlardan va loyihaning avtomatik yangilanadigan oʻz obunasi — [MyAppVPN-subs](https://github.com/indelingDanil/MyAppVPN-subs)dan olinadi. Oddiy serverlar oʻtmay qolsa (masalan, faqat «oq roʻyxat»dagi saytlarni ochadigan mobil internetda), **OpenFlux** rejimi oddiy veb-xostingda oʻz chiqish nuqtangizni ishga tushirish imkonini beradi.

Ochiq kodli shaxsiy loyiha: startap emas, investorlar yoʻq, telemetriya yoʻq. Hozirgacha 30 000 dan ortiq marta yuklab olingan.

Ilova interfeysi rus tilida (telefonning tizim tili ingliz tili boʻlsa — inglizcha), shuning uchun quyida menyu nomlari ruscha berilgan.

## Skrinshotlar

<p align="center">
  <img src="docs/screenshots/home-dark.png" width="200" alt="Bosh ekran">
  <img src="docs/screenshots/servers.png" width="200" alt="Serverlar">
  <img src="docs/screenshots/settings.png" width="200" alt="Sozlamalar">
  <img src="docs/screenshots/stats.png" width="200" alt="Statistika">
  <img src="docs/screenshots/home-light.png" width="200" alt="Yorugʻ mavzu">
</p>

## Asosiy imkoniyatlar

- **Avto-rejim** — bitta bosish: ilova ishlaydigan serverni oʻzi topib, ulanadi.
- **Ichki balanslovchi** — serverlarni oddiy ping bilan emas, **Telegram’ning haqiqiy ochilishi** boʻyicha tekshiradi va eng tez ishlaydiganini ushlab turadi.
- **Uzluksiz almashish** — server bloklansa, trafik qayta ulanmasdan boshqa server orqali oʻtishda davom etadi.
- **Авто / Вручную** almashtirgichi — serverni oʻzingiz tanlashingiz mumkin, almashish darhol amalga oshadi.
- **Mamlakatlar filtri** — Rossiya serverlari sukut boʻyicha chiqarib tashlangan (kechikishi kam, lekin u yerdan Telegram/YouTube ochilmaydi); sozlash mumkin.
- Serverlar roʻyxati fonda avtomatik yangilanadi (zieng2/wl, igareck, MyAppVPN-subs).
- **Ajratilgan tunnel (split tunneling)** — VPN’ni chetlab oʻtadigan ilovalarni tanlang yoki teskari rejim — «Только выбранные через VPN»dan foydalaning.
- **Oʻz DNS’ingiz** — Cloudflare, Google, Quad9, AdGuard, Yandex yoki oʻz serveringiz (DoH / oddiy), soʻrovlar tunnel orqali oʻtadi.
- **DPI’ni chetlab oʻtish (TLS fragmentatsiyasi)** — qoʻshimcha sozlama, sukut boʻyicha oʻchirilgan.
- **OpenFlux (Beta)** — oddiy veb-xostingdagi oʻz chiqish nuqtangiz, `openflux://` havolalari va ulanish diagnostikasi.
- **Hotspot orqali tarqatish** — HTTP-proksi va parolli SOCKS5, bosqichma-bosqich yoʻriqnoma bilan.
- **Kill switch**, **Always-on VPN** va telefon yonganda avtomatik ulanish; oʻz obunalaringizni Настройки → Подписки boʻlimida qoʻshishingiz mumkin.
- Real vaqtdagi trafik statistikasi, «shisha» dizayn, **yorugʻ va qorongʻi mavzular**.

## Yuklab olish

👉 **[Soʻnggi APK — Releases](https://github.com/indelingDanil/MyAppVPN/releases/latest)**

Qaysi faylni yuklash kerak (Android 8.0 yoki yangiroq):

| Fayl | Kim uchun |
|---|---|
| `my-app-vpn-…-arm64.apk` | Aksariyat telefonlar, Android TV pristavkalari va televizorlar |
| `my-app-vpn-…-arm32.apk` | 32 bitli Android: arzon va eski modellar (masalan, Samsung Galaxy A01 / A10 / A20 / A30, J va M seriyalari). arm64 «Ilova oʻrnatilmadi» desa, shuni oʻrnating |

Oʻrnatishda nomaʼlum manbalardan oʻrnatishga ruxsat bering — Play Store’dan tashqaridagi har qanday APK uchun bu odatiy qadam. Yangi versiya eskisining ustidan oʻrnatiladi, sozlamalar saqlanib qoladi.

## Tez boshlash

1. APK’ni yuklab olib, oʻrnating.
2. Ilovani oching va **ПОДКЛЮЧИТЬ** tugmasini bosing.
3. Holat «Поиск рабочего сервера…» → «Защищено» boʻlishini kuting. Tayyor.

Serverni oʻzingiz tanlash uchun bosh ekrandagi **⚡ Авто | 📍 Вручную** almashtirgichidan yoki **Серверы** boʻlimidan foydalaning.

## OpenFlux

OpenFlux (Beta) oddiy VLESS-serverlar bloklanadigan tarmoqlar uchun: ilova trafikni **oddiy veb-xostingdagi oʻz chiqish nuqtangiz** orqali oʻtkazadi, sessiyalar esa aloqa uzilganda ham saqlanib qoladi. Istalgan OpenFlux tuguniga `openflux://` havolasi orqali ham ulanish mumkin. Sozlash boʻyicha yoʻriqnoma — [`openflux-exit`](https://github.com/indelingDanil/MyAppVPN/tree/openflux-exit) branch’ida.

## Oʻz obunamiz: MyAppVPN-subs

[MyAppVPN-subs](https://github.com/indelingDanil/MyAppVPN-subs) — GitHub Actions boti: ochiq VLESS obunalarini oʻzi topadi, oʻchirilgan va eskirgan manbalarni olib tashlaydi, har 3 soatda serverlarni yigʻib tekshiradi, faqat REALITY / TLS serverlarini qoldiradi va mamlakat bayroqlari bilan tozalangan roʻyxatni eʼlon qiladi. Ilovaga u «MyAppVPN (авто-сбор)» nomi bilan oʻrnatilgan (Настройки → Подписки boʻlimida oʻchirish mumkin). Boshqa mijozlar (v2rayNG, Hiddify va h.k.) uchun havola:

```
https://cdn.jsdelivr.net/gh/indelingDanil/MyAppVPN-subs@output/vless.txt
```

Koʻzgular, mamlakatlar boʻyicha roʻyxatlar va statistika — [repozitoriyning README faylida](https://github.com/indelingDanil/MyAppVPN-subs#readme).

## Koʻp beriladigan savollar

**Oʻrnatishda «Ilova oʻrnatilmadi» chiqadi.**
Telefoningizda 32 bitli Android — `arm32` APK’ni yuklab oling.

**Ulanadi, lekin saytlar ochilmaydi.**
«Вручную» rejimida boshqa serverni tanlang yoki «Авто»ga qayting. Yordam bermasa, Настройки → Подключение boʻlimida **«Обход DPI (фрагментация TLS)»** sozlamasini yoqing.

**Mobil internetim faqat «oq roʻyxat»dagi saytlarni ochadi.**
Bunday tarmoqlarda oddiy serverlar koʻpincha ishlamaydi. Oʻz chiqish nuqtangiz bilan OpenFlux’dan foydalaning; OpenFlux ekranidagi **«Диагностика подключения»** tugmasi qaysi xizmatlar ochilishini va tarmoq «oq roʻyxat» rejimiga oʻxshash-oʻxshamasligini koʻrsatadi.

**Bu xavfsizmi?**
Ilovada telemetriya yoʻq, kodi ochiq. Ammo bepul ochiq serverlarni nomaʼlum odamlar yuritadi — ular orqali qimmatli hech narsa yubormang.

**Bank ilovasini VPN’siz qanday ishlataman?**
Настройки → Выбор приложений → keraklilarini belgilang. Yoki «Только выбранные через VPN» rejimini yoqib, faqat tunnel orqali oʻtishi kerak boʻlgan ilovalarni belgilang.

**iOS versiyasi bormi?**
Hozircha yoʻq. Donatlar Mac uchun yigʻilmoqda — Mac boʻlsa, iOS versiyasini ham yaratib koʻraman.

## Loyihani qoʻllab-quvvatlash

Ilovani yangilash, tuzatish va yaxshilashda davom etishni rejalashtiryapman. Agar u foydali boʻlgan boʻlsa, donat katta yordam — iOS versiyasini ham sinab koʻrish uchun Mac’ga pul yigʻyapman. Hozirgacha 30 000 dan ortiq yuklab olish — hammaga rahmat ❤️

👉 [CloudTips orqali donat (RUB)](https://pay.cloudtips.ru/p/8c90d7a5)

👉 USDT (TRC20): `TB3Qn2guzVdj93kUi43KG8gQY6mruGZbNG`

👉 BTC (BTC): `16Bs15Mpu2HAYyVjgiLdwQC1yzLpbf2qyv`

👉 ETH (ERC20): `0x3704ecc83ea8b6a852d63dc82c0badcd761d8e6f`

Boshqacha ham yordam berish mumkin: xatolar haqida xabar → [#4](https://github.com/indelingDanil/MyAppVPN/issues/4), gʻoyalar → [#5](https://github.com/indelingDanil/MyAppVPN/issues/5), suhbat → [#6](https://github.com/indelingDanil/MyAppVPN/issues/6) yoki repozitoriyga ⭐ qoʻying. Yangi versiyalar haqida xabarlar — [Telegram kanalida](https://t.me/myappvpn_dprog).

## Manba kodi

Ilova kodi **GPL-3.0** litsenziyasi ostida ochiq: [indelingDanil/MyAppVPN-CodeBase](https://github.com/indelingDanil/MyAppVPN-CodeBase). Versiyalar tarixi: [CHANGELOG.md](CHANGELOG.md) (inglizcha).

## Masʼuliyatdan voz kechish

> ⚠️ Bu taʼlim va tadqiqot maqsadlarida yaratilgan **oʻquv** loyihasi. Muallif ilovadan qanday foydalanishingiz uchun **javobgar emas**. Rossiyada blokirovkalarni chetlab oʻtishga moʻljallangan VPN-xizmatlar qonun bilan cheklangan va noqonuniy deb topilishi mumkin. Barcha xavf oʻzingizning zimmangizda.

## Minnatdorchilik

- **[zieng2/wl](https://github.com/zieng2/wl)** — bu serverlar manbasi boʻlmaganida, ilova umuman mavjud boʻlmas edi. Bir kishi ishlaydigan VLESS-serverlarning dolzarb roʻyxatini kechayu kunduz, bepul va hamma uchun yuritib keladi. Plashsiz qahramon.
- **[igareck/vpn-configs-for-russia](https://github.com/igareck/vpn-configs-for-russia)** — yana bir serverlar manbasi.
- **[p1neappleXpress/OpenFlux](https://github.com/p1neappleXpress/OpenFlux)** — OpenFlux’ning asl yadrosi (GPL-3.0).
- **[XTLS/Xray-core](https://github.com/XTLS/Xray-core)** va **[xjasonlyu/tun2socks](https://github.com/xjasonlyu/tun2socks)** — kapot ostidagi dvigatel.
- **Claude (Anthropic)** — butun loyiha davomida ishlab chiqishda yordam berdi 🤖 Ha, ishlab chiqishda sunʼiy intellektdan foydalanaman. Yoʻq, men «vaybkoder» emasman — robot bilan juda tez-tez maslahatlashadigan dasturchiman. Stack Overflow kabi, faqat savol besh yildan keyin yopilib qolmaydi. Farq tubdan, men shunga qatʼiy turibman.
