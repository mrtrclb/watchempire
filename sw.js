const CACHE = 'watch-empire-v62';
const ASSETS = ['/','/index.html','/ambient.mp3','/ambient-2.mp3','/ambient-3.mp3','/assets/designers/hiroshi-tanaka.webp','/assets/designers/cleo-marchand.webp','/assets/designers/marcus-webb.webp','/assets/designers/zeynep-arslan.webp','/assets/designers/alex-park.webp','/assets/designers/ivan-petrov.webp','/assets/designers/priya-sharma.webp','/assets/designers/luca-ferretti.webp','/assets/designers/yuki-sato.webp','/assets/designers/carlos-mendez.webp','/assets/designers/sofia-chen.webp','/assets/designers/amara-osei.webp','/assets/designers/felix-muller.webp','/assets/designers/mia-johansson.webp','/assets/designers/rashid-al-farsi.webp','/assets/reviewers/hakan-demir.webp','/assets/reviewers/sofia-rossi.webp','/assets/reviewers/james-wei.webp','/assets/reviewers/leyla-kahraman.webp','/assets/reviewers/graf-von-steiner.webp','/assets/reviewers/kenji-tanaka.webp','/assets/reviewers/mira-santos.webp','/assets/reviewers/pavel-novak.webp','/assets/reviewers/amara-diallo.webp','/assets/reviewers/chen-jing.webp','/assets/reviewers/fatima-al-hassan.webp','/assets/reviewers/marco-bianchi.webp','/assets/reviewers/yuki-tanabe.webp','/assets/reviewers/elena-popescu.webp','/assets/reviewers/dimitri-volkov.webp','/assets/reviewers/nadia-okonkwo.webp','/assets/reviewers/lars-eriksson.webp','/assets/reviewers/priya-sharma.webp','/assets/reviewers/carlos-mendez.webp','/assets/reviewers/aigerim-bekova.webp','/assets/publications/techpulse.webp','/assets/publications/watchforumtr.webp','/assets/publications/retailweekly.webp','/assets/publications/chrono-magazine.webp','/assets/publications/horoblog.webp','/assets/publications/wristcheck.webp','/assets/publications/luxehora.webp','/assets/publications/smartweartoday.webp','/assets/publications/timekeeperweekly.webp','/assets/publications/the-dial-review.webp','https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400&family=DM+Sans:wght@300;400;500&family=DM+Mono:wght@400;500&display=swap'];
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
