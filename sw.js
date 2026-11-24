/* AMAZ HR — Service Worker (GitHub Pages)
   একবার ইন্টারনেট সহ খোলার পর সবসময় ইন্টারনেট ছাড়াও খোলে।
   • install: প্রতিটা ফাইল আলাদা করে ক্যাশে রাখা হয় — একটা ফাইল (আইকন ইত্যাদি) না পেলেও বাকিগুলো থাকে
   • index.html (navigate): আগে নেটওয়ার্ক (৩.৫ সেকেন্ড), না পেলে যেকোনো ক্যাশ থেকে — কখনো ERR_FAILED নয়
   • CDN লাইব্রেরি/ফন্ট: cache-first, আলাদা স্থায়ী ক্যাশে (ভার্সন বদলালেও মোছে না)
   • Cloud Sync (Apps Script / Supabase) কখনো ক্যাশ হয় না
   নতুন build দিলে নিচের VERSION বদলে দিন। */
const PREFIX = 'amaz-hr-';
const VERSION = 'amaz-hr-v3.6.3';
const LIBS = 'amaz-hr-libs-v1';
const SHELL = ['./index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png', './icon-maskable.png', './version.json'];
const CDN_HOSTS = ['cdnjs.cloudflare.com', 'cdn.jsdelivr.net', 'unpkg.com', 'fonts.googleapis.com', 'fonts.gstatic.com'];
const NAV_TIMEOUT = 3500;

self.addEventListener('install', e => {
  e.waitUntil((async () => {
    const c = await caches.open(VERSION);
    await Promise.all(SHELL.map(u =>
      fetch(u, { cache: 'reload' })
        .then(res => { if (res && res.ok) return c.put(u, res); })
        .catch(() => {})
    ));
    // index.html দুই key তেই: './index.html' আর './'
    try {
      let idx = await c.match('./index.html');
      if (!idx) {
        const r = await fetch('./', { cache: 'reload' }).catch(() => null);
        if (r && r.ok) { await c.put('./index.html', r.clone()); idx = r; }
      }
      if (idx) await c.put('./', idx.clone ? idx.clone() : idx);
    } catch (err) {}
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', e => {
  e.waitUntil((async () => {
    try {
      const c = await caches.open(VERSION);
      const ok = await c.match('./index.html');
      if (ok) {
        const keys = await caches.keys();
        await Promise.all(keys
          .filter(k => k.startsWith(PREFIX) && k !== VERSION && k !== LIBS)
          .map(k => caches.delete(k)));
      }
    } catch (err) {}
    await self.clients.claim();
  })());
});

function offlinePage() {
  const html = '<!DOCTYPE html><html lang="bn"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">' +
    '<title>AMAZ HR — ইন্টারনেট নেই</title><style>body{margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;' +
    'font-family:"Noto Sans Bengali",system-ui,sans-serif;background:#F4F6FA;color:#0B1B3A}.b{background:#fff;border-radius:16px;padding:32px 28px;' +
    'max-width:360px;text-align:center;box-shadow:0 8px 30px rgba(11,27,58,.12)}h1{font-size:20px;margin:0 0 10px}p{margin:0 0 20px;color:#475569;line-height:1.6}' +
    'button{background:#2563EB;color:#fff;border:0;border-radius:10px;padding:12px 26px;font-size:16px;cursor:pointer}</style></head><body><div class="b">' +
    '<h1>📡 ইন্টারনেট নেই</h1><p>অ্যাপটা এখনো এই ডিভাইসে সেভ হয়নি। একবার ইন্টারনেট সহ খুলুন — তারপর থেকে ইন্টারনেট ছাড়াও খুলবে।</p>' +
    '<button onclick="location.reload()">🔄 আবার চেষ্টা</button></div></body></html>';
  return new Response(html, { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8' } });
}

async function cachedIndex() {
  const opts = { ignoreSearch: true };
  const mine = await caches.open(VERSION);
  return (await mine.match('./index.html', opts)) ||
         (await caches.match('./index.html', opts)) ||
         (await caches.match('./', opts)) ||
         (await caches.match('index.html', opts)) ||
         (await caches.match(new URL('./', self.registration.scope).href, opts)) ||
         (await caches.match(new URL('./index.html', self.registration.scope).href, opts));
}

async function handleNavigate(req) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), NAV_TIMEOUT);
  try {
    const res = await fetch(req, { signal: ctrl.signal, cache: 'no-store' });
    clearTimeout(t);
    if (res && res.ok && (res.headers.get('content-type') || '').includes('text/html')) {
      const c = await caches.open(VERSION);
      await c.put('./index.html', res.clone());
      await c.put('./', res.clone());
      return res;
    }
    if (res && res.ok) return res;
    const hit = await cachedIndex();
    return hit || res;
  } catch (err) {
    clearTimeout(t);
    const hit = await cachedIndex();
    return hit || offlinePage();
  }
}

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  let url;
  try { url = new URL(req.url); } catch (err) { return; }
  const same = url.origin === self.location.origin;

  if (req.mode === 'navigate' || (same && (url.pathname.endsWith('/') || url.pathname.endsWith('/index.html')))) {
    e.respondWith(handleNavigate(req));
    return;
  }

  if (same && url.pathname.endsWith('/version.json')) {
    e.respondWith(
      fetch(req, { cache: 'no-store' }).catch(() =>
        new Response('{}', { status: 200, headers: { 'Content-Type': 'application/json' } }))
    );
    return;
  }

  if (CDN_HOSTS.includes(url.hostname)) {
    e.respondWith((async () => {
      const lib = await caches.open(LIBS);
      const hit = await lib.match(req);
      if (hit) return hit;
      try {
        const res = await fetch(req);
        if (res && (res.ok || res.type === 'opaque')) await lib.put(req, res.clone());
        return res;
      } catch (err) {
        return new Response('', { status: 504, statusText: 'Offline' });
      }
    })());
    return;
  }

  if (same) {
    e.respondWith((async () => {
      const hit = await caches.match(req, { ignoreSearch: true });
      if (hit) return hit;
      try {
        const res = await fetch(req);
        if (res && res.ok) { const c = await caches.open(VERSION); await c.put(req, res.clone()); }
        return res;
      } catch (err) {
        return new Response('', { status: 504, statusText: 'Offline' });
      }
    })());
  }
  // বাকি সব (Cloud Sync ইত্যাদি) — সরাসরি network, ক্যাশ নয়
});
