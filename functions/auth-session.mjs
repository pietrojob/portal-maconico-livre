import { requireAuth, authError, publicUser } from './_shared/auth.mjs';
function json(data,status=200){return new Response(JSON.stringify(data),{status,headers:{'content-type':'application/json; charset=utf-8','cache-control':'no-store'}})}
export default async(req)=>{
  if(req.method!=='GET')return json({error:'Método não permitido.'},405);
  const auth=await requireAuth(req);if(!auth.ok)return authError(auth);
  return json({ok:true,user:publicUser(auth.user)});
};
