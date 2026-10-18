const VERSION='043';
const CACHE='promptdeck-v'+VERSION;
const ASSETS=['./','./?v=043','index.html','styles.css?v=043','app.js?v=043','manifest.webmanifest','data/taxonomy.js?v=043','data/product_scene.js?v=043','data/product_info.js?v=043','data/portrait.js?v=043','data/people_photo.js?v=043','icons/icon-192.png','icons/icon-512.png'];
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
