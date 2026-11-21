const CACHE = 'riyad-v6';
const FILES = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png', './icon-maskable.png'];
self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(FILES)).then(() => self.skipWaiting()));
});
// both apps share the github.io address: clear only this app's own old caches
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k.startsWith('riyad-') && k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
// network first (so updates show up when online); offline, look only in this app's own cache
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  const net = new Promise((res, rej) => { const t = setTimeout(() => rej(new Error('slow')), 3000); fetch(e.request).then((r) => { clearTimeout(t); res(r); }, rej); });
  e.respondWith(
    net.then((r) => {
      if (r && r.ok && new URL(e.request.url).origin === location.origin) {
        const copy = r.clone(); caches.open(CACHE).then((c) => c.put(e.request, copy));
      }
      return r;
    }).catch(() => caches.open(CACHE).then((c) => c.match(e.request, { ignoreSearch: true }).then((m) => m || c.match('./index.html'))))
  );
});
