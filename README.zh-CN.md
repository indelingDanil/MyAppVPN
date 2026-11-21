<h1 align="center">MyAppVPN</h1>

<p align="center"><b>一款能自动找到可用服务器的 Android Xray / VLESS VPN 客户端。</b></p>

<p align="center">
  <a href="README.md">English</a> · <a href="README.ru.md">Русский</a> · <a href="README.fa.md">فارسی</a> · <b>简体中文</b> · <a href="README.tr.md">Türkçe</a> · <a href="README.kk.md">Қазақша</a> · <a href="README.uz.md">Oʻzbekcha</a>
</p>

<p align="center">
  <a href="https://github.com/indelingDanil/MyAppVPN/releases/latest"><img src="https://img.shields.io/github/v/release/indelingDanil/MyAppVPN?label=release" alt="最新版本"></a>
  <a href="https://github.com/indelingDanil/MyAppVPN/releases"><img src="https://img.shields.io/github/downloads/indelingDanil/MyAppVPN/total?label=downloads" alt="下载量"></a>
  <a href="https://github.com/indelingDanil/MyAppVPN-CodeBase"><img src="https://img.shields.io/badge/license-GPL--3.0-blue" alt="许可证 GPL-3.0"></a>
  <img src="https://img.shields.io/badge/Android-8.0%2B-3DDC84?logo=android&logoColor=white" alt="Android 8.0+">
  <a href="https://t.me/myappvpn_dprog"><img src="https://img.shields.io/badge/Telegram-channel-26A5E4?logo=telegram&logoColor=white" alt="Telegram 频道"></a>
</p>

## 简介

