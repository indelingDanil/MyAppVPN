'use strict';
/**
 * OpenFlux v2 exit server (MyAppVPN) — see ../PROTOCOL-v2.md.
 *
 * Pure Node.js (>= 20), no npm dependencies. Runs standalone (`node app.js`, env PORT) or under
 * Phusion Passenger (which hooks http.createServer().listen()). Requests may arrive with a base
 * path prefix (e.g. /n/): routing uses only the query string.
 *
 * One process, all session state in memory. A session is independent of HTTP requests: it owns the
 * destination sockets; the client long-polls `down` (byte stream from offset N) and POSTs `up`
 * frame bytes with offsets, so a cut request loses nothing.
 *
 * Frame: type(1) | stream_id(4 BE) | len(4 BE) | payload
 *   1 OPEN "host:port"  2 DATA  3 CLOSE  4 OPEN_OK  5 OPEN_ERR reason  6 ACK (ignored)
 *
 * Test-only env knobs (never set them in production):
 *   OF_ALLOW_PRIVATE=1   allow private/loopback targets
 *   OF_ALLOW_PORTS=a,b   extra allowed destination ports (besides 80/443)
 * Tuning env: OF_CONFIG, OF_DATA_DIR, OF_RETAIN_CAP (bytes), OF_RUN_MS, OF_IDLE_MS.
 */

const http = require('node:http');
const net = require('node:net');
const dns = require('node:dns');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

// ── constants / env ──────────────────────────────────────────────────────────

const T_OPEN = 1, T_DATA = 2, T_CLOSE = 3, T_OPEN_OK = 4, T_OPEN_ERR = 5;
const PAD_SID = 0xFFFFFFFF;
const BLOCK = 4096;
const HDR = 9;
const MiB = 1048576;

const ENV = process.env;
function envInt(name, def) {
  const v = Number(ENV[name]);
  return Number.isSafeInteger(v) && v > 0 ? v : def;
}

const MAX_BODY = 4 * MiB;                         // 413 above
const MAX_FRAME = 4 * MiB;                        // larger client frame = protocol error
const RETAIN_CAP = envInt('OF_RETAIN_CAP', 8 * MiB);
const RUN_MS = envInt('OF_RUN_MS', 100000);       // end a down response after this
const IDLE_MS = envInt('OF_IDLE_MS', 60000);      // session GC
const KEEPALIVE_MS = 5000;
const DIAL_MS = 6000;
const DNS_TTL_MS = 5 * 60000;
const UP_PENDING_MAX = 4 * MiB;                   // queued bytes towards destinations per session
const UP_WAIT_MS = 25000;
const MAX_SESSIONS = envInt('OF_MAX_SESSIONS', 2000);
const TOMBSTONE_MS = 10 * 60000;
const ALLOW_PRIVATE = ENV.OF_ALLOW_PRIVATE === '1';
const EXTRA_PORTS = new Set(String(ENV.OF_ALLOW_PORTS || '').split(',').map(Number).filter((p) => p > 0 && p < 65536));
const CONFIG_PATH = ENV.OF_CONFIG || path.join(__dirname, 'config.json');
const DATA_DIR = ENV.OF_DATA_DIR || path.join(__dirname, 'data');
const STATE_PATH = path.join(DATA_DIR, 'state.json');

const S_RE = /^[A-Za-z0-9]{8,64}$/;
const C_RE = /^[A-Za-z0-9-]{8,64}$/;

function log(...a) { console.log(new Date().toISOString(), ...a); }
function sid6(s) { return String(s).slice(0, 6) + '…'; }
function nowSec() { return Math.floor(Date.now() / 1000); }
function today() { return new Date().toISOString().slice(0, 10); }
function sha(s) { return crypto.createHash('sha256').update(String(s)).digest('hex'); }

// ── config ───────────────────────────────────────────────────────────────────

let cfg = { tokens: new Map(), demo: null };     // tokens: sha256(token) -> role
let cfgMtime = null;

function num(v, def) { return typeof v === 'number' && Number.isFinite(v) && v >= 0 ? v : def; }

function compileConfig(j) {
  const tokens = new Map();
  if (j && typeof j.personal === 'object' && j.personal) {
    for (const [id, tok] of Object.entries(j.personal)) {
      if (typeof tok === 'string' && tok.length >= 8) tokens.set(sha(tok), { kind: 'personal', id: String(id), key: 'p:' + id });
    }
  }
  let demo = null;
  const d = j && j.demo;
  if (d && typeof d.token === 'string' && d.token.length >= 8) {
    demo = {
      max: num(d.max, 8), seconds: num(d.seconds, 3600), userMb: num(d.userMb, 2048),
      dailyMb: num(d.dailyMb, 25600), until: num(d.until, 0),
    };
    tokens.set(sha(d.token), { kind: 'demo', id: 'demo', key: 'demo' });
  }
  // Admins may open the private stats page (?r=stats). Default: the personal token "p1".
  const adminIds = Array.isArray(j && j.admin) ? j.admin.map(String) : ['p1'];
  for (const r of tokens.values()) if (r.kind === 'personal' && adminIds.includes(r.id)) r.admin = true;
  const personalIds = j && typeof j.personal === 'object' && j.personal ? Object.keys(j.personal) : [];
  return { tokens, demo, personalIds };
}

