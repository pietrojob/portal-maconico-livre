import { getStore } from '../storage.mjs';
import { requireAuth, authError, canManageAttendance, getUsers } from './_shared/auth.mjs';

const STORE_NAME='portal-maconico-attendance';
const KEY='attendance/records.json';
const DEGREE_RANK={aprendiz:1,companheiro:2,mestre:3};

function json(data,status=200){return new Response(JSON.stringify(data),{status,headers:{'content-type':'application/json; charset=utf-8','cache-control':'no-store'}})}
function text(v,max=220){return String(v??'').trim().slice(0,max)}
function normalizeStored(rows){return (Array.isArray(rows)?rows:[]).map(r=>({
  sessionId:Number(r.sessionId)||0,
  sessionTitle:text(r.sessionTitle,180),
  sessionDate:text(r.sessionDate,10),
  sessionDegree:DEGREE_RANK[r.sessionDegree]?r.sessionDegree:'aprendiz',
  eligibleMembers:Array.isArray(r.eligibleMembers)?r.eligibleMembers.map(m=>({memberId:Number(m.memberId)||0,matricula:text(m.matricula,30),name:text(m.name,180),degree:DEGREE_RANK[m.degree]?m.degree:'aprendiz',installedMaster:Boolean(m.installedMaster)})).filter(m=>m.matricula):[],
  presentMatriculas:[...new Set((Array.isArray(r.presentMatriculas)?r.presentMatriculas:[]).map(x=>text(x,30)).filter(Boolean))],
  finalized:Boolean(r.finalized),
  createdAt:r.createdAt||new Date().toISOString(),createdBy:text(r.createdBy,180)||'Sistema',
  updatedAt:r.updatedAt||new Date().toISOString(),updatedBy:text(r.updatedBy,180)||'Sistema',
  finalizedAt:r.finalizedAt||null,finalizedBy:text(r.finalizedBy,180),
})).filter(r=>r.sessionId&&r.sessionDate)}

export default async(req)=>{
  const auth=await requireAuth(req,{requirePasswordChanged:true});if(!auth.ok)return authError(auth);
  const s=getStore({name:STORE_NAME,consistency:'strong'});
  const current=normalizeStored(await s.get(KEY,{type:'json',consistency:'strong'}));
  const manager=canManageAttendance(auth.user);

  if(req.method==='GET'){
    if(manager){const users=(await getUsers()).map(u=>({memberId:u.memberId,matricula:u.matricula,name:u.name,active:u.active,degree:u.degree,installedMaster:Boolean(u.installedMaster)}));return json({manager:true,records:current,users});}
    const matricula=String(auth.user.matricula);
    const records=current.filter(r=>r.finalized&&r.eligibleMembers.some(m=>m.matricula===matricula)).map(r=>({
      sessionId:r.sessionId,sessionTitle:r.sessionTitle,sessionDate:r.sessionDate,sessionDegree:r.sessionDegree,finalized:true,
      present:r.presentMatriculas.includes(matricula),finalizedAt:r.finalizedAt,
    }));
    return json({manager:false,records});
  }

  if(!manager)return json({error:'Somente Chanceler, Secretário, Venerável Mestre e Administradores podem alterar a frequência.'},403);

  if(req.method==='PUT'){
    let body={};try{body=await req.json()}catch{return json({error:'JSON inválido.'},400)}
    const sessionId=Number(body.sessionId)||0;if(!sessionId)return json({error:'Sessão inválida.'},400);
    const socialStore=getStore({name:'portal-maconico-social-data',consistency:'strong'}),posts=await socialStore.get('social/posts.json',{type:'json',consistency:'strong'}),sessionPost=(Array.isArray(posts)?posts:[]).find(p=>Number(p.id)===sessionId&&p.type==='sessao');
    if(!sessionPost)return json({error:'A sessão não foi encontrada na agenda da Loja.'},404);
    const sessionDate=text(sessionPost.eventDate,10),sessionTitle=text(sessionPost.title,180),sessionDegree=DEGREE_RANK[sessionPost.sessionDegree]?sessionPost.sessionDegree:null;
    if(!sessionDate||!sessionTitle||!sessionDegree)return json({error:'A sessão precisa ter data e grau definidos antes da chamada.'},400);
    const users=(await getUsers()).filter(u=>u.active&&DEGREE_RANK[u.degree]>=DEGREE_RANK[sessionDegree]);
    const eligibleMembers=users.map(u=>({memberId:u.memberId,matricula:u.matricula,name:u.name,degree:u.degree,installedMaster:Boolean(u.installedMaster)}));
    const eligibleSet=new Set(eligibleMembers.map(m=>m.matricula));
    const presentMatriculas=[...new Set((Array.isArray(body.presentMatriculas)?body.presentMatriculas:[]).map(x=>text(x,30)).filter(x=>eligibleSet.has(x)))];
    const now=new Date().toISOString(),idx=current.findIndex(r=>r.sessionId===sessionId),previous=idx>=0?current[idx]:null,finalized=Boolean(body.finalized);
    const record={sessionId,sessionTitle,sessionDate,sessionDegree,eligibleMembers,presentMatriculas,finalized,createdAt:previous?.createdAt||now,createdBy:previous?.createdBy||auth.user.name,updatedAt:now,updatedBy:auth.user.name,finalizedAt:finalized?(previous?.finalized&&previous.finalizedAt?previous.finalizedAt:now):null,finalizedBy:finalized?(previous?.finalized&&previous.finalizedBy?previous.finalizedBy:auth.user.name):''};
    if(idx>=0)current[idx]=record;else current.push(record);
    current.sort((a,b)=>b.sessionDate.localeCompare(a.sessionDate));
    await s.setJSON(KEY,current,{metadata:{updatedAt:now,count:current.length}});
    return json({ok:true,record});
  }

  if(req.method==='DELETE'){
    const u=new URL(req.url),sessionId=Number(u.searchParams.get('sessionId'))||0;if(!sessionId)return json({error:'Sessão inválida.'},400);
    const next=current.filter(r=>r.sessionId!==sessionId);await s.setJSON(KEY,next,{metadata:{updatedAt:new Date().toISOString(),count:next.length}});return json({ok:true});
  }
  return json({error:'Método não permitido.'},405);
};
