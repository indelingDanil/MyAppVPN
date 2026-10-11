<?php
if (is_file(__DIR__ . '/config.php')) { require_once __DIR__ . '/config.php'; }   // token of a deployed node
/**
 * phpbox.php - stream-mux exit for the OpenFlux client on plain PHP hosting
 * (including free shared hosting that cannot run a binary, hold a process,
 * or listen on a socket). See transport/phpbox in the core for the client.
 *
 * NOT a packet exit and NOT an open proxy: the client speaks a tiny stream
 * mux (OPEN host:port / DATA / CLOSE) over two half-duplex HTTP channels,
 * because such hosts buffer request bodies but stream responses:
 *
 *   down (GET,  long-poll) - THE session process: holds the dst sockets,
 *      stream_select()s them, and streams dst->client frames in the response.
 *      It also drains the upstream bus each loop and applies OPEN/DATA/CLOSE.
 *   up   (POST, short)     - appends client->dst frames to the per-session bus
 *      (a file; no MySQL and no persistent process needed), returns at once.
 *
 * A session id is minted per down-connection, so a reconnect after the host
 * caps the request (RUN_CAP) starts clean; MTProto and short HTTPS tolerate
 * it. Guards: a shared token, only ports 80/443, and no private/loopback
 * targets. v0 carries frames in the clear - the OpenFlux client should wrap
 * the carrier with the core's encryption before real use.
 *
 * Setup: upload next to a domain, set PHPBOX_TOKEN in the environment (or
 * edit the constant), point the client's phpbox transport at its URL.
 *
 * Frame: type(1) | stream_id(4 BE) | len(4 BE) | payload(len)
 *   1 OPEN "host:port"  2 DATA  3 CLOSE  4 OPEN_OK  5 OPEN_ERR reason
 */

$TOKEN = (function_exists('getenv') ? getenv('PHPBOX_TOKEN') : false) ?: (defined('PHPBOX_TOKEN') ? PHPBOX_TOKEN : 'CHANGE-ME'); // putenv is disabled on some free hosts: config.php also define()s it
$BUS_DIR = (function_exists('getenv') ? getenv('PHPBOX_BUS') : false) ?: (sys_get_temp_dir() . '/phpbox-bus');
const RUN_CAP = 300;   // seconds a down-poll holds before returning (client reconnects)
const DIAL_TO = 6;

const OPEN = 1, DATA = 2, CLOSE = 3, OPEN_OK = 4, OPEN_ERR = 5;

$ROLE = of_auth((string)($_GET['k'] ?? ''), $TOKEN);
if ($ROLE === null) { http_response_code(404); exit("no\n"); }
$sess = preg_replace('/[^a-zA-Z0-9]/', '', $_GET['s'] ?? '');
if ($sess === '') { http_response_code(400); exit("no session\n"); }
@mkdir($BUS_DIR, 0700, true);
$busUp = $BUS_DIR . "/$sess.up";

switch ($_GET['r'] ?? '') {
    case 'up':   up_ingest($busUp); break;
    case 'down':
        $why = of_admit($ROLE, $BUS_DIR, $sess);
        if ($why !== '') { http_response_code(503); header('X-OF-Reason: ' . $why); header('Retry-After: 30'); exit($why . "\n"); }
        down_pump($busUp);
        break;
    default:     http_response_code(400); exit("bad role\n");
}

// ---- upstream: append the POSTed frames to the bus, return now -----------
function up_ingest(string $busUp): void
{
    $body = file_get_contents('php://input');
    $n = false;
    $fp = @fopen($busUp, 'ab');
    if ($fp) { flock($fp, LOCK_EX); $n = fwrite($fp, $body); fflush($fp); flock($fp, LOCK_UN); fclose($fp); }
    header('Content-Type: text/plain');
    if ($n !== strlen($body)) { http_response_code(507); exit('store failed ' . (int)$n . "\n"); }
    echo 'ok ' . strlen($body) . "\n";
}

