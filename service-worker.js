const VERSION='042';
const CACHE='promptdeck-v'+VERSION;
const ASSETS=['./','./?v=042','index.html','styles.css?v=042','app.js?v=042','manifest.webmanifest','data/taxonomy.js?v=042','data/product_scene.js?v=042','data/product_info.js?v=042','data/portrait.js?v=042','data/people_photo.js?v=042','icons/icon-192.png','icons/icon-512.png'];
self.addEventListener('install',event=>{event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(ASSETS)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',event=>{event.waitUntil((async()=>{
 const keys=await caches.keys();
 await Promise.all(keys.filter(key=>key.startsWith('promptdeck-')&&key!==CACHE).map(key=>caches.delete(key)));
 await self.clients.claim();
 // Migrate already open older clients: their JavaScript cannot reload itself.
 const clients=await self.clients.matchAll({type:'window',includeUncontrolled:true});
 const scope=new URL(self.registration.scope);
 await Promise.all(clients.map(async client=>{
  const url=new URL(client.url);
  if(url.origin!==scope.origin||!url.pathname.startsWith(scope.pathname)||url.pathname.endsWith('refresh.html'))return;
  if(url.searchParams.get('v')===VERSION)return;
  url.searchParams.set('v',VERSION);
  await client.navigate(url.href).catch(()=>{});
 }));
})())});
self.addEventListener('fetch',event=>{
 if(event.request.method!=='GET'||new URL(event.request.url).origin!==self.location.origin)return;
 event.respondWith((async()=>{
  const cache=await caches.open(CACHE);
  try{
   const response=await fetch(event.request,{cache:'no-cache'});
   if(response.ok)await cache.put(event.request,response.clone());
   return response;
  }catch(error){
   const cached=await cache.match(event.request);
   if(cached)return cached;
   if(event.request.mode==='navigate'){const fallback=await cache.match('./');if(fallback)return fallback}
   return Response.error();
  }
 })());
});
