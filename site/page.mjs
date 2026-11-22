// Renders one language version of the landing page. Pure function: (strings, ctx) → HTML.
// ctx: { base, url, alternates: [{lang, hreflang, url, name}], cfg, current }

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const strip = (s) => String(s).replace(/<[^>]+>/g, "");

const ICONS = {
  bolt: '<path d="M13 2 4 14h7l-1 8 9-12h-7l1-8Z"/>',
  swap: '<path d="M4 7h13l-3-3M20 17H7l3 3"/>',
  list: '<path d="M8 6h12M8 12h12M8 18h12"/><circle cx="4" cy="6" r="1"/><circle cx="4" cy="12" r="1"/><circle cx="4" cy="18" r="1"/>',
  shield: '<path d="M12 3 4 6v6c0 4.5 3.4 8.3 8 9 4.6-.7 8-4.5 8-9V6l-8-3Z"/><path d="m9 12 2 2 4-4"/>',
  split: '<path d="M12 21v-7M12 14 6 4M12 14l6-10M6 4H3M6 4v3M18 4h3M18 4v3"/>',
  wave: '<path d="M3 12h3l2-6 3 12 3-9 2 3h5"/>',
  node: '<circle cx="12" cy="12" r="3"/><circle cx="4" cy="5" r="2"/><circle cx="20" cy="5" r="2"/><circle cx="12" cy="21" r="1.5"/><path d="m6 6 4 4M18 6l-4 4M12 15v4.5"/>',
  tv: '<rect x="3" y="5" width="18" height="12" rx="2"/><path d="M8 21h8M12 17v4"/>',
  github: '<path d="M12 2a10 10 0 0 0-3.2 19.5c.5.1.7-.2.7-.5v-1.7c-2.8.6-3.4-1.3-3.4-1.3-.4-1.1-1.1-1.4-1.1-1.4-.9-.6.1-.6.1-.6 1 .1 1.5 1 1.5 1 .9 1.5 2.3 1.1 2.9.8.1-.6.3-1.1.6-1.3-2.2-.3-4.6-1.1-4.6-5 0-1.1.4-2 1-2.7-.1-.3-.4-1.3.1-2.7 0 0 .8-.3 2.8 1a9.6 9.6 0 0 1 5 0c1.9-1.3 2.8-1 2.8-1 .5 1.4.2 2.4.1 2.7.6.7 1 1.6 1 2.7 0 3.9-2.4 4.7-4.6 5 .4.3.7.9.7 1.9V21c0 .3.2.6.7.5A10 10 0 0 0 12 2Z" fill="currentColor" stroke="none"/>',
  download: '<path d="M12 3v12m0 0-5-5m5 5 5-5M4 21h16"/>',
  tg: '<path d="m21 4-18 7 6 2 2 6 3-4 5 4 2-15Z"/><path d="m9 13 8-6"/>',
  globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.6 3.8 5.6 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.6-3.8-9S9.5 5.6 12 3Z"/>',
  copy: '<rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h8"/>',
  power: '<path d="M12 3v8"/><path d="M6.3 6.3a8 8 0 1 0 11.4 0"/>',
  home: '<path d="m3 11 9-7 9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1v-9Z"/>',
  bars: '<path d="M6 20V10M12 20V4M18 20v-7"/>',
  gear: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z"/>',
  heart: '<path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10Z"/>',
  chevron: '<path d="m6 9 6 6 6-6"/>',
  arrow: '<path d="M5 12h14m0 0-6-6m6 6-6 6"/>',
};
const icon = (name, cls = "i") => `<svg class="${cls}" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${ICONS[name] || ""}</svg>`;

const LOGO = `<svg class="logo-mark" viewBox="0 0 32 32" aria-hidden="true"><defs><linearGradient id="lg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#8FB8FF"/><stop offset="1" stop-color="#3E7BFA"/></linearGradient></defs><circle cx="16" cy="16" r="14" fill="none" stroke="url(#lg)" stroke-width="2.4" stroke-dasharray="66 22" transform="rotate(-60 16 16)"/><circle cx="16" cy="16" r="5" fill="url(#lg)"/></svg>`;