MyAppVPN 是一款 Android 上的 Xray / VLESS 客户端。只需点一下按钮，它就会自动找到可用的服务器并连接；如果当前服务器被封锁，会即时切换到另一台。服务器来自公开列表以及本项目自己的自动更新订阅 [MyAppVPN-subs](https://github.com/indelingDanil/MyAppVPN-subs)。当普通服务器无法连通时（例如只放行“白名单”的移动网络），可以使用 **OpenFlux** 模式，在普通的网页虚拟主机上搭建你自己的出口。

这是一个个人开源项目：不是创业公司，没有投资人，也没有遥测。目前下载量已超过 30,000 次。

应用界面为俄语；如果手机系统语言是英语，则显示英文界面。因此下文中的菜单名称同时给出英文和俄文。

## 截图

<p align="center">
  <img src="docs/screenshots/home-dark.png" width="200" alt="主页">
  <img src="docs/screenshots/servers.png" width="200" alt="服务器">
  <img src="docs/screenshots/settings.png" width="200" alt="设置">
  <img src="docs/screenshots/stats.png" width="200" alt="统计">
  <img src="docs/screenshots/home-light.png" width="200" alt="浅色主题">
</p>

## 主要功能

- **自动模式** —— 一键连接：应用自动找到可用服务器并连接。
- **内置负载均衡** —— 以**真实的 Telegram 可达性**（而不仅仅是 ping）检测服务器，始终保持最快的可用服务器。
- **无缝切换** —— 服务器被封锁时，流量无需重连即可转到另一台服务器。
- **Auto / Manual** (Авто / Вручную) 切换 —— 也可以手动选择服务器，切换即时生效。
- **国家过滤** —— 默认排除俄罗斯服务器（延迟低，但从那里无法访问 Telegram/YouTube）；可自行设置。
- 服务器列表在后台自动更新（zieng2/wl、igareck、MyAppVPN-subs）。
- **分应用代理（Split tunneling）** —— 选择不走 VPN 的应用，或使用反向模式“Only selected via VPN / Только выбранные через VPN”。
- **自定义 DNS** —— Cloudflare、Google、Quad9、AdGuard、Yandex 或你自己的服务器（DoH / 普通），查询经由隧道发送。
- **DPI 绕过（TLS 分片）** —— 可选设置，默认关闭。
- **OpenFlux（Beta）** —— 在普通网页主机上的自建出口，支持 `openflux://` 链接和连接诊断。
- **热点共享** —— HTTP 代理和带密码的 SOCKS5，附分步说明。
- **Kill switch**、**Always-on VPN** 及开机自动连接；可在 Settings → Subscriptions (Настройки → Подписки) 中添加你自己的订阅。
- 实时流量统计、“玻璃”风格设计、**浅色和深色主题**。

## 下载

👉 **[最新 APK —— Releases](https://github.com/indelingDanil/MyAppVPN/releases/latest)**

下载哪个文件（需要 Android 8.0 或更高版本）：

| 文件 | 适用于 |
|---|---|
| `my-app-vpn-…-arm64.apk` | 大多数手机、Android TV 盒子和电视 |
| `my-app-vpn-…-arm32.apk` | 32 位 Android：入门级和较旧的机型（例如 Samsung Galaxy A01 / A10 / A20 / A30、J 和 M 系列）。如果 arm64 版本提示“未安装应用”，请安装此版本 |

安装时请允许“安装未知来源应用”——这是安装任何非 Play 商店 APK 的标准步骤。新版本可直接覆盖安装，设置会保留。

## 快速开始

1. 下载并安装 APK。
2. 打开应用，点击 **CONNECT** (**ПОДКЛЮЧИТЬ**)。
3. 等待状态从“Looking for a working server… / Поиск рабочего сервера…”变为“Protected / Защищено”，即可使用。

如需手动选择服务器，请使用主屏幕上的 **⚡ Auto | 📍 Manual** (Авто | Вручную) 开关或 **Servers** (Серверы) 标签页。

## OpenFlux

OpenFlux（Beta）适用于普通 VLESS 服务器被封锁的网络：应用通过**你自己部署在普通网页主机上的出口**转发流量，连接中断后会话仍可恢复。也可以通过 `openflux://` 链接连接任意 OpenFlux 节点。部署指南见 [`openflux-exit`](https://github.com/indelingDanil/MyAppVPN/tree/openflux-exit) 分支。

## 自有订阅：MyAppVPN-subs

[MyAppVPN-subs](https://github.com/indelingDanil/MyAppVPN-subs) 是一个 GitHub Actions 机器人：自动发现公开的 VLESS 订阅，剔除已删除和长期未更新的来源，每 3 小时收集并检测一次服务器，只保留 REALITY / TLS 服务器，并发布带国旗标记的清洗后列表。它已以“MyAppVPN (auto-collected)”的名称内置在应用中（可在 Settings → Subscriptions (Настройки → Подписки) 中关闭）。供其他客户端（v2rayNG、Hiddify 等）使用的链接：

```
https://cdn.jsdelivr.net/gh/indelingDanil/MyAppVPN-subs@output/vless.txt
```

镜像地址、按国家划分的列表和统计数据见[该仓库的 README](https://github.com/indelingDanil/MyAppVPN-subs#readme)。

## 常见问题

**安装时提示“未安装应用”。**
你的手机是 32 位 Android —— 请下载 `arm32` 版本的 APK。

**能连上，但网站打不开。**
在 Manual (Вручную) 模式下换一台服务器，或切回 Auto (Авто)。如果仍然不行，请在 Settings → Connection (Настройки → Подключение) 中开启 **“DPI bypass (TLS fragmentation) / Обход DPI (фрагментация TLS)”**。

**我的移动网络只允许访问“白名单”网站。**
在这类网络中，普通服务器通常无法使用。请使用 OpenFlux 搭配自建出口；OpenFlux 页面上的 **“Connection diagnostics / Диагностика подключения”** 按钮会显示哪些服务可以访问，以及网络是否像是白名单模式。

**安全吗？**
应用没有任何遥测，源代码公开。但免费的公共服务器由不明身份的人运营 —— 请不要通过它们传输任何重要信息。

**如何让银行应用不走 VPN？**
Settings → Choose apps (Настройки → Выбор приложений) → 勾选相应应用。或者切换到“Only selected via VPN / Только выбранные через VPN”模式，只勾选需要走隧道的应用。

**有 iOS 版本吗？**
暂时没有。捐款将用于购买一台 Mac —— 有了 Mac，我会尝试开发 iOS 版本。

## 支持项目

我计划继续更新、修复和改进这个应用。如果它对你有帮助，欢迎捐款支持 —— 我在攒钱买 Mac，想尝试做 iOS 版本。目前下载量已超过 30,000 次，感谢每一位用户 ❤️

👉 [通过 CloudTips 捐款（卢布）](https://pay.cloudtips.ru/p/8c90d7a5)

👉 USDT (TRC20): `TB3Qn2guzVdj93kUi43KG8gQY6mruGZbNG`

👉 BTC (BTC): `16Bs15Mpu2HAYyVjgiLdwQC1yzLpbf2qyv`

👉 ETH (ERC20): `0x3704ecc83ea8b6a852d63dc82c0badcd761d8e6f`

其他支持方式：报告问题 → [#4](https://github.com/indelingDanil/MyAppVPN/issues/4)，提出想法 → [#5](https://github.com/indelingDanil/MyAppVPN/issues/5)，闲聊 → [#6](https://github.com/indelingDanil/MyAppVPN/issues/6)，或者给仓库点个 ⭐。新版本消息请关注 [Telegram 频道](https://t.me/myappvpn_dprog)。

## 源代码

应用源代码以 **GPL-3.0** 许可证开源：[indelingDanil/MyAppVPN-CodeBase](https://github.com/indelingDanil/MyAppVPN-CodeBase)。版本历史：[CHANGELOG.md](CHANGELOG.md)（英文）。

## 免责声明

> ⚠️ 这是一个**教学**项目，仅用于学习和研究目的。作者**不对**你如何使用本应用**承担任何责任**。在俄罗斯，用于绕过封锁的 VPN 服务受到法律限制，可能被视为违法。使用风险由你自行承担。

## 致谢

- **[zieng2/wl](https://github.com/zieng2/wl)** —— 没有这个服务器来源，就不会有这个应用。一个人全天候、免费地为所有人维护最新的可用 VLESS 服务器列表。不穿斗篷的英雄。
- **[igareck/vpn-configs-for-russia](https://github.com/igareck/vpn-configs-for-russia)** —— 另一个服务器来源。
- **[p1neappleXpress/OpenFlux](https://github.com/p1neappleXpress/OpenFlux)** —— OpenFlux 上游核心（GPL-3.0）。
- **[XTLS/Xray-core](https://github.com/XTLS/Xray-core)** 和 **[xjasonlyu/tun2socks](https://github.com/xjasonlyu/tun2socks)** —— 底层引擎。
- **Claude (Anthropic)** —— 在整个项目开发过程中提供了帮助 🤖 是的，我在开发中使用 AI。不，我不是“氛围编程者”（vibe coder）—— 我是一个经常向机器人请教的程序员。就像 Stack Overflow，只不过问题不会在五年后被关闭。这两者有本质区别，我坚持这一点。
