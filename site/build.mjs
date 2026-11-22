// Builds the multilingual landing into ../docs (GitHub Pages: main branch, /docs).
//   node site/build.mjs           build once
//   node site/build.mjs --watch   rebuild on changes in site/ and docs/assets/
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const docs = path.resolve(here, "..", "docs");

// Order = order in the language menu. Root (/) is English = x-default.
const LANGS = [
  { lang: "en", dir: "", hreflang: "en", ogLocale: "en_US" },
  { lang: "ru", dir: "ru", hreflang: "ru", ogLocale: "ru_RU" },
  { lang: "fa", dir: "fa", hreflang: "fa", ogLocale: "fa_IR" },
  { lang: "zh", dir: "zh", hreflang: "zh-Hans", ogLocale: "zh_CN" },
  { lang: "tr", dir: "tr", hreflang: "tr", ogLocale: "tr_TR" },
  { lang: "kk", dir: "kk", hreflang: "kk", ogLocale: "kk_KZ" },
  { lang: "uz", dir: "uz", hreflang: "uz", ogLocale: "uz_UZ" },
];

async function build() {
  const cfg = JSON.parse(fs.readFileSync(path.join(here, "config.json"), "utf8"));
  cfg.assetVersion = Date.now().toString(36);
  const { page } = await import(pathToFileURL(path.join(here, "page.mjs")).href + "?t=" + Date.now());

  const avail = LANGS.filter((l) => fs.existsSync(path.join(here, "i18n", l.lang + ".json")));
  const strings = Object.fromEntries(avail.map((l) => [l.lang, JSON.parse(fs.readFileSync(path.join(here, "i18n", l.lang + ".json"), "utf8"))]));
  const urlOf = (l) => cfg.siteUrl + (l.dir ? l.dir + "/" : "");

  for (const l of avail) {
    const t = { ...strings[l.lang], lang: strings[l.lang].lang || l.lang, ogLocale: l.ogLocale };
    const base = l.dir ? "../" : "";
    const alternates = [
      ...avail.map((a) => ({ lang: a.lang, hreflang: a.hreflang, url: urlOf(a), ogLocale: a.ogLocale, name: strings[a.lang].langName,
        rel: (base + (a.dir ? a.dir + "/" : "")) || "./" })),
      { lang: "x-default", hreflang: "x-default", url: cfg.siteUrl, rel: base || "./" },
    ];
    const html = page(t, { base, url: urlOf(l), alternates, cfg, current: l });
    const outDir = path.join(docs, l.dir);
    fs.mkdirSync(outDir, { recursive: true });
    fs.writeFileSync(path.join(outDir, "index.html"), html);
  }

  // sitemap with hreflang alternates for every page
  const today = new Date().toISOString().slice(0, 10);
  const alt = avail.map((a) => `    <xhtml:link rel="alternate" hreflang="${a.hreflang}" href="${urlOf(a)}"/>`).join("\n") +
    `\n    <xhtml:link rel="alternate" hreflang="x-default" href="${cfg.siteUrl}"/>`;
  fs.writeFileSync(path.join(docs, "sitemap.xml"), `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${avail.map((l) => `  <url>\n    <loc>${urlOf(l)}</loc>\n    <lastmod>${today}</lastmod>\n${alt}\n  </url>`).join("\n")}
</urlset>
`);
  fs.writeFileSync(path.join(docs, ".nojekyll"), "");
  // 404: GitHub Pages serves docs/404.html for unknown paths under /MyAppVPN/
  const links = avail.map((l) => `<a href="${urlOf(l)}" hreflang="${l.hreflang}">${strings[l.lang].langName}</a>`).join(" · ");
  fs.writeFileSync(path.join(docs, "404.html"), `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="noindex"><title>404 — MyAppVPN</title><link rel="icon" href="${cfg.siteUrl}assets/favicon.svg"><style>body{margin:0;min-height:100vh;display:grid;place-content:center;gap:18px;text-align:center;background:#07090d;color:#e9eef7;font:17px/1.6 system-ui,sans-serif}h1{font-size:64px;margin:0;color:#8fb8ff}a{color:#8fb8ff;text-decoration:none}a:hover{text-decoration:underline}</style></head><body><h1>404</h1><p>Page not found · Страница не найдена</p><p>${links}</p></body></html>`);
  console.log(`built ${avail.map((l) => l.lang).join(", ")} → ${docs}`);
}

await build();
if (process.argv.includes("--watch")) {
  let timer;
  const kick = () => { clearTimeout(timer); timer = setTimeout(() => build().catch((e) => console.error(e)), 150); };
  fs.watch(here, { recursive: true }, kick);
  console.log("watching site/ …");
}
