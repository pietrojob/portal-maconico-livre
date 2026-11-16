const CACHE='portalMaconico-v32-2-10';
const STATIC=[
  '/', '/?pwa=1', '/index.html', '/styles.css', '/app.js', '/manifest.webmanifest',
];
self.addEventListener('install',event=>{
  event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(STATIC)).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',event=>{
  event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch',event=>{
  const req=event.request;
  if(req.method!=='GET')return;
  const url=new URL(req.url);
  if(url.origin!==self.location.origin)return;
  if(url.pathname.startsWith('/api/')){event.respondWith(fetch(req));return;}
  event.respondWith(
    fetch(req,{cache:'no-store'}).then(res=>{
      if(res.ok){const clone=res.clone();caches.open(CACHE).then(cache=>cache.put(req,clone));}
      return res;
    }).catch(()=>caches.match(req).then(cached=>cached||caches.match('/index.html')))
  );
});
