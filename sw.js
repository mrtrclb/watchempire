const CACHE = 'watch-empire-v58';
const ASSETS = ['/','/index.html','/ambient.mp3','/ambient-2.mp3','/ambient-3.mp3','https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400&family=DM+Sans:wght@300;400;500&family=DM+Mono:wght@400;500&display=swap'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  // Firebase ve dış API isteklerini hiç müdahale etme — direkt ağa bırak
  if (url.hostname.includes('firebasedatabase.app') ||
      url.hostname.includes('firebaseio.com') ||
      url.hostname.includes('googleapis.com') ||
      url.hostname.includes('gstatic.com')) {
    return;
  }
  const isAsset = /\.(mp3|mp4|png|jpg|jpeg|svg|gif|webp|woff2|woff|ttf|ico)$/i.test(url.pathname);
  const isHTML = e.request.headers.get('accept')?.includes('text/html');
  e.respondWith(caches.match(e.request).then(cached => {
    if (cached) return cached;
    return fetch(e.request).then(res => {
      if (!res || res.status !== 200 || res.type === 'opaque') return res;
      const resClone = res.clone();
      caches.open(CACHE).then(c => c.put(e.request, resClone));
      return res;
    }).catch(() => {
      if (isAsset) return new Response('', { status: 204 });
      if (isHTML) return caches.match('/index.html');
      return new Response('', { status: 503 });
    });
  }));
});