// ---- downstream: the session. Hold sockets, pump both ways ---------------
function down_pump(string $busUp): void
{
    if (function_exists('set_time_limit')) { @set_time_limit(0); }
    if (function_exists('ignore_user_abort')) { ignore_user_abort(false); }   // client gone => end the session
    header('Content-Type: application/octet-stream');
    header('X-Accel-Buffering: no');       // ask LiteSpeed/nginx not to buffer
    header('Content-Encoding: none');
    while (ob_get_level() > 0) { ob_end_flush(); }
    echo str_repeat(' ', 4095) . "\n";   // exactly 4096 B (MyAppVPN patch)
    $GLOBALS['pend'] = 0;     // pad past any fixed output buffer
    @flush();
    @touch($busUp);
    foreach ((array)glob(dirname($busUp) . '/*.up') as $old) {
        if ($old !== $busUp && time() - (int)@filemtime($old) > RUN_CAP + 60) { @unlink($old); }
    }

    $socks = [];                            // stream_id => resource
    $upfp  = fopen($busUp, 'rb');
    $inbuf = '';
    $start = microtime(true);

    while (microtime(true) - $start < RUN_CAP) {
        $chunk = stream_get_contents($upfp);
        if ($chunk !== false && $chunk !== '') { $inbuf .= $chunk; }
        while (($f = take_frame($inbuf)) !== null) {
            [$type, $sid, $payload] = $f;
            if ($type === OPEN) {
                if (isset($socks[$sid])) { emit(OPEN_OK, $sid, ''); continue; }   // re-sent OPEN
                if (isset($GLOBALS['of_pend'][$sid])) { continue; }              // still connecting
                $payload = explode("\0", $payload, 2)[0];   // MyAppVPN patch: strip "\0fc"
                $cut = strrpos($payload, ':');   // MyAppVPN patch: split at the LAST colon (IPv6-safe)
                $host = trim($cut === false ? $payload : substr($payload, 0, $cut), '[]');
                $port = $cut === false ? '' : substr($payload, $cut + 1);
                if (!in_array((int)$port, [80, 443], true)) { emit(OPEN_ERR, $sid, 'port'); continue; }
                if (is_private_host($host)) { emit(OPEN_ERR, $sid, 'blocked'); continue; }
                $s = @stream_socket_client("tcp://" . (strpos($host, ':') !== false ? "[$host]" : $host) . ":$port", $e, $es, DIAL_TO, STREAM_CLIENT_CONNECT | STREAM_CLIENT_ASYNC_CONNECT);
                if ($s) { stream_set_blocking($s, false); $GLOBALS['of_pend'][$sid] = [$s, microtime(true)]; }   // OPEN_OK once connected
                else { emit(OPEN_ERR, $sid, (string)$es); }
            } elseif ($type === DATA && (isset($socks[$sid]) || isset($GLOBALS['of_pend'][$sid]))) {
                of_queue_write($sid, $payload, $socks);
            } elseif ($type === CLOSE && (isset($socks[$sid]) || isset($GLOBALS['of_pend'][$sid]))) {
                of_close($sid, $socks);
            }
        }

        of_pending_tick($socks);
        if ($socks) {
            $r = $socks; $w = $ex = null;
            if (@stream_select($r, $w, $ex, 0, 50000) > 0) {
                foreach ($r as $s) {
                    $sid = array_search($s, $socks, true);
                    $d = @fread($s, 32768);
                    if ($d === '' || $d === false) {
                        if (feof($s)) { emit(CLOSE, $sid, ''); @fclose($s); unset($socks[$sid]); }
                    } else {
                        emit(DATA, $sid, $d);
                    }
                }
            }
        } else {
            usleep(50000);
        }
        pad_out();
        of_keepalive();
        if (!of_tick()) { break; }   // slot taken over / demo quota spent
        if (connection_aborted()) { break; }
    }
    foreach ($socks as $s) { @fclose($s); }
    @fclose($upfp); @unlink($busUp);
    of_release();
}

