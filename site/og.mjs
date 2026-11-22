// Renders docs/assets/og-<lang>.png (1200×630) for every language via headless Chrome (CDP).
//   node site/og.mjs
import fs from "node:fs"; import os from "node:os"; import path from "node:path";
import { spawn } from "node:child_process";
import { fileURLToPath, pathToFileURL } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const docs = path.resolve(here, "..", "docs");
const CHROME = ["C:/Program Files/Google/Chrome/Application/chrome.exe", "/usr/bin/google-chrome", "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"].find((p) => fs.existsSync(p));
const langs = fs.readdirSync(path.join(here, "i18n")).filter((f) => f.endsWith(".json")).map((f) => f.slice(0, -5));
const shot = pathToFileURL(path.join(docs, "screenshots", "home-dark.png")).href;

const html = (t) => {
  const lines = t.hero.title.split("<br>");
  const font = t.lang === "fa" ? "Vazirmatn" : t.lang.startsWith("zh") ? "Noto Sans SC" : "Onest";
  const disp = t.lang === "fa" ? "Vazirmatn" : "Unbounded";
  return `<!doctype html><html lang="${t.lang}" dir="${t.dir}"><head><meta charset="utf-8">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Onest:wght@500;600&family=Unbounded:wght@700;800&family=Vazirmatn:wght@600;800&family=Noto+Sans+SC:wght@600;800&display=block">
<style>
*{box-sizing:border-box;margin:0}
html,body{width:1200px;height:630px;overflow:hidden;background:#07090d;color:#e9eef7;font-family:${font},"Noto Sans SC",sans-serif}
body{position:relative;padding:64px 72px;display:flex;flex-direction:column}
body::before{content:"";position:absolute;inset:0;background:radial-gradient(520px 380px at 86% 30%,rgba(77,141,255,.32),transparent 70%),radial-gradient(500px 300px at 0% 100%,rgba(60,90,200,.18),transparent 70%)}
.grid{position:absolute;inset:0;background-image:radial-gradient(rgba(143,184,255,.18) 1px,transparent 1px);background-size:28px 28px;mask-image:linear-gradient(90deg,transparent,#000 60%)}
.brand,.chips{align-self:flex-start}
.brand{position:relative;display:flex;align-items:center;gap:14px;font:800 30px/1 Unbounded,sans-serif;letter-spacing:-.01em;direction:ltr}
.brand svg{width:44px;height:44px}
h1{position:relative;margin-top:54px;font:800 ${t.lang === "fa" ? 70 : 66}px/1.06 ${disp},${font},sans-serif;letter-spacing:${t.lang === "fa" ? 0 : "-.035em"};max-width:700px}
h1 em{font-style:normal;background:linear-gradient(100deg,#cfe0ff,#8fb8ff 40%,#4d8dff);-webkit-background-clip:text;background-clip:text;color:transparent}
p{position:relative;margin-top:26px;font-size:25px;color:#93a0b6;max-width:640px;line-height:1.35}
.chips{position:relative;margin-top:auto;display:flex;gap:10px;direction:ltr}
.chips span{padding:9px 16px;border-radius:99px;font:600 17px/1 Onest,sans-serif;color:#8fb8ff;background:rgba(77,141,255,.1);box-shadow:0 0 0 1px rgba(77,141,255,.3) inset}
.phone{position:absolute;inset-inline-end:84px;top:70px;width:300px;padding:10px;border-radius:44px;background:linear-gradient(160deg,#2a3242,#0f131b 40%,#1a202b);box-shadow:0 0 0 1px rgba(255,255,255,.08) inset,0 50px 100px -30px #000,0 0 140px -20px rgba(77,141,255,.6);transform:rotate(${t.dir === "rtl" ? -6 : 6}deg)}
.phone img{width:100%;border-radius:35px;display:block}
.ring{position:absolute;inset-inline-end:-10px;top:-40px;width:520px;height:520px;border-radius:50%;border:1px solid rgba(143,184,255,.18)}
.ring.b{width:700px;height:700px;inset-inline-end:-100px;top:-130px;border-color:rgba(143,184,255,.1)}
</style></head><body>
<div class="grid"></div><div class="ring"></div><div class="ring b"></div>
<div class="brand"><svg viewBox="0 0 32 32"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#8FB8FF"/><stop offset="1" stop-color="#3E7BFA"/></linearGradient></defs><circle cx="16" cy="16" r="13" fill="none" stroke="url(#g)" stroke-width="2.6" stroke-dasharray="62 20" transform="rotate(-60 16 16)"/><circle cx="16" cy="16" r="5" fill="url(#g)"/></svg>MyAppVPN</div>
<h1>${lines[0]}<br>${lines[1] || ""}</h1>
<p>${t.hero.h1.replace(/^MyAppVPN\s*[—-]\s*/, "")}</p>
<div class="chips"><span>VLESS + REALITY</span><span>Xray-core</span><span>Android TV</span><span>GPL-3.0</span></div>
<div class="phone"><img src="${shot}"></div>
</body></html>`;
};

const prof = fs.mkdtempSync(path.join(os.tmpdir(), "og-"));
const port = 9800 + Math.floor(Math.random() * 100);
const ch = spawn(CHROME, ["--headless=new", `--remote-debugging-port=${port}`, `--user-data-dir=${prof}`, "--hide-scrollbars", "--allow-file-access-from-files", "about:blank"], { stdio: "ignore" });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let tabs; for (let i = 0; i < 50 && !tabs; i++) { try { tabs = await (await fetch(`http://127.0.0.1:${port}/json`)).json(); } catch { await sleep(200); } }
const ws = new WebSocket(tabs.find((x) => x.type === "page").webSocketDebuggerUrl);
await new Promise((r) => ws.addEventListener("open", r));
let id = 0; const pend = new Map();
ws.addEventListener("message", (e) => { const m = JSON.parse(e.data); if (m.id && pend.has(m.id)) { pend.get(m.id)(m.result); pend.delete(m.id); } });
const send = (method, params = {}) => new Promise((r) => { const i = ++id; pend.set(i, r); ws.send(JSON.stringify({ id: i, method, params })); });
await send("Emulation.setDeviceMetricsOverride", { width: 1200, height: 630, deviceScaleFactor: 1, mobile: false });
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "ogh-"));
for (const l of langs) {
  const t = JSON.parse(fs.readFileSync(path.join(here, "i18n", l + ".json"), "utf8"));
  const f = path.join(tmp, l + ".html"); fs.writeFileSync(f, html(t));
  await send("Page.navigate", { url: pathToFileURL(f).href }); await sleep(2500);
  const { data } = await send("Page.captureScreenshot", { format: "png", clip: { x: 0, y: 0, width: 1200, height: 630, scale: 1 } });
  fs.writeFileSync(path.join(docs, "assets", `og-${l}.png`), Buffer.from(data, "base64"));
  console.log("og-" + l + ".png");
}
{ const cp = await import("node:child_process"); const tag = path.basename(prof);
  if (process.platform === "win32") cp.spawnSync("powershell", ["-NoProfile", "-Command", `Get-CimInstance Win32_Process -Filter "Name='chrome.exe'" | Where-Object { $_.CommandLine -like '*${tag}*' } | ForEach-Object { Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue }`]);
  else cp.spawnSync("pkill", ["-f", tag]); }
process.exit(0);
