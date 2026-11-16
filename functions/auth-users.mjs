import { requireAuth, authError, publicUser, getUsers, updateUser, createUser, resetPassword } from './_shared/auth.mjs';
function json(data,status=200){return new Response(JSON.stringify(data),{status,headers:{'content-type':'application/json; charset=utf-8','cache-control':'no-store'}})}
function adminUser(u){return {...publicUser(u),phone:u.phone,active:u.active,portalAdmin:Boolean(u.portalAdmin),installedMaster:Boolean(u.installedMaster)}}
export default async(req)=>{
  const auth=await requireAuth(req,{admin:true,requirePasswordChanged:true});if(!auth.ok)return authError(auth);
  if(req.method==='GET')return json({users:(await getUsers()).map(adminUser)});
  if(req.method==='POST'){
    let body;try{body=await req.json()}catch{return json({error:'JSON inválido.'},400)}
    try{const user=await createUser(body?.user||body||{});return json({ok:true,user:adminUser(user),temporaryPassword:user.temporaryPassword},201)}catch(err){return json({error:err.message||'Não foi possível criar o usuário.'},400)}
  }
  if(req.method==='PUT'){
    let body;try{body=await req.json()}catch{return json({error:'JSON inválido.'},400)}
    const matricula=String(body?.matricula||'').trim();if(!matricula)return json({error:'Matrícula obrigatória.'},400);
    if(body?.resetPassword){const user=await resetPassword(matricula);return user?json({ok:true,user:adminUser(user),temporaryPassword:user.temporaryPassword}):json({error:'Usuário não encontrado.'},404)}
    const user=await updateUser(matricula,body?.patch||{},auth.user.matricula);return user?json({ok:true,user:adminUser(user),temporaryPassword:user.temporaryPassword}):json({error:'Usuário não encontrado.'},404);
  }
  return json({error:'Método não permitido.'},405);
};