function loadConfig(force) {
  let st;
  try { st = fs.statSync(CONFIG_PATH); } catch {
    if (cfgMtime !== -1) { log('config: config.json not found — all requests get 404'); cfg = compileConfig({}); cfgMtime = -1; }
    return;
  }
  if (!force && st.mtimeMs === cfgMtime) return;
  cfgMtime = st.mtimeMs;
  try {
    const j = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
    cfg = compileConfig(j);
    const personal = [...cfg.tokens.values()].filter((r) => r.kind === 'personal').length;
    log(`config: loaded (${personal} personal token(s), demo ${cfg.demo ? 'on' : 'off'})`);
  } catch {
    // Never echo the parser message: it may quote a slice of the file (tokens).
    log('config: parse error — keeping the previous config');
  }
}

function roleFor(k) {
  if (typeof k !== 'string' || k.length < 8 || k.length > 512) return null;
  return cfg.tokens.get(sha(k)) || null;
}

// ── persistent demo counters ─────────────────────────────────────────────────

// personal: roleKey -> { first, last, sessions, days: { 'YYYY-MM-DD': bytes } } (owner stats only)
const state = { trial: {}, bytes: {}, days: {}, personal: {} };
const startedAt = Date.now();
let saveTimer = null;

function loadState() {
  try { fs.mkdirSync(DATA_DIR, { recursive: true }); } catch (e) { log('state: cannot create data dir:', e.code); }
  try {
    const j = JSON.parse(fs.readFileSync(STATE_PATH, 'utf8'));
    for (const k of ['trial', 'bytes', 'days', 'personal']) if (j && typeof j[k] === 'object' && j[k]) state[k] = j[k];
  } catch (e) { if (e.code !== 'ENOENT') log('state: unreadable state.json, starting empty'); }
}

function pruneDays() {
  const keep = new Date(Date.now() - 8 * 86400000).toISOString().slice(0, 10);
  for (const d of Object.keys(state.days)) if (d < keep) delete state.days[d];
  for (const p of Object.values(state.personal)) {
    if (p && p.days) for (const d of Object.keys(p.days)) if (d < keep) delete p.days[d];
  }
}

function personalRec(key) {
  let p = state.personal[key];
  if (!p || typeof p !== 'object') p = state.personal[key] = { first: nowSec(), last: 0, sessions: 0, days: {} };
  if (!p.days) p.days = {};
  return p;
}

function saveStateSync() {
  if (saveTimer) { clearTimeout(saveTimer); saveTimer = null; }
  pruneDays();
  const tmp = `${STATE_PATH}.${process.pid}.tmp`;
  try {
    fs.mkdirSync(DATA_DIR, { recursive: true });
    fs.writeFileSync(tmp, JSON.stringify(state));
    fs.renameSync(tmp, STATE_PATH);
  } catch (e) { log('state: save failed:', e.code || 'error'); try { fs.unlinkSync(tmp); } catch {} }
}

function scheduleSave() {
  if (!saveTimer) saveTimer = setTimeout(() => { saveTimer = null; saveStateSync(); }, 5000);
}

function ukeyOf(c) { return sha('of-install:' + c).slice(0, 32); }

/** Demo limit check for an install key; '' = fine. */
function demoLimitReason(ukey) {
  const d = cfg.demo;
  if (!d) return 'ended';
  if (d.until > 0 && nowSec() > d.until) return 'ended';
  const start = state.trial[ukey] || 0;
  const used = start > 0 ? nowSec() - start : 0;
  if (used >= d.seconds) return 'expired';
  if ((state.bytes[ukey] || 0) >= d.userMb * MiB) return 'expired';
  if ((state.days[today()] || 0) >= d.dailyMb * MiB) return 'quota';
  return '';
}

function demoHeaders(ukey) {
  const d = cfg.demo;
  if (!d) return {};
  const start = state.trial[ukey] || nowSec();
  return {
    'X-OF-Left': String(Math.max(0, d.seconds - (nowSec() - start))),
    'X-OF-Left-MB': String(Math.max(0, Math.floor((d.userMb * MiB - (state.bytes[ukey] || 0)) / MiB))),
  };
}

