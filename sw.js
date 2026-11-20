const CACHE = 'riyad-studio-v1';
const FILES = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png', './icon-maskable.png'];
self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k.startsWith('riyad-studio-') && k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
// network first (so updates show up when online), cache when offline
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  const net = new Promise((res, rej) => { const t = setTimeout(() => rej(new Error('slow')), 3000); fetch(e.request).then((r) => { clearTimeout(t); res(r); }, rej); });
  e.respondWith(
    net.then((r) => {
      if (r && r.ok && new URL(e.request.url).origin === location.origin) {
        const copy = r.clone(); caches.open(CACHE).then((c) => c.put(e.request, copy));
      }
      return r;
    }).catch(() => caches.match(e.request, { ignoreSearch: true }).then((m) => m || caches.match('./index.html')))
  );
});