function emit(int $type, int $sid, string $payload): void
{
    $f = pack('CNN', $type, $sid, strlen($payload)) . $payload;
    echo $f;
    $GLOBALS['pend'] = ($GLOBALS['pend'] ?? 0) + strlen($f);
    $GLOBALS['of_bytes'] = ($GLOBALS['of_bytes'] ?? 0) + strlen($f);
    @flush();
}

// MyAppVPN patch (Beget): the front nginx releases the response only in 4 KiB
// chunks (X-Accel-Buffering is ignored), so a lone 9-byte OPEN_OK would sit in
// the buffer forever. After each loop pass, top the output up to a 4 KiB
// boundary with a DATA frame for stream 0xFFFFFFFF, which the client drops.
function pad_out(): void
{
    $p = $GLOBALS['pend'] ?? 0;
    if ($p <= 0) { return; }
    $need = 4096 - ($p % 4096);
    if ($need === 4096) { $GLOBALS['pend'] = 0; return; }
    if ($need < 9) { $need += 4096; }
    echo pack('CNN', DATA, 0xFFFFFFFF, $need - 9) . str_repeat("\0", $need - 9);
    $GLOBALS['pend'] = 0;
    @flush();
}

/** Pull one whole frame off the front of $buf, or null if incomplete. */
function take_frame(string &$buf): ?array
{
    if (strlen($buf) < 9) { return null; }
    $h = unpack('Ctype/Nsid/Nlen', substr($buf, 0, 9));
    if (strlen($buf) < 9 + $h['len']) { return null; }
    $payload = substr($buf, 9, $h['len']);
    $buf = substr($buf, 9 + $h['len']);
    return [$h['type'], $h['sid'], $payload];
}

/** Refuse loopback / private / reserved targets (no SSRF into the host LAN). */
function is_private_host(string $host): bool
{
    if (function_exists('getenv') && getenv('PHPBOX_ALLOW_PRIVATE') === '1') { return false; } // local testing only
    $ips = [];
    if (filter_var($host, FILTER_VALIDATE_IP)) {
        $ips[] = $host;
    } else {
        foreach (@dns_get_record($host, DNS_A + DNS_AAAA) ?: [] as $rec) {
            $ips[] = $rec['ip'] ?? $rec['ipv6'] ?? null;
        }
        if (!array_filter($ips)) { $ips = [gethostbyname($host)]; }
    }
    foreach (array_filter($ips) as $ip) {
        if (!filter_var($ip, FILTER_VALIDATE_IP,
                FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE)) {
            return true;
        }
    }
    return false;
}


// ── MyAppVPN: async connects + write buffers ────────────────────────────────

/** Finish pending connects (OPEN_OK / OPEN_ERR) and flush per-stream write buffers. */
function of_pending_tick(array &$socks): void
{
    $pend = $GLOBALS['of_pend'] ?? [];
    if ($pend) {
        $w = [];
        foreach ($pend as $sid => $p) { $w[$sid] = $p[0]; }
        $wc = $w; $r = null; $ex = null;
        if (@stream_select($r, $wc, $ex, 0, 0) > 0) {
            foreach ($wc as $s) {
                $sid = array_search($s, $w, true);
                unset($GLOBALS['of_pend'][$sid]);
                if (@stream_socket_get_name($s, true) !== false) {
                    $socks[$sid] = $s;
                    emit(OPEN_OK, $sid, '');
                } else {
                    @fclose($s);
                    unset($GLOBALS['of_wbuf'][$sid]);
                    emit(OPEN_ERR, $sid, 'connect failed');
                }
            }
        }
        $now = microtime(true);
        foreach ($GLOBALS['of_pend'] ?? [] as $sid => $p) {
            if ($now - $p[1] > DIAL_TO) {
                @fclose($p[0]);
                unset($GLOBALS['of_pend'][$sid], $GLOBALS['of_wbuf'][$sid]);
                emit(OPEN_ERR, $sid, 'timeout');
            }
        }
    }
    foreach ($GLOBALS['of_wbuf'] ?? [] as $sid => $buf) {
        if ($buf === '' || !isset($socks[$sid])) { continue; }
        $n = @fwrite($socks[$sid], $buf);
        if ($n === false || $n === 0) { continue; }
        $GLOBALS['of_wbuf'][$sid] = (string)substr($buf, $n);
    }
}