// ── DNS + target policy ──────────────────────────────────────────────────────

const dnsCache = new Map();   // host -> { ip, exp }

function resolve4(host) {
  if (net.isIPv4(host)) return Promise.resolve(host);
  const hit = dnsCache.get(host);
  if (hit && hit.exp > Date.now()) return Promise.resolve(hit.ip);
  return new Promise((ok, fail) => {
    dns.lookup(host, { family: 4 }, (err, ip) => {
      if (err || !ip) return fail(err || new Error('dns'));
      if (dnsCache.size > 5000) dnsCache.clear();
      dnsCache.set(host, { ip, exp: Date.now() + DNS_TTL_MS });
      ok(ip);
    });
  });
}

const BLOCKED_V4 = [
  ['0.0.0.0', 8], ['10.0.0.0', 8], ['100.64.0.0', 10], ['127.0.0.0', 8], ['169.254.0.0', 16],
  ['172.16.0.0', 12], ['192.0.0.0', 24], ['192.0.2.0', 24], ['192.88.99.0', 24], ['192.168.0.0', 16],
  ['198.18.0.0', 15], ['198.51.100.0', 24], ['203.0.113.0', 24], ['224.0.0.0', 4], ['240.0.0.0', 4],
].map(([a, bits]) => [ip4num(a), bits === 0 ? 0 : (~0 << (32 - bits)) >>> 0]);

function ip4num(ip) { return ip.split('.').reduce((n, o) => ((n << 8) | Number(o)) >>> 0, 0); }

function isBlockedIp(ip) {
  if (!net.isIPv4(ip)) return true;
  const n = ip4num(ip);
  return BLOCKED_V4.some(([base, mask]) => ((n & mask) >>> 0) === base);
}

function portAllowed(p) { return p === 80 || p === 443 || EXTRA_PORTS.has(p); }

function dialError(e) {
  switch (e && e.code) {
    case 'ECONNREFUSED': return 'refused';
    case 'ETIMEDOUT': return 'timeout';
    case 'ENETUNREACH': case 'EHOSTUNREACH': return 'unreachable';
    case 'ECONNRESET': return 'reset';
    default: return 'error';
  }
}

// ── frames ───────────────────────────────────────────────────────────────────

function frame(type, sid, payload) {
  const len = payload ? payload.length : 0;
  const b = Buffer.allocUnsafe(HDR + len);
  b[0] = type; b.writeUInt32BE(sid >>> 0, 1); b.writeUInt32BE(len, 5);
  if (len) payload.copy(b, HDR);
  return b;
}

function padFrame(total) {          // total bytes incl. header, >= 9
  const b = Buffer.alloc(total);
  b[0] = T_DATA; b.writeUInt32BE(PAD_SID, 1); b.writeUInt32BE(total - HDR, 5);
  return b;
}

function preamble(n) {
  const b = Buffer.alloc(BLOCK, 0x20);
  b.write('OF2 ' + n, 0, 'latin1');
  b[BLOCK - 1] = 0x0a;
  return b;
}

// ── sessions ─────────────────────────────────────────────────────────────────

const sessions = new Map();     // s -> Session
const tombstones = new Map();   // s -> { reason, roleKey, t }

class Session {
  constructor(id, role, ukey) {
    this.id = id;
    this.roleKey = role.key;
    this.demo = role.kind === 'demo';
    this.ukey = ukey;              // demo install key
    this.streams = new Map();      // sid -> stream
    this.chunks = [];              // retained down bytes [acked, produced)
    this.acked = 0;
    this.produced = 0;
    this.down = null;
    this.upRecv = 0;
    this.pend = null;              // partial up frame bytes
    this.paused = false;
    this.flushQueued = false;
    this.upBusy = 0;
    this.lastActive = Date.now();
    this.dead = false;
  }

  retained() { return this.produced - this.acked; }

  // ---- down stream ----

  produce(buf, viaFlush) {
    this.chunks.push(buf);
    this.produced += buf.length;
    if (!this.paused && this.retained() > RETAIN_CAP) {
      this.paused = true;
      for (const st of this.streams.values()) if (st.sock) st.sock.pause();
    }
    if (!viaFlush) this.scheduleFlush();
  }

  emit(type, sid, payload) { if (!this.dead) this.produce(frame(type, sid, payload)); }

  scheduleFlush() {
    if (this.flushQueued || !this.down) return;
    this.flushQueued = true;
    setImmediate(() => { this.flushQueued = false; this.flush(); });
  }

