/* MyAppVPN landing — motion. GSAP + ScrollTrigger (CDN), graceful without them. */
(() => {
  const root = document.documentElement;
  const rtl = root.dir === "rtl";
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = matchMedia("(pointer: fine)").matches;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];

  /* ── language: remember choice, suggest on first visit to root ── */
  const LANGS = ["en", "ru", "fa", "zh", "tr", "kk", "uz"];
  const store = { get(k) { try { return localStorage.getItem(k); } catch { return null; } }, set(k, v) { try { localStorage.setItem(k, v); } catch {} } };
  $$("a[data-lang]").forEach((a) => a.addEventListener("click", () => store.set("lang", a.dataset.lang)));
  if (root.dataset.lang === "en" && !store.get("lang") && !/bot|crawl|spider/i.test(navigator.userAgent)) {
    const pref = (navigator.languages || [navigator.language]).map((l) => l.toLowerCase().split("-")[0]).find((l) => LANGS.includes(l));
    if (pref && pref !== "en") {
      store.set("lang", pref);
      const a = $(`.lang-menu a[data-lang="${pref}"]`);
      if (a) location.replace(a.href);
      return;
    }
  }
  // close the language menu on outside click / Esc
  const menu = $("[data-lang-menu]");
  document.addEventListener("click", (e) => { if (menu && menu.open && !menu.contains(e.target)) menu.open = false; });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && menu) menu.open = false; });

  /* ── header: glass on scroll, hide on scroll down ── */
  const top = $("[data-top]");
  let lastY = 0;
  const onScroll = () => {
    const y = scrollY;
    top.classList.toggle("scrolled", y > 20);
    top.classList.toggle("hide", y > 500 && y > lastY + 4 && !(menu && menu.open));
    if (y < lastY - 4) top.classList.remove("hide");
    lastY = y;
  };
  addEventListener("scroll", onScroll, { passive: true }); onScroll();

  /* ── GitHub stars (best effort) ── */
  fetch("https://api.github.com/repos/indelingDanil/MyAppVPN-CodeBase").then((r) => r.ok ? r.json() : null)
    .then((j) => { if (j && j.stargazers_count) $("[data-stars]").textContent = "★ " + j.stargazers_count; }).catch(() => {});

  /* ── copy subscription link ── */
  const copyBtn = $("[data-copy]");
  if (copyBtn) copyBtn.addEventListener("click", async () => {
    const text = $("[data-copy-src]").textContent.trim();
    try { await navigator.clipboard.writeText(text); } catch {
      const r = document.createRange(); r.selectNodeContents($("[data-copy-src]")); const s = getSelection(); s.removeAllRanges(); s.addRange(r); document.execCommand("copy");
    }
    const label = copyBtn.querySelector("span"); const old = label.textContent;
    label.textContent = copyBtn.dataset.copied; copyBtn.classList.add("done");
    setTimeout(() => { label.textContent = old; copyBtn.classList.remove("done"); }, 1800);
  });

  /* ── network field canvas: drifting nodes + links, pulses when "protected" ──
     Perf: DPR ≤ 1.5, ≤ 60 nodes, links batched into 3 alpha buckets (3 strokes/frame),
     ~30 fps, pre-rendered pulse sprite, and the loop sleeps once the hero is scrolled away. */
  const cv = $("#field"); const ctx = cv.getContext("2d", { alpha: true });
  let W = 0, H = 0, DPR = 1, nodes = [], pulses = [], fieldOn = false, mouse = { x: -9999, y: -9999 };
  const LINK = 130, LINK2 = LINK * LINK;
  const sprite = document.createElement("canvas"); sprite.width = sprite.height = 24;
  { const s = sprite.getContext("2d"), g = s.createRadialGradient(12, 12, 0, 12, 12, 12); g.addColorStop(0, "rgba(143,184,255,.95)"); g.addColorStop(1, "rgba(77,141,255,0)"); s.fillStyle = g; s.fillRect(0, 0, 24, 24); }
  const resize = () => {
    const nw = innerWidth, nh = innerHeight, widthChanged = Math.abs(nw - W) > 40;
    DPR = Math.min(devicePixelRatio || 1, 1.5); W = nw; H = nh;
    cv.width = W * DPR; cv.height = H * DPR; ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    if (widthChanged || !nodes.length) {
      const n = Math.round(Math.min(60, (W * H) / 22000));
      nodes = Array.from({ length: n }, () => ({ x: Math.random() * W, y: Math.random() * H, vx: (Math.random() - .5) * .3, vy: (Math.random() - .5) * .3, r: Math.random() * 1.4 + .7, alive: Math.random() > .25 }));
    }
  };
  let rz; resize(); addEventListener("resize", () => { clearTimeout(rz); rz = setTimeout(resize, 150); });
  let running = false, last = 0;
  const heroGone = () => scrollY > H * 1.25;
  function frame(ts) {
    if (document.hidden || heroGone()) { running = false; cv.style.opacity = heroGone() ? "0" : ""; return; }
    requestAnimationFrame(frame);
    if (ts - last < 32) return; // ~30 fps is plenty for a slow ambient field
    last = ts;
    const fade = Math.max(0.2, 1 - scrollY / (H * 1.1));
    ctx.clearRect(0, 0, W, H);
    for (const p of nodes) {
      if (!reduce) { p.x += p.vx; p.y += p.vy; }
      if (p.x < -20) p.x = W + 20; else if (p.x > W + 20) p.x = -20;
      if (p.y < -20) p.y = H + 20; else if (p.y > H + 20) p.y = -20;
      const dx = p.x - mouse.x, dy = p.y - mouse.y, dm2 = dx * dx + dy * dy;
      if (dm2 < 25600 && !reduce) { const dm = Math.sqrt(dm2) || 1; p.x += dx / dm * 1.1; p.y += dy / dm * 1.1; }
    }
    const buckets = [new Path2D(), new Path2D(), new Path2D()];
    for (let i = 0; i < nodes.length; i++) { const a = nodes[i];
      for (let j = i + 1; j < nodes.length; j++) { const b = nodes[j], dx = a.x - b.x, dy = a.y - b.y, d2 = dx * dx + dy * dy;
        if (d2 < LINK2) { const k = d2 < LINK2 * .25 ? 0 : d2 < LINK2 * .6 ? 1 : 2; buckets[k].moveTo(a.x, a.y); buckets[k].lineTo(b.x, b.y); } } }
    ctx.lineWidth = 1;
    [.16, .09, .04].forEach((al, k) => { ctx.strokeStyle = "rgba(110,150,230," + al * fade + ")"; ctx.stroke(buckets[k]); });
    const live = new Path2D(), dead = new Path2D();
    for (const p of nodes) { const P = p.alive ? live : dead; P.moveTo(p.x + p.r, p.y); P.arc(p.x, p.y, p.r, 0, 6.283); }
    ctx.fillStyle = "rgba(143,184,255," + .55 * fade + ")"; ctx.fill(live);
    ctx.fillStyle = "rgba(93,106,128," + .35 * fade + ")"; ctx.fill(dead);
    if (fieldOn && !reduce && Math.random() < .12 && pulses.length < 12) {
      const a = nodes[(Math.random() * nodes.length) | 0];
      const b = nodes.find((n) => n !== a && (n.x - a.x) ** 2 + (n.y - a.y) ** 2 < LINK2 * 2.5);
      if (b) pulses.push({ a, b, t: 0 });
    }
    pulses = pulses.filter((q) => (q.t += .04) < 1);
    ctx.globalAlpha = fade;
    for (const q of pulses) ctx.drawImage(sprite, q.a.x + (q.b.x - q.a.x) * q.t - 12, q.a.y + (q.b.y - q.a.y) * q.t - 12);
    ctx.globalAlpha = 1;
  }
  const wake = () => { if (!running && !document.hidden && !heroGone()) { running = true; cv.style.opacity = ""; requestAnimationFrame(frame); } };
  addEventListener("scroll", wake, { passive: true });
  document.addEventListener("visibilitychange", wake);
  wake();

  /* ── pointer: glow + field repel + card spotlight ── */
  const glow = $(".cursor-glow");
  if (finePointer) {
    document.body.classList.add("has-pointer");
    let gx = 0, gy = 0, tx = 0, ty = 0;
    addEventListener("pointermove", (e) => { tx = e.clientX; ty = e.clientY; mouse.x = e.clientX; mouse.y = e.clientY; }, { passive: true });
    let gRaf = 0;
    const follow = () => { gx += (tx - gx) * .14; gy += (ty - gy) * .14; glow.style.transform = "translate3d(" + gx + "px," + gy + "px,0)";
      gRaf = Math.abs(tx - gx) + Math.abs(ty - gy) > .5 ? requestAnimationFrame(follow) : 0; };
    addEventListener("pointermove", () => { if (!gRaf) gRaf = requestAnimationFrame(follow); }, { passive: true });
    $$("[data-card]").forEach((c) => c.addEventListener("pointermove", (e) => {
      const r = c.getBoundingClientRect(); c.style.setProperty("--mx", e.clientX - r.left + "px"); c.style.setProperty("--my", e.clientY - r.top + "px");
    }));
  }

  /* ── phone demo: off → search (servers fail, one hits) → on, loop ── */
  const screen = $(".phone-screen"), visual = $(".hero-visual"), btn = $(".ph-btn");
  const chips = $$(".chip"), cc = $("[data-cc]"), srv = $("[data-srv]"), ping = $("[data-ping]"), down = $("[data-down]"), up = $("[data-up]");
  const CAND = [["NL", "reality-0012", 0], ["DE", "reality-0007", 1], ["SG", "reality-0031", 2], ["FI", "tls-0044", 3], ["JP", "reality-0005", 4], ["PL", "xhttp-0019", 5]];
  let speedTimer, demoTimers = [];
  const later = (ms, fn) => demoTimers.push(setTimeout(fn, ms));
  const setState = (s) => { screen.dataset.state = s; visual.classList.toggle("is-on", s === "on"); fieldOn = s === "on"; };
  function demo() {
    demoTimers.forEach(clearTimeout); demoTimers = []; clearInterval(speedTimer);
    chips.forEach((c) => c.classList.remove("hit", "dead"));
    setState("off"); ping.textContent = "— ms"; down.textContent = "0.0"; up.textContent = "0.0";
    const pick = CAND[(Math.random() * CAND.length) | 0];
    later(1400, () => { btn.classList.add("press"); later(160, () => btn.classList.remove("press")); setState("search"); });
    const order = CAND.filter((c) => c !== pick).sort(() => Math.random() - .5).slice(0, 3);
    order.forEach((c, i) => later(1900 + i * 520, () => {
      cc.textContent = c[0]; srv.textContent = c[1]; ping.textContent = "…";
      chips[c[2]].classList.add("hit"); later(380, () => { chips[c[2]].classList.remove("hit"); chips[c[2]].classList.add("dead"); });
    }));
    later(1900 + order.length * 520 + 200, () => {
      cc.textContent = pick[0]; srv.textContent = pick[1]; chips[pick[2]].classList.add("hit");
      const ms = 60 + ((Math.random() * 90) | 0); ping.textContent = ms + " ms";
      setState("on");
      speedTimer = setInterval(() => { down.textContent = (4 + Math.random() * 18).toFixed(1); up.textContent = (.4 + Math.random() * 2.6).toFixed(1); }, 700);
    });
    later(1900 + order.length * 520 + 200 + 6200, demo);
  }
  if (reduce) { setState("on"); chips[2].classList.add("hit"); cc.textContent = "SG"; srv.textContent = "reality-0031"; ping.textContent = "84 ms"; }
  else demo();
  // pause the demo loop when the hero is off-screen
  new IntersectionObserver(([e]) => { if (reduce) return; if (e.isIntersecting) { if (!demoTimers.length) demo(); } else { demoTimers.forEach(clearTimeout); demoTimers = []; clearInterval(speedTimer); } }, { threshold: 0.05 }).observe(visual);


  /* ── GSAP-driven parts ── */
  function withGsap() {
    const gsap = window.gsap, ST = window.ScrollTrigger;
    if (!gsap || reduce) { root.classList.add("no-motion"); return; }
    gsap.registerPlugin(ST);
    ST.config({ ignoreMobileResize: true });
    gsap.defaults({ ease: "power3.out", duration: 0.9 });

    // Smooth wheel scrolling: Lenis interpolates the stepwise mouse wheel and is driven by the
    // GSAP ticker, so ScrollTrigger sees one continuous scroll and scroll-linked motion stays smooth.
    if (window.Lenis) {
      const lenis = new Lenis({ lerp: 0.1, wheelMultiplier: 1, smoothWheel: true, syncTouch: false });
      lenis.on("scroll", ST.update);
      gsap.ticker.add((time) => lenis.raf(time * 1000));
      gsap.ticker.lagSmoothing(0);
      $$('a[href^="#"]').forEach((a) => a.addEventListener("click", (e) => {
        const id = a.getAttribute("href"); const el = id.length > 1 && $(id);
        if (!el) return;
        e.preventDefault(); lenis.scrollTo(el, { offset: -80, duration: 1.2 });
        history.replaceState(null, "", id);
      }));
      $$(".lang-menu").forEach((m) => m.setAttribute("data-lenis-prevent", ""));
    }

    // intro
    const tl = gsap.timeline({ delay: 0.1 });
    tl.from(".top", { y: -30, autoAlpha: 0, duration: .8 })
      .fromTo(".eyebrow, .hero-h1", { y: 14, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: .7, stagger: .08 }, "<.1")
      .fromTo(".hero-title .line-in", { yPercent: 110, autoAlpha: 1, rotate: rtl ? -3 : 3 }, { yPercent: 0, rotate: 0, duration: 1.1, stagger: .12, ease: "expo.out" }, "<.1")
      .fromTo(".hero-sub, .hero-cta, .hero-note", { y: 24, autoAlpha: 0 }, { y: 0, autoAlpha: 1, stagger: .1 }, "<.45")
      .fromTo("[data-intro-visual]", { autoAlpha: 0, scale: .9, y: 40, rotateX: 18 }, { autoAlpha: 1, scale: 1, y: 0, rotateX: 0, duration: 1.4, ease: "expo.out" }, "<-.6");

    // phone tilt with pointer + parallax on scroll
    const phone = $("[data-phone]");
    if (finePointer) {
      const rx = gsap.quickTo(phone, "rotationX", { duration: .8, ease: "power3" }), ry = gsap.quickTo(phone, "rotationY", { duration: .8, ease: "power3" });
      gsap.set(phone, { transformPerspective: 1100 });
      visual.addEventListener("pointermove", (e) => { const r = visual.getBoundingClientRect(); ry(((e.clientX - r.left) / r.width - .5) * 16); rx(-((e.clientY - r.top) / r.height - .5) * 12); });
      visual.addEventListener("pointerleave", () => { rx(0); ry(0); });
    }
    gsap.to(".hero-visual .phone", { yPercent: -10, ease: "none", scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true } });
    gsap.to(".hero-copy", { yPercent: 14, autoAlpha: .2, ease: "none", scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true } });

    // magnetic buttons
    if (finePointer) $$("[data-magnetic]").forEach((b) => {
      const mx = gsap.quickTo(b, "x", { duration: .5, ease: "elastic.out(1,.4)" }), my = gsap.quickTo(b, "y", { duration: .5, ease: "elastic.out(1,.4)" });
      b.addEventListener("pointermove", (e) => { const r = b.getBoundingClientRect(); mx((e.clientX - r.left - r.width / 2) * .25); my((e.clientY - r.top - r.height / 2) * .35); });
      b.addEventListener("pointerleave", () => { mx(0); my(0); });
    });

    // generic reveals
    ST.batch("[data-reveal]", { start: "top 88%", onEnter: (els) => gsap.to(els, { autoAlpha: 1, y: 0, stagger: .08, overwrite: true }) });
    ST.batch("[data-card]", { start: "top 90%", onEnter: (els) => gsap.to(els, { autoAlpha: 1, y: 0, stagger: .07, duration: 1, ease: "expo.out", overwrite: true }) });

    // stats count-up
    $$("[data-count]").forEach((el) => {
      const raw = el.dataset.count, m = raw.match(/^([\d\s.,]+)(.*)$/);
      if (!m) return;
      const sep = (m[1].match(/[\s.,]/) || [""])[0], target = parseInt(m[1].replace(/[^\d]/g, ""), 10), suffix = m[2];
      if (!(target > 9)) return;
      const fmt = (n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, sep === " " ? " " : sep);
      const o = { v: 0 };
      ST.create({ trigger: el, start: "top 90%", once: true, onEnter: () => gsap.to(o, { v: target, duration: 2, ease: "power2.out", onUpdate: () => { el.textContent = fmt(Math.round(o.v)) + suffix; } }) });
    });

    // steps: draw the line and light the numbers
    const steps = $$("[data-step]"), line = $(".steps-line line");
    gsap.to(steps, { autoAlpha: 1, y: 0, stagger: .15, scrollTrigger: { trigger: "[data-steps]", start: "top 80%" } });
    ST.create({
      trigger: "[data-steps]", start: "top 65%", end: "bottom 55%", scrub: .6,
      onUpdate: (s) => { line.style.setProperty("--draw", 1 - s.progress); steps.forEach((st, i) => st.classList.toggle("lit", s.progress >= i / (steps.length - 1) - .02)); },
    });

    // screenshots: pinned horizontal scroll on wide screens
    const mm = gsap.matchMedia();
    mm.add("(min-width: 641px)", () => {
      const track = $("[data-track]");
      const dist = () => Math.max(0, track.scrollWidth - innerWidth);
      // Pin for at least half a screen so the block holds still in the centre even when all
      // five shots already fit (wide monitors) — then only the gentle tilt plays.
      const len = () => Math.max(dist(), innerHeight * 0.5);
      gsap.to(track, {
        x: () => (rtl ? dist() : -dist()), ease: "none",
        scrollTrigger: { trigger: ".screens-pin", start: "top top", end: () => "+=" + len(), pin: ".screens-pin", scrub: .8, invalidateOnRefresh: true, anticipatePin: 1 },
      });
      $$(".shot-frame").forEach((f, i) => gsap.fromTo(f, { rotate: i % 2 ? 4 : -4 }, { rotate: i % 2 ? -3 : 3, ease: "none", scrollTrigger: { trigger: ".screens-pin", start: "top top", end: () => "+=" + len(), scrub: true, invalidateOnRefresh: true } }));
    });

    // download rings breathe in
    gsap.from(".dl-rings i", { scale: .4, autoAlpha: 0, stagger: .15, duration: 1.6, ease: "expo.out", scrollTrigger: { trigger: ".dl-card", start: "top 80%" } });

    addEventListener("load", () => ST.refresh());
  }
  if (window.gsap) withGsap(); else addEventListener("load", withGsap);
})();
