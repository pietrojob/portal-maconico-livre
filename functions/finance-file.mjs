import { getStore } from '../storage.mjs';
import { requireAuth, authError } from './_shared/auth.mjs';

const MAX_FILE_SIZE = 20 * 1024 * 1024;
const MAX_CHUNK_SIZE = 4.5 * 1024 * 1024;
const MAX_CHUNKS = 8;
const ALLOWED = new Set(['application/pdf','image/jpeg','image/png','image/webp','application/octet-stream']);

function json(data, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' } });
}
function safeKey(value = '') { return String(value).replace(/[^A-Za-z0-9._-]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 180); }
function safeFileName(value = '') { let decoded=value; try{decoded=decodeURIComponent(value||'')}catch{} const only=decoded.replace(/\\/g,'/').split('/').pop()||'comprovante'; return only.replace(/[\u0000-\u001f\u007f]/g,'').slice(0,220)||'comprovante'; }
function partKey(key,index){return `finance-files/${key}/part-${String(index).padStart(3,'0')}`}

export default async (req) => {
  const auth=await requireAuth(req,{requirePasswordChanged:true,financeView:true});if(!auth.ok)return authError(auth);
  if(['POST','DELETE'].includes(req.method)){const manage=await requireAuth(req,{requirePasswordChanged:true,financeManage:true});if(!manage.ok)return authError(manage);}
  const store=getStore({name:'portal-maconico-finance-files',consistency:'strong'});
  const url=new URL(req.url);
  if(req.method==='POST'){
    const key=safeKey(req.headers.get('x-storage-key')||'');
    const index=Number(req.headers.get('x-chunk-index')),count=Number(req.headers.get('x-chunk-count')),totalSize=Number(req.headers.get('x-file-size'));
    const fileName=safeFileName(req.headers.get('x-file-name')||'comprovante');
    const fileType=(req.headers.get('x-file-type')||'application/octet-stream').slice(0,120);
    if(!key)return json({error:'Chave inválida.'},400);
    if(!ALLOWED.has(fileType))return json({error:'Formato de comprovante não permitido.'},400);
    if(!Number.isInteger(index)||!Number.isInteger(count)||index<0||count<1||index>=count||count>MAX_CHUNKS)return json({error:'Fragmentação inválida.'},400);
    if(!Number.isFinite(totalSize)||totalSize<1||totalSize>MAX_FILE_SIZE)return json({error:'O comprovante deve ter no máximo 20 MB.'},413);
    const blob=await req.blob(); if(!blob.size)return json({error:'Parte vazia.'},400); if(blob.size>MAX_CHUNK_SIZE)return json({error:'Parte acima do limite.'},413);
    await store.set(partKey(key,index),blob,{metadata:{index,count,totalSize,fileName,fileType,uploadedAt:new Date().toISOString()}});
    if(index===count-1)await store.setJSON(`finance-files/${key}/manifest.json`,{key,fileName,fileType,totalSize,chunkCount:count,uploadedAt:new Date().toISOString()});
    return json({ok:true,index,count},201);
  }
  if(req.method==='GET'){
    const key=safeKey(url.searchParams.get('key')||''),index=Number(url.searchParams.get('chunk'));
    if(!key||!Number.isInteger(index)||index<0||index>=MAX_CHUNKS)return new Response('Parâmetros inválidos',{status:400});
    const entry=await store.getWithMetadata(partKey(key,index),{type:'blob'}); if(!entry?.data)return new Response('Parte não encontrada',{status:404});
    return new Response(entry.data,{status:200,headers:{'content-type':'application/octet-stream','cache-control':'private, no-store','x-content-type-options':'nosniff'}});
  }
  if(req.method==='DELETE'){
    const key=safeKey(url.searchParams.get('key')||''); if(!key)return json({error:'Chave inválida.'},400);
    const manifest=await store.get(`finance-files/${key}/manifest.json`,{type:'json',consistency:'strong'}); const count=Math.min(Number(manifest?.chunkCount)||MAX_CHUNKS,MAX_CHUNKS);
    await Promise.all(Array.from({length:count},(_,i)=>store.delete(partKey(key,i)))); await store.delete(`finance-files/${key}/manifest.json`); return json({ok:true});
  }
  return json({error:'Método não permitido.'},405);
};
