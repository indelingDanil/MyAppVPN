# Changelog

All notable changes to [MyAppVPN](README.md), newest first. APKs for every version are on the [Releases](https://github.com/indelingDanil/MyAppVPN/releases) page.

## v2.2.0.2 — 2026-11-22

- **Partner card (YepShop)** — Steam, game and service top-ups — on the Home screen (can be hidden for good with ✕) and in the Support tab. A plain link: no ad SDK, no trackers.

## v2.2.0.1 — 2026-11-21

- **New UI languages:** Persian, Simplified Chinese, Turkish, Kazakh and Uzbek (seven with Russian and English).
- **Settings → Appearance → Language:** follows the system language by default; any of the seven can be picked. On Android 13+ it can also be set in the system app settings.
- Nothing else changed. The diagnostics report and some error messages are still in Russian/English.

## v2.2.0 — 2026-11-21

- **OpenFlux 2.5–5× faster.** Reworked protocol: downloads are no longer cut every 4 MB, connections are swapped without a break (make-before-break), and the exit copes better with stalled sites.
- **Split-tunnel server IP leak fixed** ([#8](https://github.com/indelingDanil/MyAppVPN/issues/8)): apps outside the VPN can no longer reach the tunnel via `tun0` or learn the server IP; the local Xray API and proxies are closed to other apps.
- New **"DPI bypass (TLS fragmentation)"** setting (Settings → Connection): splits the start of the TLS connection to the server so a simple DPI can't read the server name. Off by default.
- **OpenFlux `openflux://` links** — connect to any OpenFlux node (your own VPS, a friend's node), encrypted when the link carries a key. Links open straight from chats.
- **Connection diagnostics** probe the availability of services (Mail.ru, Yandex, etc.) and show whether the network looks like a whitelist-only one.
- **Hotspot sharing:** per-install ports (re-enter them on connected devices after the update — they're shown on the sharing screen), the proxy can no longer be used from the phone itself, longer passwords. USB-tethering sharing removed.
- Runs on **Android TV** (TV boxes and TVs); YouTube on TV works through your own OpenFlux exit.
- **Source code is open** under GPL-3.0: [MyAppVPN-CodeBase](https://github.com/indelingDanil/MyAppVPN-CodeBase).

## v2.1.2 — 2026-10-18

- **New design:** a calm palette with a single blue accent instead of neon, a floating glass bottom bar, a new connect button, **light theme**.
- **32-bit Android support** — a separate arm32 APK (requested by a follower).
- The APK is almost half the size (~53 MB instead of ~95).
- **Our own subscription** [MyAppVPN-subs](https://github.com/indelingDanil/MyAppVPN-subs) with a bot that finds and cleans sources itself; built in as "MyAppVPN (auto-collected)". The old beta filter on the `proxylist` branch was disabled: its source was deleted, and the new bot does the same job better and finds sources on its own.
- OpenFlux: short-request mode for carriers that stall long responses, a fallback server address and a "Connection diagnostics" button.

## v2.1.1-beta — 2026-10-11 (pre-release)

- Experimental **OpenFlux** mode: your own exit on ordinary web hosting instead of VLESS servers; sessions survive connection drops.
- A demo server to try it (1 hour or 2 GB once, 8 slots; the demo has since ended); guide for your own exit — the [`openflux-exit`](https://github.com/indelingDanil/MyAppVPN/tree/openflux-exit) branch.

## v2.1.0 — 2026-10-11

Big update.

- Auto/Manual reworked: live switching both ways, manual mode no longer silently jumps to another (possibly Russian) server, and you can see which server carries your traffic.
- **Custom DNS servers** (a follower's idea).
- Split tunneling: "only selected apps via VPN" mode and "select all / invert" (also an idea from GitHub).
- Hotspot sharing rebuilt — it finally works as documented.
- Always-on VPN and auto-connect on boot.
- Security: the kill switch keeps the local port bound, random per-session ports, SSRF-hardened subscriptions.
- Fixes: base64 subscriptions, lost port on `host:port/?…` servers, one broken server no longer takes down the whole Auto mode, the Home tab button in the menu.
- UI fully in Russian (+ English), new "Support" tab.

## v2.0.2-beta — 2026-07-21 (pre-release)

- DNS is resolved via DoH inside the tunnel.
- Kill switch: if the tunnel drops, traffic is blocked instead of leaking, then the connection restores itself.
- HTTP proxy bound to loopback only; server addresses and subscription links removed from release logs.
- Server switching by tap happens live; the server list keeps its scroll position; app search in split tunneling.

## v2.0.2 — 2026-06-26

- The app sticks to a working server instead of jumping to a "faster" one because of ping jitter; it switches only on a real drop, seamlessly.
- Fast auto-selection on start: the app tests servers and picks a fast one, not just the first live one.
- When connected, the server list is updated through the VPN, so all sources are reachable.
- New "Working in the last 24 h" section on the Servers tab.
- Liveness check by real Telegram availability; the Home screen shows the actual server (country/flag) instead of "Auto".

## v2.0.1 — 2026-06-21

- **Custom subscriptions:** Settings → Subscriptions — add or remove your own VLESS list links and turn any source on or off, built-in ones included.
- SSRF protection for user links (https only, local and private addresses rejected), base64 subscription support, the parser no longer breaks on malformed IPv6.

## v2.0.0-Beta — 2026-06-13 (pre-release)

- More tolerant Telegram check (redirects and slow replies no longer count as a drop); the balancer is no longer restarted after a single failed probe; the subscription is fetched from all mirrors in parallel.

## v2.0.0 — 2026-06-08

- **Auto-balancer:** the built-in Xray balancer (observatory) picks a working server based on real Telegram checks and **switches seamlessly** when a server gets blocked.
- Migrated to the unified subscription `zieng2/wl` Universal + `igareck` (5 mirrors with fallback, including ones that work during connectivity restrictions).
- Country filter (Russia excluded by default).
- Instant response on connect and an honest status.
- Reworked UI: a single button, clear Auto/Manual modes.
- Fixed the traffic indicator.

## v1.0.5 — 2026-04-09

Major security update:

- CVE fix: IP leak via the local SOCKS5 without authentication.
- IPv6 leak fix.
- DoH instead of plain DNS.
- Neutral notifications.
- Randomized watchdog patterns.

## v1.0.4 — 2026-04-05

- Health check via Telegram DC (a real circumvention test).
- `xync.net` mirror for configs.
- VPN sharing via Wi‑Fi hotspot (SOCKS5 proxy).
- Filtering of Ukrainian configs.

## v1.0.3 — 2026-03-24

Stability:

- Doze mode protection.
- Adaptive watchdog (reacts in 40 s instead of 90).
- Xray error monitoring.
- Filtering of slow servers.
- Added the `igareck/vpn-configs-for-russia` source — the pool grew to 600+ servers.

## v1.0.2 — 2026-03-22

- Fix: the watchdog fired falsely and switched servers even when the VPN worked fine. The cause: Android blocked the HTTP request inside the check itself. Replaced it with a TCP check — no more switching for no reason.

## v1.0.1 — 2026-03-22

- Minor fixes.

## v1.0 — 2026-03-22

- Initial release.
