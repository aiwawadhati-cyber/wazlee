/* Wazlee PWA service worker — app shell luar talian + cache masa jalan */
const V = 'wz-__BUILD__';
const SHELL = __SHELL__;
self.addEventListener('install', e => {
  e.waitUntil(caches.open(V).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== V && k !== 'wz-rt').map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const r = e.request; if (r.method !== 'GET') return;
  const u = new URL(r.url);
  if (u.origin === location.origin) {
    // fail app: cache dahulu, kemudian rangkaian (simpan surah/bunyi yang dibuka)
    e.respondWith(caches.match(r, { ignoreSearch: true }).then(hit => hit || fetch(r).then(res => {
      if (res.ok) { const cp = res.clone(); caches.open(V).then(c => c.put(r, cp)); }
      return res;
    }).catch(() => r.mode === 'navigate' ? caches.match('index.html') : Response.error())));
    return;
  }
  // jubin peta & fon: cache masa jalan (terhad)
  if (/tiles\.openfreemap\.org|tile\.openstreetmap\.org|fonts\.(googleapis|gstatic)\.com/.test(u.host)) {
    e.respondWith(caches.open('wz-rt').then(c => c.match(r).then(hit => hit || fetch(r).then(res => { if (res.ok || res.type === 'opaque') c.put(r, res.clone()); return res; }))));
  }
});