  ack(n) {
    let drop = n - this.acked;
    while (drop > 0 && this.chunks.length) {
      const c = this.chunks[0];
      if (c.length <= drop) { this.chunks.shift(); drop -= c.length; } else { this.chunks[0] = c.subarray(drop); drop = 0; }
    }
    this.acked = n;
    if (this.paused && this.retained() < RETAIN_CAP / 2) {
      this.paused = false;
      for (const st of this.streams.values()) if (st.sock && st.state === 'open') st.sock.resume();
    }
  }

  flush() {
    const d = this.down;
    if (!d || d.ended || d.waitingDrain || this.dead) return;
    let off = this.acked, ok = true;
    for (const c of this.chunks) {
      const end = off + c.length;
      if (end > d.sentTo) {
        const piece = d.sentTo > off ? c.subarray(d.sentTo - off) : c;
        d.sentTo = end;
        d.unpadded = true;
        ok = d.res.write(piece);
        if (!ok) break;
      }
      off = end;
    }
    if (ok && d.unpadded) {
      // Pad the burst so this response's output reaches a 4096-byte boundary (the preamble is 4096).
      d.unpadded = false;
      const rel = (d.sentTo - d.from) % BLOCK;
      if (rel !== 0) {
        let p = BLOCK - rel;
        if (p < HDR) p += BLOCK;
        const pad = padFrame(p);
        this.produce(pad, true);
        d.sentTo += p;
        ok = d.res.write(pad);
      }
      d.lastWrite = Date.now();
    }
    if (!ok) {
      d.waitingDrain = true;
      d.res.once('drain', () => { d.waitingDrain = false; this.flush(); });
      return;
    }
    // Caught up. If a lot is unacknowledged, end this response so the client re-polls (= acks)
    // instead of hitting the retention cap and stalling until the ~100 s rollover.
    if (d.sentTo === this.produced && this.retained() >= RETAIN_CAP / 2) this.endDown(d);
  }

  attachDown(res, from) {
    if (this.down) this.endDown(this.down);
    const d = { res, from, sentTo: from, waitingDrain: false, unpadded: false, ended: false, lastWrite: Date.now(), timers: [] };
    this.down = d;
    res.write(preamble(from));
    d.timers.push(setTimeout(() => this.endDown(d), RUN_MS));
    d.timers.push(setInterval(() => {
      if (d.ended || d.waitingDrain || d.sentTo !== this.produced) return;
      if (Date.now() - d.lastWrite >= KEEPALIVE_MS) { this.produce(padFrame(BLOCK), true); this.flush(); }
    }, 1000));
    res.on('close', () => this.endDown(d));
    this.flush();
  }

  endDown(d) {
    if (d.ended) return;
    d.ended = true;
    for (const t of d.timers) { clearTimeout(t); clearInterval(t); }
    try { d.res.end(); } catch {}
    if (this.down === d) { this.down = null; this.lastActive = Date.now(); }
  }

  // ---- up stream ----

  feed(buf) {
    let b = this.pend ? Buffer.concat([this.pend, buf]) : buf;
    this.pend = null;
    let i = 0;
    while (!this.dead && b.length - i >= HDR) {
      const type = b[i], sid = b.readUInt32BE(i + 1), len = b.readUInt32BE(i + 5);
      if (len > MAX_FRAME) { this.kill('', 'protocol: frame too large'); return; }
      if (b.length - i < HDR + len) break;
      this.onFrame(type, sid, b.subarray(i + HDR, i + HDR + len));
      i += HDR + len;
    }
    if (i < b.length) this.pend = Buffer.from(b.subarray(i));   // copy: don't pin the whole body
  }

  onFrame(type, sid, payload) {
    if (type === T_OPEN) return this.onOpen(sid, payload);
    const st = this.streams.get(sid);
    if (!st) return;
    if (type === T_DATA) {
      if (!payload.length) return;
      account(this, payload.length);
      if (st.state === 'open') st.sock.write(payload);
      else { st.queue.push(Buffer.from(payload)); st.qbytes += payload.length; }
    } else if (type === T_CLOSE) {
      st.clientClosed = true;
      this.streams.delete(sid);
      clearTimeout(st.timer);
      if (st.sock) {
        if (st.state === 'open') {
          st.sock.end();
          setTimeout(() => st.sock.destroy(), 5000).unref();
        } else st.sock.destroy();
      }
    }
    // ACK (6) and unknown types: ignored.
  }

