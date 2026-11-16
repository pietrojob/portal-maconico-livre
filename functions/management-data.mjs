import { getStore } from '../storage.mjs';
import { requireAuth, authError } from './_shared/auth.mjs';

const STORE='portal-maconico-management';
const KEY='management/data.json';
const seedTemplates=[
  {id:'iniciacao',name:'Iniciação',system:true,items:[]},
  {id:'elevacao',name:'Elevação',system:true,items:[]},
  {id:'exaltacao',name:'Exaltação',system:true,items:[]},
  {id:'outros',name:'Outros / Livre',system:true,items:[]},
];
function json(data,status=200){return new Response(JSON.stringify(data),{status,headers:{'content-type':'application/json; charset=utf-8','cache-control':'no-store'}})}
function text(v,max=240){return String(v??'').trim().slice(0,max)}
function now(){return new Date().toISOString()}
function normalize(input={}){
  const rawTemplates=Array.isArray(input.templates)?input.templates:[];
  const templates=rawTemplates.map(t=>({id:text(t.id,80)||`tpl-${Date.now()}`,name:text(t.name,120)||'Checklist',system:Boolean(t.system),items:(Array.isArray(t.items)?t.items:[]).map(i=>text(typeof i==='string'?i:i?.text,240)).filter(Boolean).slice(0,100),createdAt:t.createdAt||now(),createdBy:text(t.createdBy,180)||'Sistema',updatedAt:t.updatedAt||now(),updatedBy:text(t.updatedBy,180)||text(t.createdBy,180)||'Sistema'}));
  for(const s of seedTemplates){if(!templates.some(t=>t.id===s.id))templates.push({...s,createdAt:now(),createdBy:'Sistema',updatedAt:now(),updatedBy:'Sistema'})}
  const runs=(Array.isArray(input.runs)?input.runs:[]).map(r=>({id:Number(r.id)||Date.now(),templateId:text(r.templateId,80),templateName:text(r.templateName,120)||'Checklist',memberId:Number(r.memberId)||0,memberName:text(r.memberName,180),plannedDate:text(r.plannedDate,10),responsible:text(r.responsible,120),notes:text(r.notes,2000),items:(Array.isArray(r.items)?r.items:[]).map((i,idx)=>({id:text(i?.id,100)||`item-${idx+1}`,text:text(i?.text??i,240),done:Boolean(i?.done),updatedAt:i?.updatedAt||null,updatedBy:text(i?.updatedBy,180)})).filter(i=>i.text).slice(0,200),createdAt:r.createdAt||now(),createdBy:text(r.createdBy,180)||'Sistema',updatedAt:r.updatedAt||now(),updatedBy:text(r.updatedBy,180)||text(r.createdBy,180)||'Sistema'})).filter(r=>r.id&&r.memberId);
  const suppliers=(Array.isArray(input.suppliers)?input.suppliers:[]).map(s=>({id:Number(s.id)||Date.now(),legalName:text(s.legalName,180),tradeName:text(s.tradeName,180),contactPerson:text(s.contactPerson,140),phone:text(s.phone,80),email:text(s.email,180),category:text(s.category,120),status:s.status==='inativo'?'inativo':'ativo',notes:text(s.notes,2000),createdAt:s.createdAt||now(),createdBy:text(s.createdBy,180)||'Sistema',updatedAt:s.updatedAt||now(),updatedBy:text(s.updatedBy,180)||text(s.createdBy,180)||'Sistema'})).filter(s=>s.id&&s.legalName);
  return {templates,runs,suppliers};
}
export default async(req)=>{
  const auth=await requireAuth(req,{requirePasswordChanged:true,admin:true});if(!auth.ok)return authError(auth);
  const store=getStore({name:STORE,consistency:'strong'});
  if(req.method==='GET'){
    let data=await store.get(KEY,{type:'json',consistency:'strong'});data=normalize(data||{});
    if(!data.templates.length) data=normalize({});
    return json({data});
  }
  if(req.method==='PUT'){
    let body={};try{body=await req.json()}catch{return json({error:'JSON inválido.'},400)}
    const data=normalize(body.data||body);await store.setJSON(KEY,data,{metadata:{updatedAt:now(),updatedBy:auth.user.name,templates:data.templates.length,runs:data.runs.length,suppliers:data.suppliers.length}});return json({ok:true,data});
  }
  return json({error:'Método não permitido.'},405);
};
