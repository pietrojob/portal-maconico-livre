import { getUsers, verifyPassword, publicUser, issueSession } from './_shared/auth.mjs';
function json(data,status=200,headers={}){return new Response(JSON.stringify(data),{status,headers:{'content-type':'application/json; charset=utf-8','cache-control':'no-store',...headers}})}
export default async(req)=>{
  if(req.method!=='POST')return json({error:'Método não permitido.'},405,{allow:'POST'});
  let body;try{body=await req.json()}catch{return json({error:'JSON inválido.'},400)}
  const matricula=String(body?.matricula||'').trim(),password=String(body?.password||'');
  const users=await getUsers();const user=users.find(u=>u.matricula===matricula&&u.active);
  if(!user||!verifyPassword(password,user))return json({error:'Matrícula ou senha inválida.'},401);
  const cookie=await issueSession(user,req);
  return json({ok:true,user:publicUser(user)},200,{'set-cookie':cookie});
};