  onOpen(sid, payload) {
    const have = this.streams.get(sid);
    if (have) { if (have.state === 'open') this.emit(T_OPEN_OK, sid); return; }   // never redial
    let txt = payload.toString('latin1');
    const z = txt.indexOf('\0');
    if (z >= 0) txt = txt.slice(0, z);           // "\0fc" suffix
    const cut = txt.lastIndexOf(':');
    const host = cut > 0 ? txt.slice(0, cut) : '';
    const portS = cut > 0 ? txt.slice(cut + 1) : '';
    const err = (r) => this.emit(T_OPEN_ERR, sid, Buffer.from(r));
    if (host.includes(':') || host.startsWith('[')) return err('ipv6');
    const port = /^\d{1,5}$/.test(portS) ? Number(portS) : -1;
    if (!portAllowed(port)) return err('port');
    if (!/^[A-Za-z0-9._-]{1,253}$/.test(host)) return err('dns');

    const st = { sid, state: 'resolving', sock: null, queue: [], qbytes: 0, timer: null, clientClosed: false, failed: false };
    this.streams.set(sid, st);
    const live = () => !this.dead && this.streams.get(sid) === st;
    const fail = (r) => {
      if (st.failed) return;
      st.failed = true;
      clearTimeout(st.timer);
      if (st.sock) st.sock.destroy();
      if (live()) { this.streams.delete(sid); err(r); }
    };

    resolve4(host).then((ip) => {
      if (!live()) return;
      if (!ALLOW_PRIVATE && isBlockedIp(ip)) return fail('blocked');
      st.state = 'connecting';
      const sock = net.connect({ host: ip, port });
      st.sock = sock;
      st.timer = setTimeout(() => fail('timeout'), DIAL_MS);
      sock.once('connect', () => {
        clearTimeout(st.timer);
        if (!live()) { sock.destroy(); return; }
        st.state = 'open';
        sock.setNoDelay(true);
        this.emit(T_OPEN_OK, sid);
        for (const q of st.queue) sock.write(q);
        st.queue = []; st.qbytes = 0;
        if (this.paused) sock.pause();
      });
      sock.on('data', (chunk) => {
        if (st.clientClosed || !live()) return;
        account(this, chunk.length);
        this.emit(T_DATA, sid, chunk);
      });
      sock.on('error', (e) => { if (st.state === 'connecting') fail(dialError(e)); });
      sock.on('close', () => {
        if (st.state !== 'open') { fail('refused'); return; }
        if (!st.clientClosed && live()) { this.streams.delete(sid); this.emit(T_CLOSE, sid); }
      });
    }, () => fail('dns'));
  }

  pendingUp() {
    let n = 0;
    for (const st of this.streams.values()) n += st.qbytes + (st.sock ? st.sock.writableLength : 0);
    return n;
  }

  kill(reason, why) {
    if (this.dead) return;
    this.dead = true;
    if (sessions.get(this.id) === this) sessions.delete(this.id);
    if (reason) tombstones.set(this.id, { reason, roleKey: this.roleKey, t: Date.now() });
    for (const st of this.streams.values()) { clearTimeout(st.timer); if (st.sock) st.sock.destroy(); }
    this.streams.clear();
    if (this.down) this.endDown(this.down);
    this.chunks = []; this.pend = null;
    log(`session ${sid6(this.id)} closed${why ? ': ' + why : ''}${reason ? ' [' + reason + ']' : ''}`);
  }
}

function account(sess, n) {
  if (!sess.demo) {
    // Personal tokens: owner-only usage stats (no limits).
    const p = personalRec(sess.roleKey);
    const day = today();
    p.days[day] = (p.days[day] || 0) + n;
    p.last = nowSec();
    scheduleSave();
    return;
  }
  state.bytes[sess.ukey] = (state.bytes[sess.ukey] || 0) + n;
  const day = today();
  state.days[day] = (state.days[day] || 0) + n;
  scheduleSave();
  if (!sess.limitQueued) {
    const r = demoLimitReason(sess.ukey);
    if (r) { sess.limitQueued = true; setImmediate(() => sess.kill(r, 'demo limit')); }
  }
}

// GC: idle sessions, demo trial time, tombstones, config mtime.
setInterval(() => {
  const now = Date.now();
  for (const s of sessions.values()) {
    if (!s.down && s.upBusy === 0 && now - s.lastActive > IDLE_MS) s.kill('', 'idle');
    else if (s.demo) { const r = demoLimitReason(s.ukey); if (r) s.kill(r, 'demo limit'); }
  }
  for (const [id, t] of tombstones) if (now - t.t > TOMBSTONE_MS) tombstones.delete(id);
}, 5000);
setInterval(() => loadConfig(false), 60000);

// ── HTTP ─────────────────────────────────────────────────────────────────────

function send(res, code, body, headers) {
  if (res.headersSent) { try { res.end(); } catch {} return; }
  res.writeHead(code, Object.assign({ 'Content-Type': 'text/plain', 'Cache-Control': 'no-store' }, headers || {}));
  res.end(body);
}

