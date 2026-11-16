import { requireAuth, authError, validateNewPassword, setPassword, publicUser, issueSession } from './_shared/auth.mjs';
function json(data,status=200,headers={}){return new Response(JSON.stringify(data),{status,headers:{'content-type':'application/json; charset=utf-8','cache-control':'no-store',...headers}})}
export default async(req)=>{
  if(req.method!=='POST')return json({error:'Método não permitido.'},405);
  const auth=await requireAuth(req);if(!auth.ok)return authError(auth);
  let body;try{body=await req.json()}catch{return json({error:'JSON inválido.'},400)}
  const password=String(body?.password||''),error=validateNewPassword(password);if(error)return json({error},400);
  const user=await setPassword(auth.user.matricula,password);if(!user)return json({error:'Usuário não encontrado.'},404);
  const cookie=await issueSession(user,req);
  return json({ok:true,user:publicUser(user)},200,{'set-cookie':cookie});
};