function of_queue_write(int $sid, string $p, array &$socks): void
{
    $buf = ($GLOBALS['of_wbuf'][$sid] ?? '') . $p;
    if (isset($socks[$sid]) && $buf !== '') {
        $n = @fwrite($socks[$sid], $buf);
        if ($n !== false && $n > 0) { $buf = (string)substr($buf, $n); }
    }
    $GLOBALS['of_wbuf'][$sid] = $buf;
}

function of_close(int $sid, array &$socks): void
{
    if (isset($socks[$sid])) {
        $b = $GLOBALS['of_wbuf'][$sid] ?? '';
        if ($b !== '') { @stream_set_blocking($socks[$sid], true); @stream_set_timeout($socks[$sid], 2); @fwrite($socks[$sid], $b); }
        @fclose($socks[$sid]);
        unset($socks[$sid]);
    }
    if (isset($GLOBALS['of_pend'][$sid])) { @fclose($GLOBALS['of_pend'][$sid][0]); unset($GLOBALS['of_pend'][$sid]); }
    unset($GLOBALS['of_wbuf'][$sid]);
}


// ── MyAppVPN: token tiers, slots, demo limits ───────────────────────────────

// A slot is "live" while its heartbeat file is younger than this (a function, not a top-level
// const: consts at the end of the file are defined only when execution reaches them).
function of_hb_ttl(): int { return 20; }

function of_auth(string $k, string $legacy): ?array
{
    if ($k === '') { return null; }
    if (defined('PHPBOX_PERSONAL') && is_array(PHPBOX_PERSONAL)) {
        foreach (PHPBOX_PERSONAL as $id => $tok) {
            if (is_string($tok) && $tok !== '' && hash_equals($tok, $k)) { return ['kind' => 'personal', 'id' => (string)$id]; }
        }
    }
    if (defined('PHPBOX_DEMO') && PHPBOX_DEMO !== '' && hash_equals(PHPBOX_DEMO, $k)) { return ['kind' => 'demo']; }
    if ($legacy !== '' && $legacy !== 'CHANGE-ME' && hash_equals($legacy, $k)) { return ['kind' => 'personal', 'id' => 'owner']; }
    return null;
}

function of_client_ip(): string
{
    $ip = $_SERVER['HTTP_X_REAL_IP'] ?? ($_SERVER['REMOTE_ADDR'] ?? '0');
    return preg_replace('/[^0-9a-fA-F:.]/', '', (string)$ip);
}

function of_fresh(string $f): bool { return is_file($f) && (time() - (int)@filemtime($f)) < of_hb_ttl(); }