function refuse(res, reason) {
  send(res, 503, reason, { 'X-OF-Reason': reason, 'Retry-After': '30' });
}

function parseOffset(v) {
  if (v === null || v === '') return 0;
  if (!/^\d{1,16}$/.test(v)) return -1;
  const n = Number(v);
  return Number.isSafeInteger(n) ? n : -1;
}

/** Unknown session: 503 with the stored reason (demo limit) or 410. */
function goneOrReason(res, s, role) {
  const t = tombstones.get(s);
  if (t && t.roleKey === role.key) return refuse(res, t.reason);
  return send(res, 410, 'gone');
}

function handleDown(req, res, q, role, s) {
  if (req.method !== 'GET' && req.method !== 'HEAD') return send(res, 405, 'method');
  const from = parseOffset(q.get('from'));
  if (from < 0) return send(res, 400, 'bad from');
  let sess = sessions.get(s);
  if (sess && sess.roleKey !== role.key) return send(res, 410, 'gone');
  if (!sess) {
    if (from !== 0) return goneOrReason(res, s, role);
    if (sessions.size >= MAX_SESSIONS) return refuse(res, 'busy');
    let ukey = null;
    if (role.kind === 'demo') {
      const c = q.get('c') || '';
      const d = cfg.demo;
      if (d.until > 0 && nowSec() > d.until) return refuse(res, 'ended');
      if (!C_RE.test(c)) return refuse(res, 'noclient');
      ukey = ukeyOf(c);
      const r = demoLimitReason(ukey);
      if (r) return refuse(res, r);
      let live = 0;
      for (const o of sessions.values()) if (o.demo && o.ukey !== ukey) live++;
      if (live >= d.max) return refuse(res, 'busy');
      for (const o of [...sessions.values()]) if (o.demo && o.ukey === ukey) o.kill('', 'replaced by a new session of the same install');
      if (!state.trial[ukey]) { state.trial[ukey] = nowSec(); scheduleSave(); }
    }
    tombstones.delete(s);
    sess = new Session(s, role, ukey);
    sessions.set(s, sess);
    if (role.kind === 'personal') {
      const p = personalRec(role.key);
      p.sessions = (p.sessions || 0) + 1;
      p.last = nowSec();
      scheduleSave();
    }
    log(`session ${sid6(s)} created (${role.kind === 'demo' ? 'demo' : 'personal ' + role.id})`);
  } else if (sess.demo) {
    const r = demoLimitReason(sess.ukey);
    if (r) { sess.kill(r, 'demo limit'); return refuse(res, r); }
  }
  if (from < sess.acked || from > sess.produced) {
    sess.kill('', `bad resume offset (${from} not in [${sess.acked}, ${sess.produced}])`);
    return send(res, 410, 'gone');
  }
  sess.ack(from);
  sess.lastActive = Date.now();
  const h = {
    'Content-Type': 'application/octet-stream',
    'X-Accel-Buffering': 'no',
    'Cache-Control': 'no-store',
  };
  if (sess.demo) Object.assign(h, demoHeaders(sess.ukey));
  res.writeHead(200, h);
  if (res.socket) res.socket.setNoDelay(true);
  if (req.method === 'HEAD') return res.end();
  sess.attachDown(res, from);
}

function handleUp(req, res, q, role, s) {
  if (req.method !== 'POST') return send(res, 405, 'method');
  const off = parseOffset(q.get('off'));
  if (off < 0) return send(res, 400, 'bad off');
  const closeAfter = { Connection: 'close' };
  const sess = sessions.get(s);
  if (!sess || sess.roleKey !== role.key) { req.resume(); return goneOrReason(res, s, role); }
  if (sess.demo) {
    const r = demoLimitReason(sess.ukey);
    if (r) { req.resume(); sess.kill(r, 'demo limit'); return refuse(res, r); }
  }
  const cl = Number(req.headers['content-length']);
  const reject413 = () => {
    send(res, 413, 'too large', closeAfter);
    req.resume();                                         // discard the rest, never buffer it
    setTimeout(() => req.destroy(), 5000).unref();
  };
  if (Number.isFinite(cl) && cl > MAX_BODY) return reject413();

  sess.upBusy++;
  sess.lastActive = Date.now();
  let done = false;
  const finish = (code, body, h) => {
    if (done) return;
    done = true;
    sess.upBusy--;
    sess.lastActive = Date.now();
    send(res, code, body, h);
  };
  const parts = [];
  let size = 0;
  req.on('data', (c) => {
    if (done) return;
    size += c.length;
    if (size > MAX_BODY) {
      parts.length = 0;
      done = true; sess.upBusy--; sess.lastActive = Date.now();
      reject413();
      return;
    }
    parts.push(c);
  });
  req.on('close', () => {
    if (!done && !req.complete) { done = true; parts.length = 0; sess.upBusy--; sess.lastActive = Date.now(); }
  });
  req.on('end', async () => {
    if (done) return;
    const body = parts.length === 1 ? parts[0] : Buffer.concat(parts, size);
    parts.length = 0;
    // Destination backpressure: don't accept more while a lot is still queued to the targets.
    const t0 = Date.now();
    while (!sess.dead && sess.pendingUp() > UP_PENDING_MAX && Date.now() - t0 < UP_WAIT_MS && !res.destroyed) {
      await new Promise((r) => setTimeout(r, 100));
    }
    if (sess.dead) {
      const t = tombstones.get(s);
      return t ? finish(503, t.reason, { 'X-OF-Reason': t.reason, 'Retry-After': '30' }) : finish(410, 'gone');
    }
    if (sess.pendingUp() > UP_PENDING_MAX) return finish(503, 'slow', { 'Retry-After': '1' });
    if (off > sess.upRecv) return finish(409, 'need ' + sess.upRecv);
    const skip = sess.upRecv - off;
    if (skip < body.length) {
      sess.upRecv = off + body.length;
      sess.feed(skip > 0 ? body.subarray(skip) : body);
    }
    if (sess.dead) return finish(410, 'gone');
    finish(200, 'ok ' + sess.upRecv);
  });
}

