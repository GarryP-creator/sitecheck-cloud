/* SiteCheck Cloud — service worker.
   Keeps the app itself on the device so it opens with no signal. Requests to
   Supabase are never cached: stale project data would be worse than none. */
const VERSION = 'sitecheck-cloud-v16';
const SHELL = [
  './', './index.html', './db.js', './cloud.js', './pdf.js', './xlsx.js',
  './talks.js', './activities.js', './methods.js', './forms.js',
  './lib/jspdf.umd.min.js', './lib/supabase.js', './lib/qrcode.js',
  './manifest.webmanifest',
  './icons/icon-180.png', './icons/icon-192.png',
  './icons/icon-512.png', './icons/favicon.svg'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  // anything going to Supabase goes straight to the network, always
  if (url.hostname.endsWith('supabase.co')) return;

  const sameOrigin = url.origin === self.location.origin;

  // The public induction page is left entirely alone. It is a navigation to
  // this same origin, so without this it would be treated as the app: cached
  // under './index.html', which would replace the app with the induction page
  // for anyone who happened to open a link on their own phone. A visitor's
  // one-time link must reach the network anyway — a cached copy of it is never
  // the right answer.
  if (sameOrigin && url.pathname.endsWith('induct.html')) return;
  const isAppCode = sameOrigin &&
    (req.mode === 'navigate' || (/\.js$/.test(url.pathname) && !url.pathname.includes('/lib/')));

  if (isAppCode){
    e.respondWith(
      fetch(req)
        .then(res => {
          const copy = res.clone();
          caches.open(VERSION).then(c => c.put(req.mode === 'navigate' ? './index.html' : req, copy));
          return res;
        })
        .catch(() => caches.match(req).then(hit => hit ||
          (req.mode === 'navigate'
            ? caches.match('./index.html').then(r => r || caches.match('./'))
            : undefined)))
    );
    return;
  }

  e.respondWith(
    caches.match(req).then(hit => hit || fetch(req).then(res => {
      const copy = res.clone();
      caches.open(VERSION).then(c => c.put(req, copy));
      return res;
    }))
  );
});