/** Returns '' when admitted (and claims the slot), else a reason: 'busy' | 'quota'. */
function of_admit(array $role, string $dir, string $sess): string
{
    $GLOBALS['of_dir'] = $dir; $GLOBALS['of_sess'] = $sess; $GLOBALS['of_demo'] = false;
    if ($role['kind'] === 'personal') {
        // Personal slot: always available; the newest session of a token owns it.
        $GLOBALS['of_hb'] = "$dir/p-" . preg_replace('/[^a-zA-Z0-9_]/', '', $role['id']) . "-$sess.hb";
        @file_put_contents($GLOBALS['of_hb'], $sess, LOCK_EX);
        return '';
    }
    $GLOBALS['of_demo'] = true;
    // Demo = a one-time trial per app install: the app sends a random install id (c=).
    // Slot and usage are keyed by it (not by IP — mobile CGNAT puts many users on one IP).
    // Demo campaign window (PHPBOX_DEMO_UNTIL = unix time); after it the demo is over.
    if (defined('PHPBOX_DEMO_UNTIL') && (int)PHPBOX_DEMO_UNTIL > 0 && time() > (int)PHPBOX_DEMO_UNTIL) { return 'ended'; }
    $c = preg_replace('/[^a-zA-Z0-9-]/', '', (string)($_GET['c'] ?? ''));
    if (strlen($c) < 8) { return 'noclient'; }
    $key = md5($c);
    $GLOBALS['of_ukey'] = $key;
    $limit = of_demo_limit();
    // The trial hour is wall-clock from the FIRST admitted connection (as announced), not
    // connected time: disconnecting does not pause it.
    $start = of_trial_start($dir, $key, false);
    $used = $start > 0 ? time() - $start : 0;
    if ($used >= $limit) { return 'expired'; }
    $userBytes = of_user_bytes_add($dir, $key, 0);
    if ($userBytes >= of_demo_user_bytes()) { return 'expired'; }   // personal 2 GB used up
    $quotaMb = defined('PHPBOX_DEMO_DAILY_MB') ? (int)PHPBOX_DEMO_DAILY_MB : 25600;
    if (of_demo_bytes_today($dir) >= $quotaMb * 1048576) { return 'quota'; }
    $mine = "$dir/d-$key.hb";
    $max = defined('PHPBOX_DEMO_MAX') ? (int)PHPBOX_DEMO_MAX : 11;
    $live = 0;
    $reconnect = of_fresh($mine);                     // this install already holds a slot
    foreach ((array)glob("$dir/d-*.hb") as $f) {
        if ($f === $mine) { continue; }
        if (of_fresh($f)) { $live++; } else { @unlink($f); }
    }
    // No queue by design: when all demo slots are taken, the user is told "busy, try later".
    if (!$reconnect && $live >= $max) { return 'busy'; }
    $GLOBALS['of_hb'] = $mine;
    if ($start <= 0) { $start = of_trial_start($dir, $key, true); }   // clock starts now
    $GLOBALS['of_trial_start'] = $start;
    @file_put_contents($mine, $sess, LOCK_EX);
    header('X-OF-Left: ' . max(0, $limit - $used));   // seconds of trial left
    header('X-OF-Left-MB: ' . max(0, intdiv(of_demo_user_bytes() - $userBytes, 1048576)));
    return '';
}

function of_demo_user_bytes(): int
{
    return (defined('PHPBOX_DEMO_USER_MB') ? (int)PHPBOX_DEMO_USER_MB : 2048) * 1048576;
}

/** Per-install demo traffic counter. */
function of_user_bytes_add(string $dir, string $key, int $b): int
{
    $fp = @fopen("$dir/u-$key.bytes", 'c+');
    if (!$fp) { return 0; }
    flock($fp, LOCK_EX);
    $cur = (int)stream_get_contents($fp) + max(0, $b);
    if ($b > 0) { ftruncate($fp, 0); rewind($fp); fwrite($fp, (string)$cur); }
    flock($fp, LOCK_UN); fclose($fp);
    return $cur;
}

/**
 * PHP only notices a vanished client when it writes. An idle session writes nothing, so a
 * dropped client kept its process (and slot) for up to RUN_CAP — and a handful of those hit
 * the host's process limit (HTTP 500 for everyone). Every 5 s send one 4 KiB filler frame
 * (passes the 4 KiB front buffer; ~0.8 KB/s per connected user) so aborts are detected fast.
 */
function of_keepalive(): void
{
    static $last = 0;
    $now = time();
    if ($last === 0) { $last = $now; return; }
    if ($now - $last < 5) { return; }
    $last = $now;
    echo pack('CNN', DATA, 0xFFFFFFFF, 4096 - 9) . str_repeat("\0", 4096 - 9);
    @flush();
}

function of_demo_limit(): int { return defined('PHPBOX_DEMO_SECONDS') ? (int)PHPBOX_DEMO_SECONDS : 3600; }