// ── private stats (admin token only) ─────────────────────────────────────────
// Shows counts only: no tokens, no install ids, no destinations.

function statsData() {
  const now = nowSec();
  const day = today();
  const week = (days) => Object.values(days || {}).reduce((a, b) => a + b, 0);
  const live = {};
  let demoLive = 0;
  for (const s of sessions.values()) {
    if (s.demo) demoLive++;
    else live[s.roleKey] = (live[s.roleKey] || 0) + 1;
  }
  const ids = new Set([...(cfg.personalIds || [])]);
  for (const k of Object.keys(state.personal)) if (k.startsWith('p:')) ids.add(k.slice(2));
  const personal = [...ids].sort().map((id) => {
    const key = 'p:' + id;
    const p = state.personal[key] || {};
    return {
      id,
      active: (cfg.personalIds || []).includes(id),
      liveSessions: live[key] || 0,
      lastSeen: p.last || 0,
      firstSeen: p.first || 0,
      sessionsTotal: p.sessions || 0,
      bytesToday: (p.days && p.days[day]) || 0,
      bytesWeek: week(p.days),
    };
  });
  const d = cfg.demo;
  const trials = Object.values(state.trial);
  const todayStart = Math.floor(Date.parse(day + 'T00:00:00Z') / 1000);
  return {
    now, uptimeSec: Math.floor((Date.now() - startedAt) / 1000),
    sessionsTotal: sessions.size,
    personal,
    demo: d ? {
      liveSessions: demoLive, max: d.max,
      triedTotal: trials.length,
      triedToday: trials.filter((t) => t >= todayStart).length,
      inTrialNow: trials.filter((t) => now - t < d.seconds).length,
      bytesToday: state.days[day] || 0, dailyLimitBytes: d.dailyMb * MiB,
      until: d.until,
    } : null,
  };
}

