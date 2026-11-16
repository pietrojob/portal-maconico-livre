import { getStore } from '../storage.mjs';
import { requireAuth, authError, canAdmin, canAccessDegree } from './_shared/auth.mjs';
function json(data,status=200){return new Response(JSON.stringify(data),{status,headers:{'content-type':'application/json; charset=utf-8','cache-control':'private, no-store'}})}
export default async(req)=>{
  const auth=await requireAuth(req,{requirePasswordChanged:true});if(!auth.ok)return authError(auth);
  const store=getStore({name:'portal-maconico-library-data',consistency:'strong'}),key='library/documents.json';
  if(req.method==='GET'){
    const docs=await store.get(key,{type:'json',consistency:'strong'});const rows=Array.isArray(docs)?docs:null;
    if(!rows)return json({docs:null});
    return json({docs:canAdmin(auth.user)?rows:rows.filter(d=>canAccessDegree(auth.user,d.degree))});
  }
  if(req.method==='PUT'){
    if(!canAdmin(auth.user))return json({error:'Apenas a administração pode alterar o acervo.'},403);
    let payload;try{payload=await req.json()}catch{return json({error:'JSON inválido.'},400)}
    if(!Array.isArray(payload?.docs))return json({error:'Estrutura do acervo inválida.'},400);if(payload.docs.length>2000)return json({error:'Quantidade de registros acima do limite previsto.'},413);
    const sanitized=payload.docs.map(d=>({...d,fileName:d.fileName?String(d.fileName).slice(0,240):null,fileType:d.fileType?String(d.fileType).slice(0,120):null,fileSize:Math.max(0,Number(d.fileSize)||0),storageKey:d.storageKey?String(d.storageKey).replace(/[^A-Za-z0-9._-]+/g,'-').slice(0,180):null,chunkCount:Math.max(0,Math.min(16,Number(d.chunkCount)||0))}));
    await store.setJSON(key,sanitized,{metadata:{updatedAt:new Date().toISOString(),count:sanitized.length,updatedBy:auth.user.matricula}});return json({ok:true,count:sanitized.length});
  }
  return json({error:'Método não permitido.'},405);
};