/** Adds $sec of connected time to an install's trial usage; returns the new total. */
function of_usage_add(string $dir, string $key, int $sec): int
{
    $fp = @fopen("$dir/u-$key.cnt", 'c+');
    if (!$fp) { return 0; }
    flock($fp, LOCK_EX);
    $cur = (int)stream_get_contents($fp) + max(0, $sec);
    if ($sec > 0) { ftruncate($fp, 0); rewind($fp); fwrite($fp, (string)$cur); }
    flock($fp, LOCK_UN); fclose($fp);
    return $cur;
}

/** Bills connected time since the last call (demo only). */
/** First-admission timestamp of an install's trial (0 if never); $create stamps it now. */
function of_trial_start(string $dir, string $key, bool $create): int
{
    $f = "$dir/u-$key.start";
    $t = (int)@file_get_contents($f);
    if ($t <= 0 && $create) { $t = time(); @file_put_contents($f, (string)$t, LOCK_EX); }
    return $t;
}

function of_bill_time_unused(): int
{
    $now = time();
    $d = $now - (int)($GLOBALS['of_last_usage'] ?? $now);
    $GLOBALS['of_last_usage'] = $now;
    return of_usage_add($GLOBALS['of_dir'], $GLOBALS['of_ukey'], $d);
}

/** Called every loop pass: heartbeat, slot ownership, demo byte accounting. */
function of_tick(): bool
{
    static $last = 0;
    $hb = $GLOBALS['of_hb'] ?? '';
    if ($hb === '') { return true; }
    $now = time();
    if ($now - $last < 5) { return true; }
    $last = $now;
    // A newer session of the same token/IP took the slot over → this one ends.
    if (@file_get_contents($hb) !== $GLOBALS['of_sess']) { return false; }
    @touch($hb);
    if (!empty($GLOBALS['of_demo'])) {
        $b = (int)($GLOBALS['of_bytes'] ?? 0);
        $GLOBALS['of_bytes'] = 0;
        $total = of_demo_add_bytes($GLOBALS['of_dir'], $b);
        $quotaMb = defined('PHPBOX_DEMO_DAILY_MB') ? (int)PHPBOX_DEMO_DAILY_MB : 25600;
        if ($total >= $quotaMb * 1048576) { return false; }
        if (of_user_bytes_add($GLOBALS['of_dir'], $GLOBALS['of_ukey'], $b) >= of_demo_user_bytes()) { return false; }
        if (time() - (int)($GLOBALS['of_trial_start'] ?? time()) >= of_demo_limit()) { return false; }   // trial hour over
    }
    return true;
}

function of_release(): void
{
    $hb = $GLOBALS['of_hb'] ?? '';
    if ($hb !== '' && @file_get_contents($hb) === ($GLOBALS['of_sess'] ?? '')) { @unlink($hb); }
    if (!empty($GLOBALS['of_demo']) && !empty($GLOBALS['of_ukey'])) {
        $rb = (int)($GLOBALS['of_bytes'] ?? 0);
        of_demo_add_bytes($GLOBALS['of_dir'], $rb);
        of_user_bytes_add($GLOBALS['of_dir'], $GLOBALS['of_ukey'], $rb);
    }
}

function of_demo_counter(string $dir): string { return "$dir/demo-" . gmdate('Ymd') . '.bytes'; }

function of_demo_bytes_today(string $dir): int { return (int)@file_get_contents(of_demo_counter($dir)); }

function of_demo_add_bytes(string $dir, int $b): int
{
    $f = of_demo_counter($dir);
    $fp = @fopen($f, 'c+');
    if (!$fp) { return 0; }
    flock($fp, LOCK_EX);
    $cur = (int)stream_get_contents($fp) + max(0, $b);
    ftruncate($fp, 0); rewind($fp); fwrite($fp, (string)$cur);
    flock($fp, LOCK_UN); fclose($fp);
    return $cur;
}