export function page(t, ctx) {
  const { base, url, alternates, cfg } = ctx;
  const titleLines = t.hero.title.split("<br>").map((l, i) => `<span class="line"><span class="line-in" style="--i:${i}">${l}</span></span>`).join("");
  const ogImage = cfg.siteUrl + "assets/og-" + ctx.current.lang + ".png";
  const subUrl = "https://cdn.jsdelivr.net/gh/indelingDanil/MyAppVPN-subs@output/vless.txt";

  const jsonld = [
    {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      name: "MyAppVPN",
      operatingSystem: "Android 8.0+",
      applicationCategory: "SecurityApplication",
      description: t.meta.description,
      url,
      downloadUrl: cfg.releasesUrl,
      installUrl: cfg.releasesUrl,
      softwareVersion: cfg.version,
      license: "https://www.gnu.org/licenses/gpl-3.0.html",
      isAccessibleForFree: true,
      inLanguage: alternates.map((a) => a.hreflang).filter((h) => h !== "x-default"),
      screenshot: ["home-dark", "servers", "settings", "stats"].map((s) => cfg.siteUrl + "screenshots/" + s + ".png"),
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      author: { "@type": "Person", name: "indelingDanil", url: "https://github.com/indelingDanil" },
      codeRepository: cfg.codeUrl,
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      inLanguage: t.lang,
      mainEntity: t.faq.items.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: strip(f.a) } })),
    },
  ];

  const langMenu = alternates.filter((a) => a.hreflang !== "x-default").map((a) =>
    `<a href="${a.rel}" hreflang="${a.hreflang}" lang="${a.hreflang}"${a.lang === t.lang ? ' aria-current="page"' : ""} data-lang="${a.lang}">${esc(a.name)}</a>`).join("");

  const fonts = {
    base: "family=Onest:wght@400;500;600&family=Unbounded:wght@500;700;800",
    fa: "&family=Vazirmatn:wght@400;600;800",
    zh: "&family=Noto+Sans+SC:wght@400;600;800",
  };
  const fontHref = `https://fonts.googleapis.com/css2?${fonts.base}${t.lang === "fa" ? fonts.fa : ""}${t.lang.startsWith("zh") ? fonts.zh : ""}&display=swap`;

  return `<!doctype html>
<html lang="${t.lang}" dir="${t.dir}" data-lang="${t.lang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(t.meta.title)}</title>
<meta name="description" content="${esc(t.meta.description)}">
<meta name="keywords" content="${esc(t.meta.keywords)}">
<meta name="robots" content="index, follow, max-image-preview:large">
<meta name="theme-color" content="#07090d">
<meta name="color-scheme" content="dark">
${cfg.gscVerification ? `<meta name="google-site-verification" content="${esc(cfg.gscVerification)}">\n` : ""}<link rel="canonical" href="${url}">
${alternates.map((a) => `<link rel="alternate" hreflang="${a.hreflang}" href="${a.url}">`).join("\n")}
<meta property="og:type" content="website">
<meta property="og:site_name" content="MyAppVPN">
<meta property="og:title" content="${esc(t.meta.ogTitle)}">
<meta property="og:description" content="${esc(t.meta.description)}">
<meta property="og:url" content="${url}">
<meta property="og:image" content="${ogImage}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:locale" content="${t.ogLocale}">
${alternates.filter((a) => a.hreflang !== "x-default" && a.lang !== t.lang).map((a) => `<meta property="og:locale:alternate" content="${a.ogLocale}">`).join("\n")}
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(t.meta.ogTitle)}">
<meta name="twitter:description" content="${esc(t.meta.description)}">
<meta name="twitter:image" content="${ogImage}">
<link rel="icon" href="${base}assets/favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="${base}assets/icon-192.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="${fontHref}">
<link rel="stylesheet" href="${base}assets/site.css?v=${cfg.assetVersion}">
<link rel="preload" as="image" href="${base}screenshots/home-dark.png">
<script type="application/ld+json">${JSON.stringify(jsonld)}</script>
<script>document.documentElement.classList.add('js');</script>
</head>
<body>
<a class="skip" href="#main">${esc(t.nav.features)}</a>
<canvas id="field" aria-hidden="true"></canvas>
<div class="grain" aria-hidden="true"></div>
<div class="cursor-glow" aria-hidden="true"></div>

<header class="top" data-top>
  <a class="brand" href="${base || "./"}" aria-label="MyAppVPN">${LOGO}<span>MyAppVPN</span></a>
  <nav class="nav" aria-label="Main">
    <a href="#features">${esc(t.nav.features)}</a>
    <a href="#screens">${esc(t.nav.screens)}</a>
    <a href="#faq">${esc(t.nav.faq)}</a>
  </nav>
  <div class="top-actions">
    <details class="lang" data-lang-menu>
      <summary aria-label="${esc(t.footer.language)}">${icon("globe")}<span>${esc(t.langName)}</span>${icon("chevron", "i chev")}</summary>
      <div class="lang-menu">${langMenu}</div>
    </details>
    <a class="btn btn-ghost btn-sm gh" href="${cfg.codeUrl}" rel="noopener" target="_blank" aria-label="GitHub">${icon("github")}<span class="gh-stars" data-stars></span></a>
    <a class="btn btn-primary btn-sm" href="#download" data-magnetic>${esc(t.nav.download)}</a>
  </div>
</header>

<main id="main">
<section class="hero" id="top">
  <div class="hero-copy">
    <p class="eyebrow" data-intro>${esc(t.hero.eyebrow)}</p>
    <h1 class="hero-h1" data-intro>${esc(t.hero.h1 || t.meta.title)}</h1>
    <p class="hero-title">${titleLines}</p>
    <p class="hero-sub" data-intro>${esc(t.hero.sub)}</p>
    <div class="hero-cta" data-intro>
      <a class="btn btn-primary btn-lg" href="${cfg.releasesUrl}" rel="noopener" data-magnetic data-dl>${icon("download")}<span>${esc(t.hero.cta)}</span></a>
      <a class="btn btn-ghost btn-lg" href="${cfg.codeUrl}" rel="noopener" target="_blank">${icon("github")}<span>${esc(t.hero.source)}</span></a>
    </div>
    <p class="hero-note" data-intro>${esc(t.hero.ctaNote)}</p>
  </div>

  <div class="hero-visual" data-intro-visual>
    <div class="rings" aria-hidden="true"><i></i><i></i><i></i><i></i></div>
    <div class="orbit" aria-hidden="true">
      <span class="chip" style="--a:0"><span><span>NL · reality</span></span></span>
      <span class="chip" style="--a:1"><span><span>DE · reality</span></span></span>
      <span class="chip" style="--a:2"><span><span>SG · reality</span></span></span>
      <span class="chip" style="--a:3"><span><span>FI · tls</span></span></span>
      <span class="chip" style="--a:4"><span><span>JP · reality</span></span></span>
      <span class="chip" style="--a:5"><span><span>PL · xhttp</span></span></span>
    </div>
    <div class="phone" data-phone role="img" aria-label="MyAppVPN — ${esc(t.hero.statusOn)}">
      <div class="phone-screen" data-state="off">
        <div class="ph-status-bar"><span>9:41</span><span class="ph-icons"><i></i><i></i><i></i></span></div>
        <div class="ph-title">MyAppVPN</div>
        <div class="ph-state">
          <span data-s="off">${esc(t.hero.statusOff)}</span>
          <span data-s="search">${esc(t.hero.statusSearch)}</span>
          <span data-s="on">${esc(t.hero.statusOn)}</span>
        </div>
        <div class="ph-seg"><span class="on">⚡ Auto</span><span>📍 Manual</span></div>
        <div class="ph-server"><b class="cc" data-cc>SG</b><span data-srv>reality-0031</span><em data-ping>84 ms</em></div>
        <div class="ph-btn-wrap">
          <svg class="ph-arc" viewBox="0 0 200 200" aria-hidden="true"><circle cx="100" cy="100" r="94" pathLength="100"/></svg>
          <button class="ph-btn" type="button" tabindex="-1" aria-hidden="true">${icon("power", "i pw")}<span class="lbl-off">${esc(t.hero.connect)}</span><span class="lbl-on">${esc(t.hero.disconnect || t.hero.connect)}</span></button>
        </div>
        <div class="ph-speed"><span>↓ <b data-down>0.0</b> MB/s</span><span>↑ <b data-up>0.0</b> MB/s</span></div>
        <nav class="ph-nav" aria-hidden="true"><span class="on">${icon("home")}</span><span>${icon("globe")}</span><span>${icon("bars")}</span><span>${icon("gear")}</span><span>${icon("heart")}</span></nav>
      </div>
    </div>
  </div>

  <a class="scroll-cue" href="#stats" aria-label="${esc(t.nav.features)}"><span></span></a>
</section>

<section class="stats" id="stats">
  ${t.stats.map((s) => `<div class="stat" data-reveal><b data-count="${esc(s.value)}">${esc(s.value)}</b><span>${esc(s.label)}</span></div>`).join("")}
</section>

<div class="marquee" aria-hidden="true"><div class="marquee-track">${Array(2).fill(["VLESS", "REALITY", "Xray-core", "XHTTP", "gRPC", "WebSocket", "TLS fragmentation", "Split tunneling", "Kill switch", "Android TV", "OpenFlux", "GPL-3.0"].map((w) => `<span>${w}</span><i>✦</i>`).join("")).join("")}</div></div>

<section class="features" id="features">
  <header class="sec-head">
    <p class="kicker" data-reveal>${esc(t.features.kicker)}</p>
    <h2 data-reveal>${esc(t.features.title)}</h2>
  </header>
  <div class="bento">
    ${t.features.items.map((f, i) => `<article class="card card-${i}" data-card>
      <div class="card-glow" aria-hidden="true"></div>
      <span class="card-ico">${icon(f.icon)}</span>
      <h3>${esc(f.t)}</h3>
      <p>${esc(f.d)}</p>
    </article>`).join("")}
  </div>
</section>

<section class="steps" id="how">
  <header class="sec-head">
    <p class="kicker" data-reveal>${esc(t.steps.kicker)}</p>
    <h2 data-reveal>${esc(t.steps.title)}</h2>
  </header>
  <ol class="steps-list" data-steps>
    <svg class="steps-line" aria-hidden="true" preserveAspectRatio="none" viewBox="0 0 4 100"><line x1="2" y1="0" x2="2" y2="100" pathLength="1"/></svg>
    ${t.steps.items.map((s, i) => `<li class="step" data-step><span class="step-n">${i + 1}</span><div><h3>${esc(s.t)}</h3><p>${esc(s.d)}</p></div></li>`).join("")}
  </ol>
</section>

<section class="screens" id="screens" data-screens>
  <div class="screens-pin">
    <header class="sec-head">
      <p class="kicker" data-reveal>${esc(t.screens.kicker)}</p>
      <h2 data-reveal>${esc(t.screens.title)}</h2>
    </header>
    <div class="screens-track" data-track>
      ${["home-dark", "servers", "settings", "stats", "home-light"].map((s, i) => `<figure class="shot">
        <div class="shot-frame"><img src="${base}screenshots/${s}.png" width="360" height="740" loading="${i ? "lazy" : "eager"}" decoding="async" alt="MyAppVPN — ${esc(t.screens.caps[i])}"></div>
        <figcaption>${esc(t.screens.caps[i])}</figcaption>
      </figure>`).join("")}
    </div>
  </div>
</section>

<section class="subs" id="subscription">
  <div class="subs-card" data-reveal>
    <p class="kicker">${esc(t.subs.kicker)}</p>
    <h2>${esc(t.subs.title)}</h2>
    <p>${esc(t.subs.text)}</p>
    <div class="copy-row">
      <code data-copy-src>${subUrl}</code>
      <button class="btn btn-primary btn-sm" type="button" data-copy data-copied="${esc(t.subs.copied)}">${icon("copy")}<span>${esc(t.subs.copy)}</span></button>
    </div>
    <a class="link" href="${cfg.subsUrl}" rel="noopener" target="_blank">${esc(t.subs.repo)} ${icon("arrow", "i arr")}</a>
  </div>
</section>

<section class="faq" id="faq">
  <header class="sec-head">
    <p class="kicker" data-reveal>${esc(t.faq.kicker)}</p>
    <h2 data-reveal>${esc(t.faq.title)}</h2>
  </header>
  <div class="faq-list">
    ${t.faq.items.map((f) => `<details class="qa" data-reveal><summary><h3>${esc(f.q)}</h3><span class="qa-x" aria-hidden="true"></span></summary><div class="qa-a"><p>${f.a}</p></div></details>`).join("")}
  </div>
</section>

<section class="download" id="download">
  <div class="dl-card" data-reveal>
    <div class="dl-rings" aria-hidden="true"><i></i><i></i><i></i></div>
    <h2>${esc(t.download.title)}</h2>
    <p>${esc(t.download.text)}</p>
    <ul class="dl-files">
      <li><b>arm64</b><span>${esc(t.download.arm64.replace(/^arm64\s*[—-]\s*/, ""))}</span></li>
      <li><b>arm32</b><span>${esc(t.download.arm32.replace(/^arm32\s*[—-]\s*/, ""))}</span></li>
    </ul>
    <div class="dl-cta">
      <a class="btn btn-primary btn-lg" href="${cfg.releasesUrl}" rel="noopener" data-magnetic>${icon("download")}<span>${esc(t.download.button)}</span></a>
      <a class="btn btn-ghost btn-lg" href="${cfg.telegramUrl}" rel="noopener" target="_blank">${icon("tg")}<span>${esc(t.download.telegram)}</span></a>
    </div>
    <p class="dl-meta">v${esc(cfg.version)} · Android 8.0+ · GPL-3.0</p>
  </div>
</section>
</main>

<footer class="foot">
  <div class="foot-top">
    <a class="brand" href="${base || "./"}">${LOGO}<span>MyAppVPN</span></a>
    <nav class="foot-links">
      <a href="${cfg.codeUrl}" rel="noopener" target="_blank">${esc(t.footer.source)}</a>
      <a href="${cfg.subsUrl}" rel="noopener" target="_blank">${esc(t.footer.subs)}</a>
      <a href="${cfg.telegramUrl}" rel="noopener" target="_blank">${esc(t.footer.telegram)}</a>
      <a href="${cfg.releasesUrl}" rel="noopener">Releases</a>
    </nav>
  </div>
  <nav class="foot-langs" aria-label="${esc(t.footer.language)}">${langMenu}</nav>
  <p class="disclaimer">⚠️ ${esc(t.disclaimer)}</p>
  <p class="foot-copy">MyAppVPN · ${esc(t.footer.license)}</p>
</footer>

<script src="https://cdn.jsdelivr.net/npm/gsap@3.13.0/dist/gsap.min.js" defer></script>
<script src="https://cdn.jsdelivr.net/npm/gsap@3.13.0/dist/ScrollTrigger.min.js" defer></script>
<script src="https://cdn.jsdelivr.net/npm/lenis@1.3.4/dist/lenis.min.js" defer></script>
<script src="${base}assets/site.js?v=${cfg.assetVersion}" defer></script>
</body>
</html>
`;
}
