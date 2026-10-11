<?php
// OpenFlux exit config for MyAppVPN. Copy to config.php next to phpbox.php.
// Keep config.php private: whoever has a token can use your hosting as a proxy.

// Simplest setup — one personal token (a long random string, 30+ characters):
define('PHPBOX_TOKEN', 'CHANGE-ME-to-a-long-random-string');

// Some hosts (e.g. Beget) run each PHP request with a private /tmp, so the up/down
// bus MUST live in a shared folder OUTSIDE public_html. Beget path looks like:
//   /home/<first letter of login>/<login>/<site name>/ofbus
// putenv('PHPBOX_BUS=/home/u/user/example.com/ofbus');

// ── Optional: several personal tokens (each gets its own reserved slot) ──
// define('PHPBOX_PERSONAL', [
//     'phone'  => 'long-random-token-1',
//     'laptop' => 'long-random-token-2',
// ]);

// ── Optional: a public demo token with limits ──
// define('PHPBOX_DEMO', 'demo-long-random-token');
// define('PHPBOX_DEMO_MAX', 11);           // concurrent demo users; beyond that: "busy, try later"
// define('PHPBOX_DEMO_SECONDS', 3600);     // one-time trial per app install, wall-clock from first connect
// define('PHPBOX_DEMO_USER_MB', 2048);     // one-time traffic per app install
// define('PHPBOX_DEMO_DAILY_MB', 25600);   // safety cap for all demo traffic per day
// define('PHPBOX_DEMO_UNTIL', 0);          // unix time when the demo ends (0 = no end)
