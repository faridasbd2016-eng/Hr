/* AMAZ HR — Service Worker (GitHub Pages)
   • index.html: network-first — নতুন version push করলে অনলাইনে সাথে সাথে নতুনটা আসে, অফলাইনে শেষ কপি খোলে
   • CDN লাইব্রেরি/ফন্ট: cache-first — একবার লোড হলে ইন্টারনেট ছাড়াও Excel/PDF কাজ করে
   • Cloud Sync (Apps Script / Supabase) কখনো cache হয় না
   নতুন build দিলে নিচের VERSION বদলে দিন। */
const VERSION = 'amaz-hr-v2.6.1';
const CORE = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png'];
const CDN_HOSTS = ['cdnjs.cloudflare.com', 'fonts.googleapis.com', 'fonts.gstatic.com'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(CORE)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin === location.origin) {
    e.respondWith(
      fetch(req).then(res => {
        if (res && res.ok) { const copy = res.clone(); caches.open(VERSION).then(c => c.put(req, copy)); }
        return res;
      }).catch(() => caches.match(req).then(r => r || caches.match('./index.html')))
    );
    return;
  }
  if (CDN_HOSTS.includes(url.hostname)) {
    e.respondWith(
      caches.match(req).then(hit => hit || fetch(req).then(res => {
        if (res && (res.ok || res.type === 'opaque')) { const copy = res.clone(); caches.open(VERSION).then(c => c.put(req, copy)); }
        return res;
      }))
    );
  }
  // বাকি সব (Cloud Sync ইত্যাদি) — সরাসরি network, cache নয়
});