function handleStats(res, asJson) {
  const s = statsData();
  if (asJson) return send(res, 200, JSON.stringify(s), { 'Content-Type': 'application/json; charset=utf-8' });
  const esc = (v) => String(v).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const mb = (b) => (b / MiB).toFixed(b < 10 * MiB ? 1 : 0) + ' МБ';
  const msk = (t) => t ? new Date(t * 1000).toLocaleString('ru-RU', { timeZone: 'Europe/Moscow' }) : '—';
  const ago = (t) => {
    if (!t) return 'никогда';
    const d = s.now - t;
    if (d < 90) return 'только что';
    if (d < 3600) return Math.round(d / 60) + ' мин назад';
    if (d < 86400) return Math.round(d / 3600) + ' ч назад';
    return Math.round(d / 86400) + ' дн назад';
  };
  const rows = s.personal.map((p) => `<tr${p.active ? '' : ' class="off"'}><td>${esc(p.id)}${p.active ? '' : ' (выкл.)'}</td>` +
    `<td class="n">${p.liveSessions ? '<b>' + p.liveSessions + '</b>' : '0'}</td><td>${ago(p.lastSeen)}</td>` +
    `<td class="n">${mb(p.bytesToday)}</td><td class="n">${mb(p.bytesWeek)}</td><td class="n">${p.sessionsTotal}</td></tr>`).join('');
  const d = s.demo;
  const demoBlock = d ? `<h2>Демо</h2><table>
<tr><td>Занято мест сейчас</td><td class="n"><b>${d.liveSessions}</b> из ${d.max}</td></tr>
<tr><td>Устройств в пробном часе</td><td class="n">${d.inTrialNow}</td></tr>
<tr><td>Начали пробу сегодня (UTC)</td><td class="n">${d.triedToday}</td></tr>
<tr><td>Всего устройств пробовало</td><td class="n">${d.triedTotal}</td></tr>
<tr><td>Трафик демо сегодня</td><td class="n">${mb(d.bytesToday)} из ${mb(d.dailyLimitBytes)}</td></tr>
<tr><td>Демо работает до</td><td class="n">${d.until ? msk(d.until) : 'без срока'}</td></tr></table>` : '<h2>Демо</h2><p>выключено</p>';
  const html = `<!doctype html><html lang="ru"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1"><meta http-equiv="refresh" content="30">
<meta name="robots" content="noindex,nofollow"><title>OpenFlux · статистика</title>
<style>body{font:15px/1.45 system-ui,sans-serif;margin:0;padding:16px;background:#0b1220;color:#e5e7eb}
h1{font-size:20px;margin:0 0 4px}h2{font-size:16px;margin:22px 0 8px;color:#22d3ee}.sub{color:#94a3b8;font-size:13px}
table{border-collapse:collapse;width:100%;max-width:720px}td,th{padding:7px 8px;border-bottom:1px solid #1f2a3d;text-align:left}
th{color:#94a3b8;font-weight:500;font-size:13px}.n{text-align:right;font-variant-numeric:tabular-nums}.off td{color:#64748b}
.wrap{overflow-x:auto}</style></head><body>
<h1>OpenFlux · статистика</h1>
<div class="sub">${msk(s.now)} МСК · сервер работает ${Math.floor(s.uptimeSec / 3600)} ч ${Math.floor(s.uptimeSec % 3600 / 60)} мин · всего сессий сейчас: ${s.sessionsTotal} · обновляется каждые 30 с</div>
<h2>Личные токены</h2><div class="wrap"><table><tr><th>Токен</th><th class="n">Сессий сейчас</th><th>Активность</th><th class="n">Сегодня</th><th class="n">7 дней</th><th class="n">Подключений всего</th></tr>${rows || '<tr><td colspan="6">нет</td></tr>'}</table></div>
${demoBlock}
<p class="sub">«Сессий сейчас» — открытые подключения; сессия живёт ещё ~1 мин после отключения. Учёт по личным токенам ведётся с момента обновления сервера.</p>
</body></html>`;
  return send(res, 200, html, { 'Content-Type': 'text/html; charset=utf-8', 'X-Robots-Tag': 'noindex' });
}

function onRequest(req, res) {
  res.setHeader('X-OF-Proto', '2');
  req.on('error', () => {});
  res.on('error', () => {});
  let q;
  try {
    const i = req.url.indexOf('?');
    q = new URLSearchParams(i >= 0 ? req.url.slice(i + 1) : '');
  } catch { return send(res, 400, 'bad'); }
  const role = roleFor(q.get('k'));
  if (!role) { req.resume(); return send(res, 404, 'no'); }
  if (q.get('r') === 'stats') {
    req.resume();
    if (!role.admin) return send(res, 404, 'no');      // indistinguishable from a bad token
    return handleStats(res, q.get('format') === 'json');
  }
  const s = q.get('s') || '';
  if (!S_RE.test(s)) { req.resume(); return send(res, 400, 'bad session'); }
  const r = q.get('r');
  if (r === 'down') return handleDown(req, res, q, role, s);
  if (r === 'up') return handleUp(req, res, q, role, s);
  req.resume();
  send(res, 400, 'bad role');
}

// ── start ────────────────────────────────────────────────────────────────────

loadState();
loadConfig(true);

process.on('SIGHUP', () => { log('SIGHUP: reloading config'); loadConfig(true); });
for (const sig of ['SIGTERM', 'SIGINT']) {
  process.on(sig, () => { saveStateSync(); process.exit(0); });
}
process.on('uncaughtException', (e) => { log('uncaught:', e && e.stack ? e.stack.split('\n').slice(0, 3).join(' | ') : e); });

const server = http.createServer(onRequest);
server.keepAliveTimeout = 30000;
server.headersTimeout = 35000;
server.requestTimeout = 120000;       // time to RECEIVE a request (down responses may be long)
server.on('clientError', (e, sock) => { try { sock.destroy(); } catch {} });
server.listen(process.env.PORT || 3000, () => {
  const a = server.address();
  log(`OpenFlux v2 exit listening on ${a && typeof a === 'object' ? a.port : a}`);
});

module.exports = { server };
