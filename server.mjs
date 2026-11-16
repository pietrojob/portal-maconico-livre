import { createServer } from 'node:http';
import { readFile,stat } from 'node:fs/promises';
import { resolve,extname,sep } from 'node:path';
import { fileURLToPath } from 'node:url';
const root=fileURLToPath(new URL('./public/',import.meta.url));
const routeNames=['attendance-data','auth-change-password','auth-login','auth-logout','auth-session','auth-users','finance-data','finance-file','library-data','library-file','management-data','social-image','social-images','social-posts'];
const handlers=new Map(await Promise.all(routeNames.map(async name=>[name,(await import('./functions/'+name+'.mjs')).default])));
const allowedHosts=new Set((process.env.PORTAL_HOSTS||'').split(',').map(s=>s.trim()).filter(Boolean));
const local=process.env.PORTAL_LOCAL==='1';
if(!allowedHosts.size&&!local)throw Error('Configure PORTAL_HOSTS before starting.');
let queue=Promise.resolve(),pending=0,active=0;
const attempts=new Map();
const json=(value,status=200)=>new Response(JSON.stringify(value),{status,headers:{'content-type':'application/json; charset=utf-8','cache-control':'no-store'}});
async function invoke(request,name){
  if(name==='auth-login'){
    const data=await request.clone().json().catch(()=>({}));const account=String(data.matricula||'').slice(0,32);
    const now=Date.now();for(const [k,v] of attempts)if(now-v.time>300000)attempts.delete(k);
    const prior=attempts.get(account)||{count:0,time:now};
    if(prior.count>=8)return json({error:'Muitas tentativas. Aguarde cinco minutos.'},429);
    if(String(data.password||'').length>200)return json({error:'Credenciais inválidas.'},400);
    const response=await handlers.get(name)(request);
    if(response.status===200)attempts.delete(account);else{prior.count++;attempts.set(account,prior);if(attempts.size>2000)attempts.delete(attempts.keys().next().value);}
    return response;
  }
  return handlers.get(name)(request);
}
async function route(req){
  const host=String(req.headers.host||'').toLowerCase();
  if(!allowedHosts.has(host)&&!(local&&/^127\.0\.0\.1:\d+$/.test(host)))return json({error:'Hostname não autorizado.'},403);
  const origin=(local&&host.startsWith('127.0.0.1:')?'http://':'https://')+host;
  if(!['GET','HEAD'].includes(req.method)&&req.headers.origin!==origin)return json({error:'Origem não autorizada.'},403);
  if(!['GET','HEAD','POST','PUT','DELETE'].includes(req.method))return json({error:'Método não permitido.'},405);
  let pathname;const url=new URL(req.url,origin);
  try{pathname=decodeURIComponent(url.pathname);}catch{return json({error:'Caminho inválido.'},400);}
  if(pathname==='/health')return json({ok:true,version:'portal-maconico-livre-0.2',ai:false});
  let name=pathname.startsWith('/api/')?pathname.slice(5):pathname.startsWith('/.netlify/functions/')?pathname.slice(20):null;
  if(pathname.startsWith('/imagens-social/')){name='social-image';url.searchParams.set('file',pathname.split('/').pop());}
  if(name!==null){
    if(!handlers.has(name))return json({error:name==='ai-reconcile'?'IA desativada nesta instalação.':'Rota não encontrada.'},404);
    if(pending>=16)return json({error:'Servidor ocupado. Tente novamente.'},503);
    const declared=Number(req.headers['content-length']||0);if(!Number.isFinite(declared)||declared>8*1024*1024)return json({error:'Envio acima do limite.'},413);
    const chunks=[];let size=0;for await(const chunk of req){size+=chunk.length;if(size>8*1024*1024)return json({error:'Envio acima do limite.'},413);chunks.push(chunk);}
    const request=new Request(url,{method:req.method,headers:new Headers(Object.entries(req.headers).filter(([k,v])=>typeof v==='string')),body:['GET','HEAD'].includes(req.method)?undefined:Buffer.concat(chunks)});
    // Serialize the application's read/modify/write operations in this single instance.
    pending++;const work=queue.then(()=>invoke(request,name));queue=work.catch(()=>{});
    try{return await work;}finally{pending--;}
  }
  if(!['GET','HEAD'].includes(req.method))return json({error:'Rota não encontrada.'},404);
  if(pathname.includes('\\')||pathname.includes('\0')||pathname.split('/').some(p=>p.startsWith('.')))return json({error:'Caminho inválido.'},404);
  let file=resolve(root,'.'+pathname);if(file!==resolve(root)&&!file.startsWith(resolve(root)+sep))return json({error:'Caminho inválido.'},404);
  try{if((await stat(file)).isDirectory())file=resolve(file,'index.html');}catch{if(!extname(file))file=resolve(root,'index.html');}
  const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.png':'image/png','.jpg':'image/jpeg','.svg':'image/svg+xml','.webmanifest':'application/manifest+json'};
  try{return new Response(req.method==='HEAD'?null:await readFile(file),{headers:{'content-type':types[extname(file)]||'application/octet-stream','cache-control':'no-store'}});}catch{return json({error:'Não encontrado.'},404);}
}
export const server=createServer(async(req,res)=>{
  if(active>=24){res.writeHead(503);res.end();return;}active++;
  try{
    const response=await route(req);
    res.statusCode=response.status;
    for(const [name,value] of response.headers)if(name!=='set-cookie')res.setHeader(name,value);
    if(response.headers.getSetCookie().length)res.setHeader('set-cookie',response.headers.getSetCookie());
    res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('X-Frame-Options','DENY');res.setHeader('Referrer-Policy','same-origin');
    // Existing portal uses inline event handlers; CSP intentionally preserves them here only.
    res.setHeader('Content-Security-Policy',"default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: blob:; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'");
    if(req.method==='HEAD'){res.end();return;}
    res.end(Buffer.from(await response.arrayBuffer()));
  }catch(e){console.error('Request failed:',e.name);if(!res.headersSent){res.writeHead(500,{'content-type':'application/json'});res.end(JSON.stringify({error:'Não foi possível concluir a operação.'}));}else res.destroy();}
  finally{active--;}
});
server.requestTimeout=30000;server.headersTimeout=15000;server.keepAliveTimeout=5000;server.maxConnections=48;
if(process.argv[1]===fileURLToPath(import.meta.url))server.listen(Number(process.env.PORT||8080),local?'127.0.0.1':'0.0.0.0',()=>console.log('Portal Maçônico backend listening; AI disabled.'));
