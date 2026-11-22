<h1 align="center">MyAppVPN</h1>

<p align="center"><b>Çalışan sunucuyu kendisi bulan, Android için Xray / VLESS VPN istemcisi.</b></p>

<p align="center">
  <a href="README.md">English</a> · <a href="README.ru.md">Русский</a> · <a href="README.fa.md">فارسی</a> · <a href="README.zh-CN.md">简体中文</a> · <b>Türkçe</b> · <a href="README.kk.md">Қазақша</a> · <a href="README.uz.md">Oʻzbekcha</a>
</p>

<p align="center">
  <a href="https://github.com/indelingDanil/MyAppVPN/releases/latest"><img src="https://img.shields.io/github/v/release/indelingDanil/MyAppVPN?label=release" alt="Son sürüm"></a>
  <a href="https://github.com/indelingDanil/MyAppVPN/releases"><img src="https://img.shields.io/github/downloads/indelingDanil/MyAppVPN/total?label=downloads" alt="İndirmeler"></a>
  <a href="https://github.com/indelingDanil/MyAppVPN-CodeBase"><img src="https://img.shields.io/badge/license-GPL--3.0-blue" alt="Lisans: GPL-3.0"></a>
  <img src="https://img.shields.io/badge/Android-8.0%2B-3DDC84?logo=android&logoColor=white" alt="Android 8.0+">
  <a href="https://indelingdanil.github.io/MyAppVPN/"><img src="https://img.shields.io/badge/website-indelingdanil.github.io%2FMyAppVPN-4D8DFF" alt="Website"></a>
  <a href="https://t.me/myappvpn_dprog"><img src="https://img.shields.io/badge/Telegram-channel-26A5E4?logo=telegram&logoColor=white" alt="Telegram kanalı"></a>
</p>

## Nedir

MyAppVPN, Android için bir Xray / VLESS istemcisidir. Tek bir düğmeye dokunursunuz; uygulama çalışan bir sunucu bulur, bağlanır ve mevcut sunucu engellenirse anında başka birine geçer. Sunucular herkese açık listelerden ve projenin kendi otomatik güncellenen aboneliği [MyAppVPN-subs](https://github.com/indelingDanil/MyAppVPN-subs)'tan gelir. Normal sunucular işe yaramadığında (örneğin yalnızca "beyaz listedeki" adreslere izin veren mobil ağlarda), **OpenFlux** modu sıradan bir web hostingi üzerinde kendi çıkış noktanızı kurmanızı sağlar.

Kişisel, açık kaynaklı bir proje: girişim değil, yatırımcı yok, telemetri yok. Şimdiye kadar 30.000'den fazla indirme.

Uygulamanın arayüzü Rusçadır; telefonun sistem dili İngilizceyse İngilizce görünür. Bu yüzden aşağıda menü adları her iki dilde verilmiştir.

## Ekran görüntüleri

<p align="center">
  <img src="docs/screenshots/home-dark.png" width="200" alt="Ana ekran">
  <img src="docs/screenshots/servers.png" width="200" alt="Sunucular">
  <img src="docs/screenshots/settings.png" width="200" alt="Ayarlar">
  <img src="docs/screenshots/stats.png" width="200" alt="İstatistikler">
  <img src="docs/screenshots/home-light.png" width="200" alt="Açık tema">
</p>

## Temel özellikler

- **Otomatik mod** — tek dokunuş: uygulama çalışan bir sunucu bulur ve bağlanır.
- **Yerleşik dengeleyici** — sunucuları yalnızca ping ile değil, **gerçek Telegram erişilebilirliğiyle** test eder ve en hızlı çalışan sunucuyu tutar.
- **Kesintisiz geçiş** — bir sunucu engellenirse trafik yeniden bağlanmadan başka bir sunucudan akmaya devam eder.
- **Auto / Manual** (Авто / Вручную) anahtarı — sunucuyu kendiniz seçebilirsiniz; geçiş anında olur.
- **Ülke filtresi** — Rusya'daki sunucular varsayılan olarak hariç tutulur (gecikmeleri düşüktür ama oradan Telegram/YouTube çalışmaz); ayarlanabilir.
- Sunucu listesi arka planda otomatik güncellenir (zieng2/wl, igareck, MyAppVPN-subs).
- **Bölünmüş tünelleme (split tunneling)** — VPN dışında kalacak uygulamaları seçin veya ters "Only selected via VPN / Только выбранные через VPN" modunu kullanın.
- **Özel DNS** — Cloudflare, Google, Quad9, AdGuard, Yandex veya kendi sunucunuz (DoH / düz); sorgular tünel üzerinden gider.
- **DPI atlatma (TLS parçalama)** — isteğe bağlı ayar, varsayılan olarak kapalı.
- **OpenFlux (Beta)** — sıradan web hostingi üzerinde kendi çıkışınız, `openflux://` bağlantıları ve bağlantı tanılama.
- **Hotspot paylaşımı** — HTTP proxy ve parola korumalı SOCKS5, adım adım kılavuzla.
- **Kill switch**, **Always-on VPN** ve telefon açılışında otomatik bağlanma; kendi aboneliklerinizi Settings → Subscriptions (Настройки → Подписки) bölümünden ekleyebilirsiniz.
- Gerçek zamanlı trafik istatistikleri, "cam" tasarım, **açık ve koyu tema**.

## İndirme

👉 **[Son APK — Releases](https://github.com/indelingDanil/MyAppVPN/releases/latest)**

Hangi dosya (Android 8.0 veya üstü):

| Dosya | Kimin için |
|---|---|
| `my-app-vpn-…-arm64.apk` | Çoğu telefon, Android TV kutuları ve televizyonlar |
| `my-app-vpn-…-arm32.apk` | 32 bit Android: giriş seviyesi ve eski modeller (ör. Samsung Galaxy A01 / A10 / A20 / A30, J ve M serisi). arm64 sürümü "Uygulama yüklenmedi" diyorsa bunu kurun |

Kurulum sırasında bilinmeyen kaynaklardan yüklemeye izin verin — Play Store dışındaki her APK için bu standart bir adımdır. Güncellemeler eski sürümün üzerine kurulur ve ayarlar korunur.

## Hızlı başlangıç

1. APK'yı indirip kurun.
2. Uygulamayı açın ve **CONNECT** (**ПОДКЛЮЧИТЬ**) düğmesine dokunun.
3. Durumun "Looking for a working server… / Поиск рабочего сервера…" → "Protected / Защищено" olmasını bekleyin. Hepsi bu.

Sunucuyu kendiniz seçmek için ana ekrandaki **⚡ Auto | 📍 Manual** (Авто | Вручную) anahtarını veya **Servers** (Серверы) sekmesini kullanın.

## OpenFlux

OpenFlux (Beta), normal VLESS sunucularının engellendiği ağlar içindir: uygulama trafiği **sıradan bir web hostingindeki kendi çıkışınız** üzerinden geçirir ve oturumlar bağlantı kopmalarından sonra devam eder. Herhangi bir OpenFlux düğümüne `openflux://` bağlantısıyla da bağlanabilirsiniz. Kurulum kılavuzu: [`openflux-exit`](https://github.com/indelingDanil/MyAppVPN/tree/openflux-exit) dalı.

## Kendi aboneliğimiz: MyAppVPN-subs

[MyAppVPN-subs](https://github.com/indelingDanil/MyAppVPN-subs), herkese açık VLESS aboneliklerini bulan, silinmiş ve güncellenmeyen kaynakları ayıklayan, sunucuları 3 saatte bir toplayıp kontrol eden, yalnızca REALITY / TLS sunucularını tutan ve ülke bayraklarıyla temizlenmiş bir liste yayınlayan bir GitHub Actions botudur. Uygulamaya "MyAppVPN (auto-collected)" adıyla yerleşiktir (Settings → Subscriptions (Настройки → Подписки) bölümünden kapatılabilir). Diğer istemciler (v2rayNG, Hiddify vb.) için bağlantı:

```
https://cdn.jsdelivr.net/gh/indelingDanil/MyAppVPN-subs@output/vless.txt
```

Yansılar, ülkelere göre listeler ve istatistikler [deponun README dosyasında](https://github.com/indelingDanil/MyAppVPN-subs#readme).

## SSS

**Kurulumda "Uygulama yüklenmedi" hatası alıyorum.**
Telefonunuzda 32 bit Android var — `arm32` APK'sını indirin.

**Bağlanıyor ama siteler açılmıyor.**
Manual (Вручную) modunda başka bir sunucu seçin veya Auto (Авто) moduna dönün. İşe yaramazsa Settings → Connection (Настройки → Подключение) bölümünde **"DPI bypass (TLS fragmentation) / Обход DPI (фрагментация TLS)"** seçeneğini açın.

**Mobil ağım yalnızca "beyaz listedeki" sitelere izin veriyor.**
Bu tür ağlarda normal sunucular çoğu zaman çalışmaz. Kendi çıkışınızla OpenFlux kullanın; OpenFlux ekranındaki **"Connection diagnostics / Диагностика подключения"** düğmesi hangi servislere erişilebildiğini ve ağın beyaz liste moduna benzeyip benzemediğini gösterir.

**Güvenli mi?**
Uygulamada telemetri yok ve kaynak kodu açık. Ancak ücretsiz genel sunucuları kim olduğu bilinmeyen kişiler işletiyor — üzerlerinden değerli hiçbir şey göndermeyin.

**Banka uygulamamı VPN dışında nasıl tutarım?**
Settings → Choose apps (Настройки → Выбор приложений) → uygulamaları işaretleyin. Ya da "Only selected via VPN / Только выбранные через VPN" moduna geçip yalnızca tünelden geçmesi gerekenleri işaretleyin.

**iOS sürümü var mı?**
Henüz yok. Bağışlar bir Mac için biriktiriliyor — bir Mac olursa iOS sürümünü de denemeye çalışacağım.

## Projeye destek

Uygulamayı güncellemeye, düzeltmeye ve geliştirmeye devam etmeyi planlıyorum. İşinize yaradıysa bir bağış çok yardımcı olur — iOS sürümünü de deneyebilmek için bir Mac'e para biriktiriyorum. Şimdiye kadar 30.000'den fazla indirme — herkese teşekkürler ❤️

👉 [CloudTips ile bağış yap (RUB)](https://pay.cloudtips.ru/p/8c90d7a5)

👉 USDT (TON): `UQBi78BaJNXuEXHrP-OhuFAIf29yvpIo1s2agHiTQPB-xWbE`

👉 USDT (TRC20): `TYaGhM39zKXS3g177R6VvBhNLkbsFgYAHj`

👉 BTC (BTC): `bc1qjrtd68le7dcd2h2psqcgmp4nvcp9p092m7ew8z`

👉 USDT (BEP20): `0xB65bb82aB8f85db12b3DEfebE2a4a0b210f097d6`

Başka yollarla da yardım edebilirsiniz: hata raporları → [#4](https://github.com/indelingDanil/MyAppVPN/issues/4), fikirler → [#5](https://github.com/indelingDanil/MyAppVPN/issues/5), sohbet → [#6](https://github.com/indelingDanil/MyAppVPN/issues/6) ya da depoya bir ⭐ verin. Yeni sürüm haberleri: [Telegram kanalı](https://t.me/myappvpn_dprog).

## Kaynak kodu

Uygulama **GPL-3.0** lisansıyla açık kaynaklıdır: [indelingDanil/MyAppVPN-CodeBase](https://github.com/indelingDanil/MyAppVPN-CodeBase). Sürüm geçmişi: [CHANGELOG.md](CHANGELOG.md) (İngilizce).

## Sorumluluk reddi

> ⚠️ Bu, öğrenme ve araştırma amacıyla yapılmış **eğitim amaçlı** bir projedir. Yazar, uygulamayı nasıl kullandığınızdan **sorumlu değildir**. Rusya'da engelleri aşmaya yönelik VPN hizmetleri yasayla kısıtlanmıştır ve yasa dışı sayılabilir. Kullanım riski size aittir.

## Teşekkürler

- **[zieng2/wl](https://github.com/zieng2/wl)** — bu sunucu kaynağı olmasaydı uygulama hiç var olmazdı. Tek bir kişi, çalışan VLESS sunucularının güncel listesini 7/24, ücretsiz ve herkes için tutuyor. Pelerinsiz bir kahraman.
- **[igareck/vpn-configs-for-russia](https://github.com/igareck/vpn-configs-for-russia)** — bir başka sunucu kaynağı.
- **[p1neappleXpress/OpenFlux](https://github.com/p1neappleXpress/OpenFlux)** — OpenFlux'un asıl (upstream) çekirdeği (GPL-3.0).
- **[XTLS/Xray-core](https://github.com/XTLS/Xray-core)** ve **[xjasonlyu/tun2socks](https://github.com/xjasonlyu/tun2socks)** — kaputun altındaki motor.
- **Claude (Anthropic)** — proje boyunca geliştirmede yardımcı oldu 🤖 Evet, geliştirmede yapay zekâ kullanıyorum. Hayır, "vibe coder" değilim — sadece bir robota çok sık danışan bir programcıyım. Stack Overflow gibi, tek farkla: soru beş yıl sonra kapatılmıyor. Arada temel bir fark var, ısrar ediyorum.
