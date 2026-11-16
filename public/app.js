
const isInstalledApp = window.matchMedia?.('(display-mode: standalone)').matches || window.navigator.standalone === true || new URLSearchParams(window.location.search).get('pwa') === '1';
if(isInstalledApp) document.body.classList.add('pwa-standalone');
const degreeRank={aprendiz:1,companheiro:2,mestre:3};
const degreeLabel={aprendiz:'Aprendiz',companheiro:'Companheiro',mestre:'Mestre'};
const degreeAbbr={aprendiz:'A∴M∴',companheiro:'C∴M∴',mestre:'M∴M∴'};
const sessionDegreeLabel={aprendiz:'Aprendiz',companheiro:'Companheiro',mestre:'Mestre'};
const sessionDegreeAbbr={aprendiz:'A∴M∴',companheiro:'C∴M∴',mestre:'M∴M∴'};
function memberDegreeAbbr(member){return member?.degree==='mestre'&&member?.installedMaster?'M∴I∴':degreeAbbr[member?.degree]||'—'}
function memberDegreeLabel(member){return member?.degree==='mestre'&&member?.installedMaster?'Mestre Instalado':degreeLabel[member?.degree]||member?.degree||'—'}
const fullAccessOffices=new Set(['Venerável Mestre','Secretário','Administrador do portal']);
const masonicOfficeOptions=['Sem cargo','Venerável Mestre','1º Vigilante','2º Vigilante','Orador','Secretário','Tesoureiro','Arquiteto','Mestre de Harmonia','Mestre de Cerimônias','Hospitaleiro','Mestre de Banquetes','Chanceler','1º Diácono','2º Diácono','Cobridor','Porta-estandarte','Guarda do Templo','1º Experto','2º Experto','Porta-espada'];
const privilegedMasonicOffices=new Set(['Venerável Mestre','Secretário','Tesoureiro']);
const defaultMasonicOffices={};

const baseMembers=[];
let legacyMemberOfficeOverrides=JSON.parse(localStorage.getItem('portalMaconicoMemberOfficesV1')||'{}');
let masonicOfficeOverrides=JSON.parse(localStorage.getItem('portalMaconicoMasonicOfficesV1')||'{}');
let portalAdminOverrides=JSON.parse(localStorage.getItem('portalMaconicoPortalAdminsV1')||'{}');
let memberProfiles=JSON.parse(localStorage.getItem('portalMaconicoMemberProfilesV1')||'{}');
let addedMembers=JSON.parse(localStorage.getItem('portalMaconicoAddedMembersV1')||'[]');
if(!Array.isArray(addedMembers))addedMembers=[];
function initialsFromName(name){const parts=String(name||'').trim().split(/\s+/).filter(Boolean);return ((parts[0]?.[0]||'')+(parts.length>1?parts.at(-1)?.[0]||'':'')).toUpperCase()||'P70'}
function saveAddedMembers(){localStorage.setItem('portalMaconicoAddedMembersV1',JSON.stringify(addedMembers))}
const baseMatriculas=new Set(baseMembers.map(m=>String(m.matricula)));
const memberSeeds=[...baseMembers,...addedMembers.filter(m=>m&&m.matricula&&!baseMatriculas.has(String(m.matricula)))];
const members=memberSeeds.map(m=>{
  const p=memberProfiles[m.matricula]||{},matricula=String(m.matricula),name=p.name||m.name;
  const legacy=legacyMemberOfficeOverrides[matricula];
  const legacyCargo=masonicOfficeOptions.includes(legacy)&&legacy!=='Administrador do portal'&&legacy!=='Irmão'?legacy:'Sem cargo';
  const masonicOffice=masonicOfficeOverrides[matricula]||defaultMasonicOffices[matricula]||legacyCargo||'Sem cargo';
  const portalAdmin=typeof portalAdminOverrides[matricula]==='boolean'?portalAdminOverrides[matricula]:(legacy==='Administrador do portal'||m.defaultOffice==='Administrador do portal');
  const office=portalAdmin?'Administrador do portal':privilegedMasonicOffices.has(masonicOffice)?masonicOffice:'Irmão';
  return {...m,id:Number(m.id||m.matricula),matricula,name,phone:p.phone??m.phone,lodge:Number(p.lodge??m.lodge??70),active:typeof p.active==='boolean'?p.active:m.active!==false,degree:p.degree||m.degree||'aprendiz',installedMaster:Boolean(p.installedMaster??m.installedMaster),initials:initialsFromName(name),defaultOffice:m.defaultOffice||'Irmão',masonicOffice,portalAdmin,office};
});
const seedFinance=[];
const seedAudit=[];
const seedDuesConfig={2026:{year:2026,baseValue:180,dueDay:10,capitationValue:0,damValue:0,glmergsRateMode:'monthly',notes:'Mensalidade ordinária da Loja Modelo',updatedAt:'2026-08-19T12:00:00',updatedBy:'Sistema'}};
const seedLedger=[];
const seedBankTransactions=[];
const seedFinancialEvents=[];
const seedEventPayments=[];
const seedFinanceSettings={accountLabel:'Conta bancária Loja Modelo',openingBalances:{2026:0}};
const seedChartOfAccounts=[
  {id:1001,code:'1.01',name:'Mensalidades ordinárias',type:'receita',group:'Contribuições dos irmãos',description:'Mensalidades ordinárias previstas e recebidas dos irmãos.',active:true,system:true},
  {id:1002,code:'1.02',name:'Joias, taxas e emolumentos',type:'receita',group:'Contribuições dos irmãos',description:'Joias, taxas e emolumentos relacionados a atos e procedimentos maçônicos.',active:true},
  {id:1003,code:'1.03',name:'Doações e contribuições voluntárias',type:'receita',group:'Contribuições e doações',description:'Doações e contribuições voluntárias destinadas à Loja.',active:true},
  {id:1004,code:'1.04',name:'Eventos e confraternizações',type:'receita',group:'Eventos',description:'Receitas obtidas em eventos, jantares, confraternizações e atividades sociais.',active:true},
  {id:1005,code:'1.05',name:'Contribuições extraordinárias',type:'receita',group:'Contribuições dos irmãos',description:'Contribuições extraordinárias aprovadas ou arrecadadas pela Loja.',active:true},
  {id:1006,code:'1.06',name:'Rendimentos financeiros',type:'receita',group:'Financeiro',description:'Rendimentos de aplicações, remuneração bancária e receitas financeiras.',active:true},
  {id:1099,code:'1.99',name:'Outras receitas',type:'receita',group:'Outras receitas',description:'Receitas que não se enquadram nas contas anteriores.',active:true},
  {id:2001,code:'2.01',name:'Aluguel e ocupação',type:'despesa',group:'Estrutura e sede',description:'Aluguel, condomínio, cessão de espaço e despesas de ocupação.',active:true},
  {id:2002,code:'2.02',name:'Energia elétrica',type:'despesa',group:'Estrutura e sede',description:'Fornecimento de energia elétrica.',active:true},
  {id:2003,code:'2.03',name:'Água e saneamento',type:'despesa',group:'Estrutura e sede',description:'Água, esgoto e saneamento.',active:true},
  {id:2004,code:'2.04',name:'Internet e comunicação',type:'despesa',group:'Administração',description:'Internet, telefonia, hospedagem, domínios e serviços de comunicação.',active:true},
  {id:2005,code:'2.05',name:'Manutenção e reparos',type:'despesa',group:'Estrutura e sede',description:'Manutenção preventiva, corretiva e pequenos reparos.',active:true},
  {id:2006,code:'2.06',name:'Materiais administrativos',type:'despesa',group:'Administração',description:'Papelaria, impressões, suprimentos e materiais administrativos.',active:true},
  {id:2007,code:'2.07',name:'Materiais ritualísticos',type:'despesa',group:'Atividade ritualística',description:'Materiais e itens utilizados nas atividades ritualísticas.',active:true},
  {id:2008,code:'2.08',name:'Alimentação e banquetes',type:'despesa',group:'Eventos',description:'Alimentação, ágapes, banquetes e confraternizações.',active:true},
  {id:2009,code:'2.09',name:'Eventos e confraternizações',type:'despesa',group:'Eventos',description:'Custos de organização, locação, estrutura e serviços de eventos.',active:true},
  {id:2010,code:'2.10',name:'Taxas e contribuições à Grande Loja',type:'despesa',group:'Obediência maçônica',description:'Taxas, contribuições e repasses à Grande Loja ou órgãos maçônicos.',active:true},
  {id:2011,code:'2.11',name:'Contabilidade e serviços profissionais',type:'despesa',group:'Administração',description:'Honorários contábeis, jurídicos, técnicos e serviços profissionais.',active:true},
  {id:2012,code:'2.12',name:'Tarifas bancárias',type:'despesa',group:'Financeiro',description:'Tarifas, taxas e demais custos bancários.',active:true},
  {id:2013,code:'2.13',name:'Seguros',type:'despesa',group:'Administração',description:'Seguros patrimoniais, responsabilidade e demais coberturas.',active:true},
  {id:2014,code:'2.14',name:'Beneficência e assistência',type:'despesa',group:'Beneficência',description:'Auxílios, campanhas e ações beneficentes.',active:true},
  {id:2015,code:'2.15',name:'Tributos, taxas e emolumentos',type:'despesa',group:'Administração',description:'Tributos, taxas públicas, registros e emolumentos diversos.',active:true},
  {id:2016,code:'2.16',name:'Capitação',type:'despesa',group:'Obediência maçônica',description:'Custo mensal de capitação por irmão ativo.',active:true,system:true},
  {id:2017,code:'2.17',name:'DAM',type:'despesa',group:'Obediência maçônica',description:'Custo mensal de DAM por irmão ativo.',active:true,system:true},
  {id:2099,code:'2.99',name:'Outras despesas',type:'despesa',group:'Outras despesas',description:'Despesas que não se enquadram nas contas anteriores.',active:true}

];
const seedCostCenters=[
  {id:3001,code:'CC.01',name:'Administração da Loja',description:'Despesas e receitas ligadas à gestão administrativa geral da Loja.',active:true},
  {id:3002,code:'CC.02',name:'Templo',description:'Manutenção, estrutura, ocupação e despesas diretamente ligadas ao Templo.',active:true},
  {id:3003,code:'CC.03',name:'Sessões ritualísticas',description:'Custos e receitas diretamente relacionados às sessões ritualísticas.',active:true},
  {id:3004,code:'CC.04',name:'Eventos e confraternizações',description:'Eventos sociais, jantares, comemorações e confraternizações.',active:true},
  {id:3005,code:'CC.05',name:'Beneficência',description:'Campanhas, auxílios e demais atividades beneficentes.',active:true},
  {id:3006,code:'CC.06',name:'Biblioteca / Acervo',description:'Aquisição, preservação e organização do acervo intelectual e histórico.',active:true},
  {id:3007,code:'CC.07',name:'Comunicação e divulgação',description:'Site, domínio, publicidade, comunicação institucional e divulgação.',active:true},
  {id:3008,code:'CC.08',name:'Formação e instrução maçônica',description:'Atividades de formação, instrução, palestras e produção intelectual.',active:true},
  {id:3009,code:'CC.09',name:'Patrimônio',description:'Aquisição, conservação e gestão de bens patrimoniais da Loja.',active:true},
  {id:3010,code:'CC.10',name:'Projetos especiais',description:'Projetos temporários ou especiais, como jubileus, obras e ações específicas.',active:true},
  {id:3099,code:'CC.99',name:'Geral / não alocado',description:'Uso transitório quando não há centro de custo específico definido.',active:true,system:true}
];
const seedDocs=[];

const historicalManagements=[];
const seedSocial=[];

const seedManagementData={
  templates:[
    {id:'iniciacao',name:'Iniciação',system:true,items:[],createdAt:'2026-09-14T00:00:00.000Z',createdBy:'Sistema',updatedAt:'2026-09-14T00:00:00.000Z',updatedBy:'Sistema'},
    {id:'elevacao',name:'Elevação',system:true,items:[],createdAt:'2026-09-14T00:00:00.000Z',createdBy:'Sistema',updatedAt:'2026-09-14T00:00:00.000Z',updatedBy:'Sistema'},
    {id:'exaltacao',name:'Exaltação',system:true,items:[],createdAt:'2026-09-14T00:00:00.000Z',createdBy:'Sistema',updatedAt:'2026-09-14T00:00:00.000Z',updatedBy:'Sistema'},
    {id:'outros',name:'Outros / Livre',system:true,items:[],createdAt:'2026-09-14T00:00:00.000Z',createdBy:'Sistema',updatedAt:'2026-09-14T00:00:00.000Z',updatedBy:'Sistema'}
  ],runs:[],suppliers:[]
};
function migrateManagementData(data){
  const d=data&&typeof data==='object'?data:{};
  const required=seedManagementData.templates.map(x=>structuredClone(x));
  const existing=Array.isArray(d.templates)?d.templates:[];
  const templates=existing.map(t=>({id:String(t.id||`tpl-${Date.now()}-${Math.random().toString(16).slice(2)}`),name:String(t.name||'Checklist').trim().slice(0,120),system:Boolean(t.system),items:(Array.isArray(t.items)?t.items:[]).map(i=>String(typeof i==='string'?i:i?.text||'').trim().slice(0,240)).filter(Boolean),createdAt:t.createdAt||new Date().toISOString(),createdBy:t.createdBy||'Sistema',updatedAt:t.updatedAt||new Date().toISOString(),updatedBy:t.updatedBy||t.createdBy||'Sistema'}));
  for(const r of required){if(!templates.some(t=>t.id===r.id))templates.push(r)}
  const runs=(Array.isArray(d.runs)?d.runs:[]).map(r=>({id:Number(r.id)||Date.now()+Math.floor(Math.random()*100000),templateId:String(r.templateId||''),templateName:String(r.templateName||'Checklist').trim().slice(0,120),memberId:Number(r.memberId)||0,memberName:String(r.memberName||'').trim().slice(0,180),plannedDate:String(r.plannedDate||'').slice(0,10),responsible:String(r.responsible||'').trim().slice(0,120),notes:String(r.notes||'').slice(0,2000),items:(Array.isArray(r.items)?r.items:[]).map((i,idx)=>({id:String(i.id||`item-${idx+1}`),text:String(i.text||i||'').trim().slice(0,240),done:Boolean(i.done),updatedAt:i.updatedAt||null,updatedBy:String(i.updatedBy||'').slice(0,180)})).filter(i=>i.text),createdAt:r.createdAt||new Date().toISOString(),createdBy:r.createdBy||'Sistema',updatedAt:r.updatedAt||new Date().toISOString(),updatedBy:r.updatedBy||r.createdBy||'Sistema'})).filter(r=>r.id&&r.memberId);
  const suppliers=(Array.isArray(d.suppliers)?d.suppliers:[]).map(s=>({id:Number(s.id)||Date.now()+Math.floor(Math.random()*100000),legalName:String(s.legalName||'').trim().slice(0,180),tradeName:String(s.tradeName||'').trim().slice(0,180),contactPerson:String(s.contactPerson||'').trim().slice(0,140),phone:String(s.phone||'').trim().slice(0,80),email:String(s.email||'').trim().slice(0,180),category:String(s.category||'').trim().slice(0,120),status:s.status==='inativo'?'inativo':'ativo',notes:String(s.notes||'').slice(0,2000),createdAt:s.createdAt||new Date().toISOString(),createdBy:s.createdBy||'Sistema',updatedAt:s.updatedAt||new Date().toISOString(),updatedBy:s.updatedBy||s.createdBy||'Sistema'})).filter(s=>s.id&&s.legalName);
  return {templates,runs,suppliers};
}
let managementData=null;
let managementSubtab='checklists';
let checklistDetailId=null;

let session=null;
const hostedPortal=true;
managementData=migrateManagementData(hostedPortal?seedManagementData:(JSON.parse(localStorage.getItem('portalMaconicoManagementV1')||'null')||seedManagementData));
let finance=migrateFinance(hostedPortal?seedFinance:(JSON.parse(localStorage.getItem('portalMaconicoFinanceV5')||'null')||seedFinance));
let duesConfig=hostedPortal?{...seedDuesConfig}:(JSON.parse(localStorage.getItem('portalMaconicoDuesConfigV1')||'null')||seedDuesConfig);
let ledger=migrateLedger(hostedPortal?[...seedLedger]:(JSON.parse(localStorage.getItem('portalMaconicoLedgerV1')||'null')||seedLedger));
let bankTransactions=hostedPortal?[...seedBankTransactions]:(JSON.parse(localStorage.getItem('portalMaconicoBankTransactionsV1')||'null')||seedBankTransactions);
let autoReconcileSuggestions=new Map();
let aiReconcileSuggestions=new Map();
let autoReconcileLoading=false;
let aiReconcileLoading=false;
let financialEvents=migrateFinancialEvents(hostedPortal?[...seedFinancialEvents]:(JSON.parse(localStorage.getItem('portalMaconicoFinancialEventsV1')||'null')||seedFinancialEvents));
let eventPayments=migrateEventPayments(hostedPortal?[...seedEventPayments]:(JSON.parse(localStorage.getItem('portalMaconicoEventPaymentsV1')||'null')||seedEventPayments));
let financeSettings=hostedPortal?structuredClone(seedFinanceSettings):(JSON.parse(localStorage.getItem('portalMaconicoFinanceSettingsV1')||'null')||seedFinanceSettings);
let chartOfAccounts=migrateChartOfAccounts(hostedPortal?structuredClone(seedChartOfAccounts):(JSON.parse(localStorage.getItem('portalMaconicoChartOfAccountsV1')||'null')||structuredClone(seedChartOfAccounts)));
let costCenters=migrateCostCenters(hostedPortal?structuredClone(seedCostCenters):(JSON.parse(localStorage.getItem('portalMaconicoCostCentersV1')||'null')||structuredClone(seedCostCenters)));
let commitments=migrateCommitments(hostedPortal?[]:(JSON.parse(localStorage.getItem('portalMaconicoCommitmentsV1')||'null')||[]));
let annualBudget=migrateAnnualBudget(hostedPortal?[]:(JSON.parse(localStorage.getItem('portalMaconicoAnnualBudgetV1')||'null')||[]));
let duesExemptions=hostedPortal?{}:(JSON.parse(localStorage.getItem('portalMaconicoDuesExemptionsV1')||'null')||{});
let financeSyncTimer=null;
let financeRemoteReady=false;
let financeSubtab='charges';
let financeSelectedYear=new Date().getFullYear();
let financeSelectedMonth=String(new Date().getMonth()+1).padStart(2,'0');
let audit=hostedPortal?[...seedAudit]:(JSON.parse(localStorage.getItem('portalMaconicoAuditV5')||'null')||seedAudit);
let docs=migrateDocs(hostedPortal?seedDocs:(JSON.parse(localStorage.getItem('portalMaconicoDocsV5')||'null')||seedDocs));
let social=migrateSocial(JSON.parse(localStorage.getItem('portalMaconicoSocialV1')||'null')||seedSocial);
let attendanceRecords=[];
let attendanceManagerMode=false;
let attendanceSelectedSessionId=null;
let attendanceWorkingPresent=new Set();
let attendanceManagerPage='call';
let attendanceWorkingFinalized=false;
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];

// Tema visual do portal interno. A Home/login permanece com o visual original.
const PORTAL_THEME_KEY='portalMaconicoPortalThemeV1';
function applyPortalTheme(theme,persist=true){
  const normalized=theme==='light'?'light':'dark';
  document.body.dataset.portalTheme=normalized;
  if(persist){try{localStorage.setItem(PORTAL_THEME_KEY,normalized)}catch{}}
  const btn=$('#themeToggleBtn');
  if(btn){
    const isLight=normalized==='light';
    const icon=btn.querySelector('.theme-toggle-icon'),label=btn.querySelector('.theme-toggle-label');
    if(icon)icon.textContent=isLight?'☾':'☀';
    if(label)label.textContent=isLight?'Tema escuro':'Tema claro';
    const nextLabel=isLight?'Ativar tema escuro':'Ativar tema claro';
    btn.setAttribute('aria-label',nextLabel);btn.title=isLight?'Tema escuro':'Tema claro';btn.setAttribute('aria-pressed',isLight?'true':'false');
  }
}
function togglePortalTheme(){applyPortalTheme(document.body.dataset.portalTheme==='light'?'dark':'light')}
let initialPortalTheme='dark';try{initialPortalTheme=localStorage.getItem(PORTAL_THEME_KEY)||'dark'}catch{}
applyPortalTheme(initialPortalTheme,false);

// Instalação como aplicativo (PWA). O botão só aparece quando o navegador oferece instalação.
let portalMaconicoDeferredInstallPrompt=null;
function isPortalMaconicoStandalone(){
  return window.matchMedia?.('(display-mode: standalone)').matches || window.navigator.standalone===true;
}
function updatePortalMaconicoInstallButton(){
  const btn=$('#installAppBtn');
  if(!btn)return;
  btn.classList.toggle('hidden',!portalMaconicoDeferredInstallPrompt||isPortalMaconicoStandalone());
}
window.addEventListener('beforeinstallprompt',event=>{
  event.preventDefault();
  portalMaconicoDeferredInstallPrompt=event;
  updatePortalMaconicoInstallButton();
});
window.addEventListener('appinstalled',()=>{
  portalMaconicoDeferredInstallPrompt=null;
  updatePortalMaconicoInstallButton();
  try{toast('Portal Loja Modelo instalado.')}catch{}
});
async function installPortalMaconicoApp(){
  if(!portalMaconicoDeferredInstallPrompt)return;
  const prompt=portalMaconicoDeferredInstallPrompt;
  portalMaconicoDeferredInstallPrompt=null;
  updatePortalMaconicoInstallButton();
  try{
    await prompt.prompt();
    await prompt.userChoice;
  }catch(err){console.warn('Falha ao solicitar instalação do Portal Loja Modelo:',err)}
}
if('serviceWorker' in navigator && location.protocol!=='file:'){
  window.addEventListener('load',()=>navigator.serviceWorker.register('/sw.js').catch(err=>console.warn('Service worker não registrado:',err)));
}

function migrateFinance(rows){return rows.map(r=>({paidAt:null,paidValue:null,paymentMethod:null,notes:'',createdAt:new Date().toISOString(),createdBy:'Sistema',updatedAt:new Date().toISOString(),receipt:null,source:r.source||'manual',configYear:r.configYear||null,...r}))}
function migrateChartOfAccounts(rows){const source=Array.isArray(rows)&&rows.length?[...rows]:structuredClone(seedChartOfAccounts);for(const seed of seedChartOfAccounts.filter(a=>a.system)){if(!source.some(a=>String(a.code)===seed.code))source.push(structuredClone(seed))}return source.map(a=>({...a,id:Number(a.id)||Date.now()+Math.floor(Math.random()*100000),code:String(a.code||'').trim(),name:String(a.name||'').trim(),type:a.type==='despesa'?'despesa':'receita',group:String(a.group||'Outros').trim()||'Outros',description:String(a.description||'').trim(),active:a.active!==false,system:a.system===true,createdAt:a.createdAt||new Date().toISOString(),updatedAt:a.updatedAt||new Date().toISOString()})).sort((a,b)=>a.code.localeCompare(b.code,undefined,{numeric:true}))}
function migrateCostCenters(rows){const source=Array.isArray(rows)&&rows.length?rows:structuredClone(seedCostCenters);return source.map(c=>({...c,id:Number(c.id)||Date.now()+Math.floor(Math.random()*100000),code:String(c.code||'').trim(),name:String(c.name||'').trim(),description:String(c.description||'').trim(),active:c.active!==false,system:c.system===true,createdAt:c.createdAt||new Date().toISOString(),updatedAt:c.updatedAt||new Date().toISOString()})).sort((a,b)=>a.code.localeCompare(b.code,undefined,{numeric:true}))}
function migrateLedger(rows){return (Array.isArray(rows)?rows:[]).map(e=>({...e,costCenterId:Number(e.costCenterId)||3099,costCenterCode:e.costCenterCode||'CC.99',costCenterName:e.costCenterName||'Geral / não alocado'}))}
function migrateFinancialEvents(rows){return (Array.isArray(rows)?rows:[]).map(e=>({...e,id:Number(e.id)||Date.now()+Math.floor(Math.random()*100000),name:String(e.name||'').trim(),date:String(e.date||'').slice(0,10),year:Number(e.year)||yearOfDate(e.date),ticketValue:Math.max(0,Number(e.ticketValue)||0),description:String(e.description||''),status:e.status==='encerrado'?'encerrado':'ativo',createdAt:e.createdAt||new Date().toISOString(),createdBy:e.createdBy||'Sistema',updatedAt:e.updatedAt||new Date().toISOString(),updatedBy:e.updatedBy||e.createdBy||'Sistema'})).filter(e=>e.id&&e.name&&e.ticketValue>0)}
function migrateEventPayments(rows){return (Array.isArray(rows)?rows:[]).map(p=>({...p,id:Number(p.id)||Date.now()+Math.floor(Math.random()*100000),eventId:Number(p.eventId)||0,memberId:Number(p.memberId)||0,date:String(p.date||'').slice(0,10),amount:Math.max(0,Number(p.amount)||0),tickets:Math.max(0,Number(p.tickets)||0),method:String(p.method||''),reference:String(p.reference||''),notes:String(p.notes||''),bankId:p.bankId?Number(p.bankId):null,ledgerId:p.ledgerId?Number(p.ledgerId):null,createdAt:p.createdAt||new Date().toISOString(),createdBy:p.createdBy||'Sistema'})).filter(p=>p.id&&p.eventId&&p.memberId&&p.amount>0)}
function migrateAnnualBudget(rows){return (Array.isArray(rows)?rows:[]).map(b=>({...b,id:Number(b.id)||Date.now()+Math.floor(Math.random()*100000),year:Number(b.year)||new Date().getFullYear(),accountId:Number(b.accountId)||null,costCenterId:Number(b.costCenterId)||3099,description:String(b.description||''),amount:Math.max(0,Number(b.amount)||0),createdAt:b.createdAt||new Date().toISOString(),createdBy:b.createdBy||'Sistema',updatedAt:b.updatedAt||new Date().toISOString(),updatedBy:b.updatedBy||b.createdBy||'Sistema'})).filter(b=>b.id&&b.year&&b.accountId&&b.costCenterId&&b.amount>=0)}
function migrateCommitments(rows){return (Array.isArray(rows)?rows:[]).map(c=>({...c,id:Number(c.id)||Date.now()+Math.floor(Math.random()*100000),type:c.type==='receber'?'receber':'pagar',competence:String(c.competence||c.dueDate||'').slice(0,7),dueDate:String(c.dueDate||'').slice(0,10),accountId:Number(c.accountId)||null,costCenterId:Number(c.costCenterId)||3099,description:String(c.description||''),counterparty:String(c.counterparty||''),amount:Number(c.amount)||0,status:['aberto','liquidado','cancelado'].includes(c.status)?c.status:'aberto',settledDate:c.settledDate||null,settledAmount:c.settledAmount==null?null:Number(c.settledAmount),method:c.method||null,reference:c.reference||'',notes:c.notes||'',ledgerId:c.ledgerId?Number(c.ledgerId):null,bankId:c.bankId?Number(c.bankId):null,createdAt:c.createdAt||new Date().toISOString(),createdBy:c.createdBy||'Sistema',updatedAt:c.updatedAt||new Date().toISOString(),updatedBy:c.updatedBy||c.createdBy||'Sistema'}))}
function migrateDocs(rows){return rows.map(d=>({type:'trabalho',year:new Date().getFullYear(),keywords:'',description:'',createdAt:new Date().toISOString(),createdBy:'Sistema',fileName:null,fileType:null,fileSize:0,storageKey:null,storage:null,chunkCount:0,...d}))}
function migrateSocial(rows){return rows.map(p=>({type:'informacao',sessionDegree:null,body:'',publishedAt:new Date().toISOString().slice(0,10),featured:false,eventDate:null,eventTime:null,eventLocation:'',eventAddress:'',eventNotes:'',images:[],createdAt:new Date().toISOString(),createdBy:'Sistema',updatedAt:new Date().toISOString(),updatedBy:'Sistema',...p,sessionDegree:p.type==='sessao'&&degreeRank[p.sessionDegree]?p.sessionDegree:null,images:Array.isArray(p.images)?p.images:[]}))}
function saveDocs(){
  if(!hostedPortal)localStorage.setItem('portalMaconicoDocsV5',JSON.stringify(docs));
  if(location.protocol==='file:'||false)return Promise.resolve();
  return fetch('/api/library-data',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({docs})})
    .then(async response=>{if(!response.ok){let data={};try{data=await response.json()}catch{}throw new Error(data.error||'Falha ao sincronizar o acervo.')}});
}
async function loadDocsFromServer(){
  if(location.protocol==='file:'||false)return;
  const response=await fetch('/api/library-data',{cache:'no-store'});
  if(!response.ok)return;
  const data=await response.json();
  if(Array.isArray(data.docs)){
    docs=migrateDocs(data.docs);if(!hostedPortal)localStorage.setItem('portalMaconicoDocsV5',JSON.stringify(docs));
  }else{
    await saveDocs();
  }
}
function saveSocial(){
  localStorage.setItem('portalMaconicoSocialV1',JSON.stringify(social));
  if(location.protocol==='file:')return Promise.resolve();
  return fetch('/api/social-posts',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({posts:social})})
    .then(async response=>{if(!response.ok){let data={};try{data=await response.json()}catch{}throw new Error(data.error||'Falha ao sincronizar a Área Social.')}});
}
async function loadSocialFromServer(){
  if(location.protocol==='file:')return;
  const response=await fetch('/api/social-posts',{cache:'no-store'});
  if(!response.ok)return;
  const data=await response.json();
  if(Array.isArray(data.posts)){
    social=migrateSocial(data.posts);localStorage.setItem('portalMaconicoSocialV1',JSON.stringify(social));
  }else{
    await saveSocial();
  }
}
async function loadAttendanceFromServer(){
  attendanceRecords=[];attendanceManagerMode=false;
  if(!hostedPortal||!session)return;
  const response=await fetch('/api/attendance-data',{cache:'no-store'});let data={};try{data=await response.json()}catch{}
  if(!response.ok)throw new Error(data.error||'Não foi possível carregar a frequência.');
  attendanceManagerMode=Boolean(data.manager);attendanceRecords=Array.isArray(data.records)?data.records:[];
  if(attendanceManagerMode&&Array.isArray(data.users)){for(const u of data.users){const m=members.find(x=>String(x.matricula)===String(u.matricula));if(m)Object.assign(m,{name:u.name||m.name,active:u.active!==false,degree:u.degree||m.degree,installedMaster:Boolean(u.installedMaster)});}}
}
async function saveAttendanceSession(sessionPost,finalized){
  if(!canManageAttendance())return null;
  if(!sessionPost?.sessionDegree){toast('Defina o grau da sessão antes de registrar a frequência.');return null}
  const response=await fetch('/api/attendance-data',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({sessionId:sessionPost.id,sessionTitle:sessionPost.title,sessionDate:sessionPost.eventDate,sessionDegree:sessionPost.sessionDegree,presentMatriculas:[...attendanceWorkingPresent],finalized:Boolean(finalized)}),cache:'no-store'});let data={};try{data=await response.json()}catch{}
  if(!response.ok)throw new Error(data.error||'Não foi possível salvar a frequência.');
  const idx=attendanceRecords.findIndex(r=>Number(r.sessionId)===Number(sessionPost.id));if(idx>=0)attendanceRecords[idx]=data.record;else attendanceRecords.push(data.record);return data.record;
}

const libraryTypeLabel={trabalho:'Trabalho',artigo:'Artigo',livro:'Livro / capítulo',historico:'Documento histórico',ritualistica:'Material ritualístico',outro:'Outro'};
function formatBytes(n){if(!n)return'—';if(n<1024)return`${n} B`;if(n<1048576)return`${(n/1024).toFixed(1)} KB`;return`${(n/1048576).toFixed(1)} MB`}
function escapeHtml(v=''){return String(v).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]))}
const socialTypeLabel={informacao:'Informação',sessao:'Sessão',evento:'Evento',galeria:'Galeria'};
function dateLongBR(d){return d?new Date(d+'T12:00:00').toLocaleDateString('pt-BR',{day:'2-digit',month:'long',year:'numeric'}):'—'}
function dateShortSocial(d){return d?new Date(d+'T12:00:00').toLocaleDateString('pt-BR',{day:'2-digit',month:'short'}).replace('.',''):'—'}

// Arquivos da biblioteca.
// No Netlify, os arquivos de até 50 MB são enviados em blocos menores e persistidos no Netlify Blobs.
// Em execução local, o IndexedDB permanece como fallback para testes.
const LIBRARY_INPUT_MAX=50*1024*1024;
const LIBRARY_CHUNK_SIZE=4*1024*1024;
let libraryDBPromise=null;
function libraryDB(){if(libraryDBPromise)return libraryDBPromise;libraryDBPromise=new Promise((resolve,reject)=>{const req=indexedDB.open('portalMaconicoLibraryV5',1);req.onupgradeneeded=()=>{const db=req.result;if(!db.objectStoreNames.contains('files'))db.createObjectStore('files')};req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error)});return libraryDBPromise}
async function storeLocalLibraryFile(key,file){const db=await libraryDB();return new Promise((resolve,reject)=>{const tx=db.transaction('files','readwrite');tx.objectStore('files').put(file,key);tx.oncomplete=()=>resolve();tx.onerror=()=>reject(tx.error)})}
async function getLocalLibraryFile(key){if(!key)return null;const db=await libraryDB();return new Promise((resolve,reject)=>{const tx=db.transaction('files','readonly');const req=tx.objectStore('files').get(key);req.onsuccess=()=>resolve(req.result||null);req.onerror=()=>reject(req.error)})}
async function deleteLocalLibraryFile(key){if(!key)return;const db=await libraryDB();return new Promise((resolve,reject)=>{const tx=db.transaction('files','readwrite');tx.objectStore('files').delete(key);tx.oncomplete=()=>resolve();tx.onerror=()=>reject(tx.error)})}
function libraryUsesRemote(){return location.protocol!=='file:'&&!false}
async function uploadLibraryFile(file,key,onProgress){
  if(!libraryUsesRemote()){await storeLocalLibraryFile(key,file);onProgress?.(100);return {storage:'indexeddb',chunkCount:1}}
  const count=Math.max(1,Math.ceil(file.size/LIBRARY_CHUNK_SIZE));
  for(let i=0;i<count;i++){
    const chunk=file.slice(i*LIBRARY_CHUNK_SIZE,Math.min(file.size,(i+1)*LIBRARY_CHUNK_SIZE));
    const response=await fetch('/api/library-file',{
      method:'POST',
      headers:{'Content-Type':'application/octet-stream','X-Storage-Key':key,'X-Chunk-Index':String(i),'X-Chunk-Count':String(count),'X-File-Name':encodeURIComponent(file.name),'X-File-Type':file.type||'application/octet-stream','X-File-Size':String(file.size)},
      body:chunk
    });
    let data={};try{data=await response.json()}catch{}
    if(!response.ok)throw new Error(data.error||`Falha ao enviar a parte ${i+1} de ${count}.`);
    onProgress?.(Math.round(((i+1)/count)*100));
  }
  return {storage:'netlify-blobs-chunked',chunkCount:count};
}
async function getLibraryFile(record,onProgress){
  if(!record?.storageKey)return null;
  if(record.storage!=='netlify-blobs-chunked')return getLocalLibraryFile(record.storageKey);
  const count=Number(record.chunkCount)||1,chunks=[];
  for(let i=0;i<count;i++){
    const response=await fetch(`/api/library-file?key=${encodeURIComponent(record.storageKey)}&chunk=${i}`,{cache:'no-store'});
    if(!response.ok)throw new Error(`Falha ao recuperar a parte ${i+1} de ${count}.`);
    chunks.push(await response.blob());onProgress?.(Math.round(((i+1)/count)*100));
  }
  return new Blob(chunks,{type:record.fileType||'application/octet-stream'});
}
async function deleteLibraryFile(recordOrKey){
  const record=typeof recordOrKey==='object'?recordOrKey:null,key=record?.storageKey||recordOrKey;if(!key)return;
  if(record?.storage==='netlify-blobs-chunked'&&libraryUsesRemote()){
    const response=await fetch(`/api/library-file?key=${encodeURIComponent(key)}`,{method:'DELETE'});
    if(!response.ok)throw new Error('Falha ao remover o arquivo do acervo.');return;
  }
  await deleteLocalLibraryFile(key);
}

// Fotos da Área Social: arquivos físicos do site em /imagens-social.
// O IndexedDB abaixo é mantido apenas para compatibilidade com fotos das versões anteriores do protótipo.
let socialDBPromise=null;
function socialDB(){if(socialDBPromise)return socialDBPromise;socialDBPromise=new Promise((resolve,reject)=>{const req=indexedDB.open('portalMaconicoSocialV1',1);req.onupgradeneeded=()=>{const db=req.result;if(!db.objectStoreNames.contains('images'))db.createObjectStore('images')};req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error)});return socialDBPromise}
async function getLegacySocialImage(key){if(!key)return null;const db=await socialDB();return new Promise((resolve,reject)=>{const tx=db.transaction('images','readonly');const req=tx.objectStore('images').get(key);req.onsuccess=()=>resolve(req.result||null);req.onerror=()=>reject(req.error)})}
async function deleteLegacySocialImage(key){if(!key)return;const db=await socialDB();return new Promise((resolve,reject)=>{const tx=db.transaction('images','readwrite');tx.objectStore('images').delete(key);tx.oncomplete=()=>resolve();tx.onerror=()=>reject(tx.error)})}
const SOCIAL_INPUT_MAX=10*1024*1024;
const SOCIAL_UPLOAD_TARGET=4.5*1024*1024; // abaixo do limite de payload das Functions

function canvasToBlob(canvas,type,quality){return new Promise((resolve,reject)=>canvas.toBlob(b=>b?resolve(b):reject(new Error('Falha ao otimizar a imagem.')),type,quality))}
async function optimizeSocialImage(file){
  if(file.size<=SOCIAL_UPLOAD_TARGET)return file;
  const bitmap=await createImageBitmap(file);
  let width=bitmap.width,height=bitmap.height;
  const maxSide=3200;
  if(Math.max(width,height)>maxSide){const scale=maxSide/Math.max(width,height);width=Math.max(1,Math.round(width*scale));height=Math.max(1,Math.round(height*scale))}
  let canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;
  let ctx=canvas.getContext('2d',{alpha:true});ctx.drawImage(bitmap,0,0,width,height);bitmap.close?.();
  const qualities=[0.9,0.82,0.74,0.66,0.58,0.5,0.42];
  let blob=null;
  for(const q of qualities){blob=await canvasToBlob(canvas,'image/webp',q);if(blob.size<=SOCIAL_UPLOAD_TARGET)break}
  while(blob&&blob.size>SOCIAL_UPLOAD_TARGET&&Math.max(canvas.width,canvas.height)>1400){
    const next=document.createElement('canvas');next.width=Math.round(canvas.width*0.82);next.height=Math.round(canvas.height*0.82);
    next.getContext('2d',{alpha:true}).drawImage(canvas,0,0,next.width,next.height);canvas=next;blob=await canvasToBlob(canvas,'image/webp',0.72);
  }
  if(!blob||blob.size>5*1024*1024)throw new Error('Não foi possível otimizar esta imagem para envio no Netlify.');
  const stem=(file.name||'foto').replace(/\.[^.]+$/,'');
  return new File([blob],`${stem}.webp`,{type:'image/webp',lastModified:Date.now()});
}
async function uploadSocialImages(files){
  if(location.protocol==='file:')throw new Error('SERVER_REQUIRED');
  const saved=[];
  for(const original of files){
    const file=await optimizeSocialImage(original);
    const response=await fetch('/api/social-images',{
      method:'POST',
      headers:{'Content-Type':file.type||'application/octet-stream','X-File-Name':encodeURIComponent(file.name),'X-Original-Size':String(original.size)},
      body:file
    });
    let data={};try{data=await response.json()}catch{}
    if(!response.ok)throw new Error(data.error||'Falha ao enviar a imagem.');
    const incoming=Array.isArray(data.files)?data.files:[];saved.push(...incoming);
  }
  return saved;
}
async function deleteSocialImage(image){
  if(!image)return;
  if(image.fileName||image.url||image.path){
    const fileName=image.fileName||String(image.url||image.path).split('/').pop();
    if(!fileName||location.protocol==='file:')return;
    const response=await fetch(`/api/social-images?file=${encodeURIComponent(fileName)}`,{method:'DELETE'});
    if(!response.ok)throw new Error('Falha ao remover imagem física.');
    return;
  }
  if(image.key)await deleteLegacySocialImage(image.key);
}
let socialObjectUrls=[];
function clearSocialObjectUrls(){socialObjectUrls.forEach(u=>URL.revokeObjectURL(u));socialObjectUrls=[]}
async function hydrateSocialImages(root=document){
  const legacy=[...root.querySelectorAll('[data-social-image-key]')];
  for(const img of legacy){const key=img.dataset.socialImageKey;if(!key)continue;try{const blob=await getLegacySocialImage(key);if(!blob)continue;const url=URL.createObjectURL(blob);socialObjectUrls.push(url);img.src=url;img.style.display='block';img.closest('.social-photo-frame')?.classList.add('loaded')}catch{}}
}
function socialImageSrc(image){
  if(!image)return '';
  let fileName=image.fileName||'';
  const raw=String(image.url||image.path||'');
  if(!fileName&&raw){
    try{
      const u=new URL(raw,location.origin);
      if(u.pathname.startsWith('/imagens-social/'))fileName=decodeURIComponent(u.pathname.split('/').pop()||'');
      else if(u.pathname==='/api/social-image')fileName=u.searchParams.get('file')||'';
    }catch{
      if(raw.includes('/imagens-social/'))fileName=decodeURIComponent(raw.split('/').pop()||'');
    }
  }
  if(fileName)return `/api/social-image?file=${encodeURIComponent(fileName)}`;
  return raw;
}
function socialImageMarkup(image,alt){
  const resolved=socialImageSrc(image);
  if(resolved){const src=escapeHtml(resolved);return `<img src="${src}" alt="${escapeHtml(alt)}" style="display:block" onload="this.closest('.social-photo-frame')?.classList.add('loaded')" onerror="this.style.display='none';this.closest('.social-photo-frame')?.classList.remove('loaded')" />`}
  return `<img data-social-image-key="${escapeHtml(image?.key||'')}" alt="${escapeHtml(alt)}" />`;
}
function financeUsesRemote(){return location.protocol!=='file:'&&!false}
function financePayload(){return {finance,duesConfig,ledger,bankTransactions,financialEvents,eventPayments,financeSettings,chartOfAccounts,costCenters,commitments,annualBudget,duesExemptions,audit}}
function scheduleFinanceSync(){if(!financeRemoteReady||!financeUsesRemote())return;clearTimeout(financeSyncTimer);financeSyncTimer=setTimeout(()=>syncFinanceRemote().catch(err=>console.warn('Falha ao sincronizar Tesouraria:',err)),350)}
async function syncFinanceRemote(){if(!financeUsesRemote())return;const response=await fetch('/api/finance-data',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({data:financePayload()})});if(!response.ok){let data={};try{data=await response.json()}catch{}throw new Error(data.error||'Falha ao sincronizar a Tesouraria.')}}
async function loadFinanceFromServer(){if(!financeUsesRemote()){financeRemoteReady=true;return}const response=await fetch('/api/finance-data',{cache:'no-store'});if(!response.ok){financeRemoteReady=true;return}const payload=await response.json();const data=payload?.data;if(data){let structureNeedsBootstrap=false;if(Array.isArray(data.finance))finance=migrateFinance(data.finance);if(data.duesConfig&&typeof data.duesConfig==='object')duesConfig=data.duesConfig;if(Array.isArray(data.ledger))ledger=migrateLedger(data.ledger);if(Array.isArray(data.bankTransactions))bankTransactions=data.bankTransactions;if(Array.isArray(data.financialEvents))financialEvents=migrateFinancialEvents(data.financialEvents);if(Array.isArray(data.eventPayments))eventPayments=migrateEventPayments(data.eventPayments);if(data.financeSettings&&typeof data.financeSettings==='object')financeSettings=data.financeSettings;if(Array.isArray(data.chartOfAccounts)&&data.chartOfAccounts.length)chartOfAccounts=migrateChartOfAccounts(data.chartOfAccounts);else{chartOfAccounts=migrateChartOfAccounts(structuredClone(seedChartOfAccounts));structureNeedsBootstrap=true}if(Array.isArray(data.costCenters)&&data.costCenters.length)costCenters=migrateCostCenters(data.costCenters);else{costCenters=migrateCostCenters(structuredClone(seedCostCenters));structureNeedsBootstrap=true}if(Array.isArray(data.commitments))commitments=migrateCommitments(data.commitments);if(Array.isArray(data.annualBudget))annualBudget=migrateAnnualBudget(data.annualBudget);if(data.duesExemptions&&typeof data.duesExemptions==='object')duesExemptions=data.duesExemptions;if(Array.isArray(data.audit))audit=data.audit;if(!hostedPortal){localStorage.setItem('portalMaconicoFinanceV5',JSON.stringify(finance));localStorage.setItem('portalMaconicoDuesConfigV1',JSON.stringify(duesConfig));localStorage.setItem('portalMaconicoLedgerV1',JSON.stringify(ledger));localStorage.setItem('portalMaconicoBankTransactionsV1',JSON.stringify(bankTransactions));localStorage.setItem('portalMaconicoFinancialEventsV1',JSON.stringify(financialEvents));localStorage.setItem('portalMaconicoEventPaymentsV1',JSON.stringify(eventPayments));localStorage.setItem('portalMaconicoFinanceSettingsV1',JSON.stringify(financeSettings));localStorage.setItem('portalMaconicoChartOfAccountsV1',JSON.stringify(chartOfAccounts));localStorage.setItem('portalMaconicoCostCentersV1',JSON.stringify(costCenters));localStorage.setItem('portalMaconicoCommitmentsV1',JSON.stringify(commitments));localStorage.setItem('portalMaconicoAnnualBudgetV1',JSON.stringify(annualBudget));localStorage.setItem('portalMaconicoDuesExemptionsV1',JSON.stringify(duesExemptions));localStorage.setItem('portalMaconicoAuditV5',JSON.stringify(audit))}const ratesMigrated=migrateGlmergsMonthlyRateConfig();financeRemoteReady=true;if(canManageTreasury()&&migrateLegacyAnnualGlmergsProvisions())saveCommitments();if(canManageTreasury()&&ratesMigrated)saveDuesConfig();if(structureNeedsBootstrap&&canManageTreasury())await syncFinanceRemote()}else{financeRemoteReady=true;if(canManageTreasury())await syncFinanceRemote()}}
function saveFinance(){if(!hostedPortal)localStorage.setItem('portalMaconicoFinanceV5',JSON.stringify(finance));scheduleFinanceSync()}
function saveDuesConfig(){if(!hostedPortal)localStorage.setItem('portalMaconicoDuesConfigV1',JSON.stringify(duesConfig));scheduleFinanceSync()}
function saveLedger(){if(!hostedPortal)localStorage.setItem('portalMaconicoLedgerV1',JSON.stringify(ledger));scheduleFinanceSync()}
function saveBankTransactions(){if(!hostedPortal)localStorage.setItem('portalMaconicoBankTransactionsV1',JSON.stringify(bankTransactions));scheduleFinanceSync()}
function saveFinancialEvents(){if(!hostedPortal)localStorage.setItem('portalMaconicoFinancialEventsV1',JSON.stringify(financialEvents));scheduleFinanceSync()}
function saveEventPayments(){if(!hostedPortal)localStorage.setItem('portalMaconicoEventPaymentsV1',JSON.stringify(eventPayments));scheduleFinanceSync()}
function saveFinanceSettings(){if(!hostedPortal)localStorage.setItem('portalMaconicoFinanceSettingsV1',JSON.stringify(financeSettings));scheduleFinanceSync()}
function saveChartOfAccounts(){chartOfAccounts=migrateChartOfAccounts(chartOfAccounts);if(!hostedPortal)localStorage.setItem('portalMaconicoChartOfAccountsV1',JSON.stringify(chartOfAccounts));scheduleFinanceSync()}
function saveCostCenters(){costCenters=migrateCostCenters(costCenters);if(!hostedPortal)localStorage.setItem('portalMaconicoCostCentersV1',JSON.stringify(costCenters));scheduleFinanceSync()}
function saveCommitments(){commitments=migrateCommitments(commitments);if(!hostedPortal)localStorage.setItem('portalMaconicoCommitmentsV1',JSON.stringify(commitments));scheduleFinanceSync()}
function saveAnnualBudget(){annualBudget=migrateAnnualBudget(annualBudget);if(!hostedPortal)localStorage.setItem('portalMaconicoAnnualBudgetV1',JSON.stringify(annualBudget));scheduleFinanceSync()}
function saveDuesExemptions(){if(!hostedPortal)localStorage.setItem('portalMaconicoDuesExemptionsV1',JSON.stringify(duesExemptions));scheduleFinanceSync()}
function saveAudit(){if(!hostedPortal)localStorage.setItem('portalMaconicoAuditV5',JSON.stringify(audit));scheduleFinanceSync()}
function addAudit(action,detail){audit.unshift({id:Date.now(),at:new Date().toISOString(),actor:session?.name||'Sistema',action,detail});audit=audit.slice(0,100);saveAudit()}
function toast(msg){const t=$('#toast');t.textContent=msg;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),2400)}
function money(v){return new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'}).format(Number(v)||0)}
function monthLabel(m){const [y,mo]=m.split('-');return new Date(+y,+mo-1,1).toLocaleDateString('pt-BR',{month:'long',year:'numeric'}).replace(/^./,c=>c.toUpperCase())}
function dateBR(d){return d?new Date(d+'T12:00:00').toLocaleDateString('pt-BR'):'—'}
function dateTimeBR(d){return d?new Date(d).toLocaleString('pt-BR',{dateStyle:'short',timeStyle:'short'}):'—'}
function memberName(id){return members.find(m=>m.id===Number(id))?.name||'—'}
function isAdmin(){return Boolean(session&&fullAccessOffices.has(session.role))}
function canViewAllFinance(){return Boolean(session&&['Tesoureiro','Venerável Mestre','Secretário','Administrador do portal'].includes(session.role))}
function canManageTreasury(){return Boolean(session&&['Tesoureiro','Venerável Mestre','Administrador do portal'].includes(session.role))}
function isTreasurer(){return canViewAllFinance()}
function hasDifferentiatedAccess(){return Boolean(session&&session.role!=='Irmão')}
function canEditDuesConfig(){return canManageTreasury()}
function canSendWhatsAppFinance(){return canManageTreasury()}
function canManageAttendance(){return Boolean(session&&(session.role==='Administrador do portal'||['Chanceler','Secretário','Venerável Mestre'].includes(session.masonicOffice)))}
function canAccessDoc(doc){return Boolean(session&&(isAdmin()||degreeRank[session.degree]>=degreeRank[doc.degree]))}
function accessLevelFor(member){if(fullAccessOffices.has(member.office))return'Acesso total';if(member.office==='Tesoureiro')return'Financeiro + leitura por grau';if(member.masonicOffice==='Chanceler')return'Chancelaria + leitura por grau';return`Leitura · ${degreeLabel[member.degree]}`}
function syncMemberPortalRole(member){
  member.office=member.portalAdmin?'Administrador do portal':privilegedMasonicOffices.has(member.masonicOffice)?member.masonicOffice:'Irmão';
}
async function refreshCurrentSessionFor(member){
  if(session?.matricula!==member.matricula)return;
  if(hostedPortal){await refreshServerSession();return}
  syncMemberPortalRole(member);session.role=member.office;session.masonicOffice=member.masonicOffice;session.degree=member.degree;session.installedMaster=Boolean(member.installedMaster);session.name=member.name;session.initials=member.initials;
}
async function updateAuthUserServer(matricula,patch){
  if(!hostedPortal)return null;
  const response=await fetch('/api/auth-users',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({matricula,patch}),cache:'no-store'});let data={};try{data=await response.json()}catch{}if(!response.ok)throw new Error(data.error||'Não foi possível atualizar a permissão no servidor.');return data.user||null;
}
async function createAuthUserServer(user){
  if(!hostedPortal)return null;const response=await fetch('/api/auth-users',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({user}),cache:'no-store'});let data={};try{data=await response.json()}catch{}if(!response.ok)throw new Error(data.error||'Não foi possível criar o login no servidor.');if(data.temporaryPassword)alert('Senha temporária (mostrada somente agora): '+data.temporaryPassword+'\nEntregue ao usuário por um canal privado.');return data.user||null;
}
function currentUserMetaText(){
  if(!session)return'';
  const parts=[`Matrícula ${session.matricula}`,session.degree==='mestre'&&session.installedMaster?'Mestre Instalado':degreeLabel[session.degree]];
  if(session.masonicOffice&&session.masonicOffice!=='Sem cargo')parts.push(session.masonicOffice);
  if(session.role&&session.role!=='Irmão'&&session.role!==session.masonicOffice)parts.push(session.role);
  return parts.join(' · ');
}
async function saveMemberMasonicOffice(matricula,cargo){
  if(!isAdmin()||!masonicOfficeOptions.includes(cargo))return;const member=members.find(m=>m.matricula===String(matricula));if(!member)return;const previous=member.masonicOffice||'Sem cargo';
  try{await updateAuthUserServer(member.matricula,{masonicOffice:cargo})}catch(err){toast(err.message);renderAccessManagement();return}
  member.masonicOffice=cargo;masonicOfficeOverrides[member.matricula]=cargo;localStorage.setItem('portalMaconicoMasonicOfficesV1',JSON.stringify(masonicOfficeOverrides));syncMemberPortalRole(member);await refreshCurrentSessionFor(member);addAudit('Cargo maçônico atualizado',`${member.name} · ${previous} → ${cargo}`);if(session?.matricula===member.matricula)showApp();else{renderMembers();renderAccessManagement()}toast(`${member.name}: cargo atualizado para ${cargo}.`)
}
async function saveMemberPortalAccess(matricula,value){
  if(!isAdmin()||!['padrao','admin'].includes(value))return;const member=members.find(m=>m.matricula===String(matricula));if(!member)return;const portalAdmin=value==='admin';
  try{await updateAuthUserServer(member.matricula,{portalAdmin})}catch(err){toast(err.message);renderAccessManagement();return}
  member.portalAdmin=portalAdmin;portalAdminOverrides[member.matricula]=portalAdmin;localStorage.setItem('portalMaconicoPortalAdminsV1',JSON.stringify(portalAdminOverrides));syncMemberPortalRole(member);await refreshCurrentSessionFor(member);addAudit('Permissão especial atualizada',`${member.name} · ${member.portalAdmin?'Administrador do portal':'Padrão pelo cargo'}`);if(session?.matricula===member.matricula)showApp();else renderAccessManagement();toast(`Permissão de ${member.name} atualizada.`)
}
async function saveMemberDegree(matricula,degree){
  if(!isAdmin()||!degreeRank[degree])return;const member=members.find(m=>m.matricula===String(matricula));if(!member)return;const previous=member.degree;if(previous===degree)return;
  try{await updateAuthUserServer(member.matricula,{degree,...(degree!=='mestre'?{installedMaster:false}:{})})}catch(err){toast(err.message);renderAccessManagement();return}
  member.degree=degree;if(degree!=='mestre')member.installedMaster=false;const current=getMemberProfile(member);memberProfiles[member.matricula]={...current,degree,installedMaster:degree==='mestre'?Boolean(member.installedMaster):false,updatedAt:new Date().toISOString(),updatedBy:session.name};saveMemberProfiles();const added=addedMembers.find(m=>String(m.matricula)===member.matricula);if(added){added.degree=degree;saveAddedMembers()}await refreshCurrentSessionFor(member);if(session?.matricula===member.matricula){$('#degreeBadge').textContent=degreeLabel[degree];$('#currentUserMeta').textContent=currentUserMetaText()}addAudit('Grau atualizado',`${member.name} · ${degreeLabel[previous]} → ${degreeLabel[degree]}`);renderMembers();renderAccessManagement();renderLibrary();renderDashboard();toast(`${member.name} agora está cadastrado como ${degreeLabel[degree]}.`)
}
function effectiveStatus(r){if(r.status==='pago')return'pago';if(r.status==='isento')return'isento';const now=new Date();const today=`${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;return r.due<today?'atrasado':'aberto'}
function statusLabel(s){return s==='pago'?'Pago':s==='isento'?'Isento':s==='atrasado'?'Vencido':'Em aberto'}
function nextReceipt(r){return `P70-${r.month.replace('-','')}-${String(r.id).slice(-4).padStart(4,'0')}`}

async function login(e){
  e.preventDefault();const matricula=($('#matricula').value||'').trim(),password=$('#password').value||'';
  const submit=e.submitter||e.target.querySelector('button[type="submit"]');if(submit){submit.disabled=true;submit.textContent='Entrando...'}
  try{const response=await fetch('/api/auth-login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({matricula,password}),cache:'no-store'});let data={};try{data=await response.json()}catch{}if(!response.ok)throw new Error(data.error||'Não foi possível autenticar.');session=data.user;$('#password').value='';if(session.mustChangePassword){openPasswordChange(true);return}await completeAuthenticatedStart()}catch(err){toast(err.message||'Falha no login.')}finally{if(submit){submit.disabled=false;submit.textContent='Entrar no portal'}}
}
function showApp(){if(!session)return;$('#loginView').classList.add('hidden');$('#appView').classList.remove('hidden');$('#degreeBadge').textContent=session.degree==='mestre'&&session.installedMaster?'Mestre Instalado':(degreeLabel[session.degree]||session.degree);$('#currentUserName').textContent=session.name;$('#currentUserMeta').textContent=currentUserMetaText();const topAvatar=document.querySelector('.user-chip .avatar');if(topAvatar)topAvatar.textContent=session.initials||'P70';$$('[data-admin-only]').forEach(x=>x.classList.toggle('hidden',!isAdmin()));$('#financeActions').classList.toggle('hidden',!canManageTreasury());$('#treasurerSummary').classList.toggle('hidden',!canViewAllFinance());$('#duesCompositionSummary')?.classList.toggle('hidden',!canViewAllFinance());$('#auditCard').classList.toggle('hidden',!canViewAllFinance());$('#newDocumentBtn').classList.toggle('hidden',!isAdmin());$('#newPostBtn').classList.toggle('hidden',!isAdmin());$('#newSessionBtn')?.classList.toggle('hidden',!isAdmin());$$('[data-treasurer-only]').forEach(x=>x.classList.toggle('hidden',!canManageTreasury()));$$('.finance-admin-tab').forEach(x=>x.classList.toggle('hidden',!canViewAllFinance()));$('#financeMonthTabs')?.classList.toggle('hidden',!canViewAllFinance());$('#financeYearTabs')?.classList.toggle('hidden',!canViewAllFinance());$('#financeMonthFilter')?.classList.toggle('hidden',canViewAllFinance());if(!canViewAllFinance()&&financeSubtab!=='charges')financeSubtab='charges';$('#financeIntro').textContent=canViewAllFinance()?'Mensalidades, eventos, orçamento, receitas, despesas, conciliação bancária e fluxo de caixa em um único módulo.':'Consulte exclusivamente suas próprias mensalidades e comprovantes.';renderAll();go('dashboard')}
async function completeAuthenticatedStart(){
  try{await loadAuthUsersFromServer();await Promise.all([loadSocialFromServer(),loadDocsFromServer(),loadFinanceFromServer(),loadAttendanceFromServer(),loadManagementFromServer()])}catch(err){console.warn('Sincronização remota parcial:',err)}
  showApp();
}
async function refreshServerSession(){const response=await fetch('/api/auth-session',{cache:'no-store'});if(!response.ok)return null;const data=await response.json();session=data.user||null;return session}
async function loadAuthUsersFromServer(){
  const own=members.find(m=>m.matricula===session?.matricula);if(own&&session){own.name=session.name;own.degree=session.degree;own.installedMaster=Boolean(session.installedMaster);own.masonicOffice=session.masonicOffice;own.office=session.role;own.initials=session.initials}
  if(!hostedPortal||!isAdmin())return;
  const response=await fetch('/api/auth-users',{cache:'no-store'});if(!response.ok)return;const data=await response.json();
  for(const u of data.users||[]){let m=members.find(x=>x.matricula===u.matricula);if(!m){m={id:Number(u.memberId||u.matricula),matricula:u.matricula,name:u.name,lodge:70,phone:u.phone||'',active:u.active!==false,degree:u.degree,installedMaster:Boolean(u.installedMaster),initials:u.initials||initialsFromName(u.name),defaultOffice:'Irmão',masonicOffice:u.masonicOffice||'Sem cargo',portalAdmin:Boolean(u.portalAdmin),office:u.role||'Irmão'};members.push(m)}else{Object.assign(m,{name:u.name,phone:u.phone||m.phone,active:u.active!==false,degree:u.degree,installedMaster:Boolean(u.installedMaster),initials:u.initials||initialsFromName(u.name),masonicOffice:u.masonicOffice||'Sem cargo',portalAdmin:Boolean(u.portalAdmin),office:u.role||'Irmão'})}}
}
function clearSensitiveClientState(){attendanceRecords=[];attendanceSelectedSessionId=null;attendanceWorkingPresent=new Set();attendanceWorkingFinalized=false;attendanceManagerPage='call';managementData=migrateManagementData(seedManagementData);managementSubtab='checklists';checklistDetailId=null;finance=[];duesConfig={};ledger=[];bankTransactions=[];autoReconcileSuggestions=new Map();aiReconcileSuggestions=new Map();autoReconcileLoading=false;aiReconcileLoading=false;financialEvents=[];eventPayments=[];financeSettings={};chartOfAccounts=migrateChartOfAccounts(structuredClone(seedChartOfAccounts));costCenters=migrateCostCenters(structuredClone(seedCostCenters));commitments=[];annualBudget=[];duesExemptions={};audit=[];financeRemoteReady=false;['portalMaconicoFinanceV5','portalMaconicoDuesConfigV1','portalMaconicoLedgerV1','portalMaconicoBankTransactionsV1','portalMaconicoFinancialEventsV1','portalMaconicoEventPaymentsV1','portalMaconicoFinanceSettingsV1','portalMaconicoChartOfAccountsV1','portalMaconicoCostCentersV1','portalMaconicoCommitmentsV1','portalMaconicoAnnualBudgetV1','portalMaconicoDuesExemptionsV1','portalMaconicoAuditV5','portalMaconicoManagementV1','portalMaconicoSession'].forEach(k=>localStorage.removeItem(k))}
async function logout(){try{await fetch('/api/auth-logout',{method:'POST',cache:'no-store'})}catch{}clearSensitiveClientState();session=null;$('#appView').classList.add('hidden');$('#loginView').classList.remove('hidden');$('#passwordChangeDialog')?.close();toast('Sessão encerrada com segurança.')}
function openPasswordChange(required=false){const d=$('#passwordChangeDialog');if(!d)return;d.dataset.required=required?'1':'0';$('#passwordChangeIntro').textContent=required?'Por segurança, crie uma senha pessoal antes de acessar os dados do portal.':'Digite uma nova senha para sua conta.';$('#cancelPasswordChangeBtn').classList.toggle('hidden',required);$('#newPassword').value='';$('#confirmNewPassword').value='';d.showModal()}

async function loadManagementFromServer(){
  if(!isAdmin()){managementData=migrateManagementData(seedManagementData);return}
  if(!hostedPortal){managementData=migrateManagementData(JSON.parse(localStorage.getItem('portalMaconicoManagementV1')||'null')||seedManagementData);return}
  const response=await fetch('/api/management-data',{cache:'no-store'});if(!response.ok)throw new Error('Não foi possível carregar os dados de Gestão.');const payload=await response.json();managementData=migrateManagementData(payload.data||seedManagementData)
}
async function saveManagementData(){
  managementData=migrateManagementData(managementData);
  if(!hostedPortal){localStorage.setItem('portalMaconicoManagementV1',JSON.stringify(managementData));return}
  const response=await fetch('/api/management-data',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({data:managementData}),cache:'no-store'});let body={};try{body=await response.json()}catch{}if(!response.ok)throw new Error(body.error||'Não foi possível salvar os dados de Gestão.');managementData=migrateManagementData(body.data||managementData)
}
function setManagementTab(tab){if(!['checklists','suppliers'].includes(tab))tab='checklists';managementSubtab=tab;$$('[data-management-tab]').forEach(b=>b.classList.toggle('active',b.dataset.managementTab===tab));$('#managementChecklistsPanel')?.classList.toggle('hidden',tab!=='checklists');$('#managementSuppliersPanel')?.classList.toggle('hidden',tab!=='suppliers');if(tab==='checklists')renderChecklistRuns();else renderSuppliers()}
function checklistRunStatus(run){const total=run.items.length,done=run.items.filter(i=>i.done).length;return total>0&&done===total?'concluido':'andamento'}
function checklistProgress(run){const total=run.items.length,done=run.items.filter(i=>i.done).length;return {total,done,pending:Math.max(0,total-done),percent:total?Math.round(done/total*100):0}}
function renderManagement(){if(!isAdmin())return;managementData=migrateManagementData(managementData||seedManagementData);const templateCount=$('#checklistTemplateCount'),openCount=$('#checklistOpenCount'),doneCount=$('#checklistDoneCount'),pendingCount=$('#checklistPendingItems');if(!templateCount||!openCount||!doneCount||!pendingCount)return;templateCount.textContent=String(managementData.templates.length);const open=managementData.runs.filter(r=>checklistRunStatus(r)==='andamento'),done=managementData.runs.filter(r=>checklistRunStatus(r)==='concluido');openCount.textContent=String(open.length);doneCount.textContent=String(done.length);pendingCount.textContent=String(managementData.runs.reduce((sum,r)=>sum+checklistProgress(r).pending,0));renderSuppliers();setManagementTab(managementSubtab)}
function renderChecklistRuns(){if(!isAdmin()||!$('#checklistRunGrid'))return;const q=normalizeText($('#checklistSearch')?.value||''),status=$('#checklistStatusFilter')?.value||'todos';const rows=[...managementData.runs].filter(r=>{const st=checklistRunStatus(r);return(status==='todos'||st===status)&&(!q||normalizeText([r.templateName,r.memberName,r.responsible,r.notes].join(' ')).includes(q))}).sort((a,b)=>String(b.plannedDate||b.createdAt).localeCompare(String(a.plannedDate||a.createdAt)));$('#checklistRunGrid').innerHTML=rows.map(r=>{const p=checklistProgress(r),st=checklistRunStatus(r);return `<article class="checklist-run-card"><div class="checklist-run-head"><div><span class="tag ${st==='concluido'?'ok':''}">${st==='concluido'?'Concluído':'Em andamento'}</span><h4>${escapeHtml(r.templateName)}</h4><p>${escapeHtml(r.memberName||memberName(r.memberId))}</p></div><strong>${p.percent}%</strong></div><div class="checklist-progress"><i style="width:${p.percent}%"></i></div><div class="checklist-run-meta"><span>${r.plannedDate?dateBR(r.plannedDate):'Sem data definida'}</span><span>${p.done}/${p.total} itens</span>${r.responsible?`<span>${escapeHtml(r.responsible)}</span>`:''}</div><div class="row-actions"><button class="action-btn" type="button" data-action="open-checklist-run" data-id="${r.id}">Abrir checklist</button></div></article>`}).join('')||'<div class="empty-state"><strong>Nenhum checklist encontrado.</strong><span>Configure os modelos e crie o primeiro checklist para um irmão.</span></div>'}
function fillChecklistTemplateDialog(preferred){const picker=$('#checklistTemplatePicker');if(!picker)return;picker.innerHTML=managementData.templates.map(t=>`<option value="${escapeHtml(t.id)}">${escapeHtml(t.name)}</option>`).join('');const id=preferred&&managementData.templates.some(t=>t.id===preferred)?preferred:managementData.templates[0]?.id||'';picker.value=id;loadChecklistTemplateIntoForm(id)}
function loadChecklistTemplateIntoForm(id){const t=managementData.templates.find(x=>x.id===id);$('#checklistTemplateId').value=t?.id||'';$('#checklistTemplateName').value=t?.name||'';$('#checklistTemplateItems').value=(t?.items||[]).join('\n');$('#checklistTemplateDialogTitle').textContent=t?'Editar modelo':'Novo modelo'}
function openChecklistTemplates(){if(!isAdmin())return;fillChecklistTemplateDialog();$('#checklistTemplateDialog').showModal()}
function newChecklistTemplate(){if(!isAdmin())return;$('#checklistTemplatePicker').value='';$('#checklistTemplateId').value='';$('#checklistTemplateName').value='';$('#checklistTemplateItems').value='';$('#checklistTemplateDialogTitle').textContent='Novo modelo';$('#checklistTemplateName').focus()}
function fillChecklistRunDialog(){const templates=managementData.templates;$('#checklistRunTemplate').innerHTML=templates.map(t=>`<option value="${escapeHtml(t.id)}">${escapeHtml(t.name)}</option>`).join('');$('#checklistRunMember').innerHTML=members.filter(m=>m.active).sort((a,b)=>a.name.localeCompare(b.name)).map(m=>`<option value="${m.id}">${escapeHtml(m.name)} · ${memberDegreeAbbr(m)}</option>`).join('');$('#checklistRunDate').value='';$('#checklistRunResponsible').value=session?.name||'';$('#checklistRunNotes').value='';updateChecklistRunTemplateHelp()}
function updateChecklistRunTemplateHelp(){const t=managementData.templates.find(x=>x.id===$('#checklistRunTemplate')?.value);if(!$('#checklistRunTemplateHelp'))return;$('#checklistRunTemplateHelp').textContent=t?(t.items.length?`${t.items.length} item(ns) serão copiados deste modelo.`:'Este modelo ainda não possui itens. Você pode configurá-lo em “Modelos de checklist” ou adicionar itens depois de criar o checklist.'):'Selecione um modelo.'}
function openNewChecklistRun(){if(!isAdmin())return;fillChecklistRunDialog();$('#checklistRunDialog').showModal()}
function openChecklistRun(id){if(!isAdmin())return;const r=managementData.runs.find(x=>Number(x.id)===Number(id));if(!r)return;checklistDetailId=Number(r.id);const p=checklistProgress(r);$('#checklistDetailTitle').textContent=`${r.templateName} · ${r.memberName||memberName(r.memberId)}`;$('#checklistDetailMeta').innerHTML=`<div><span>Status</span><strong>${checklistRunStatus(r)==='concluido'?'Concluído':'Em andamento'}</strong></div><div><span>Progresso</span><strong>${p.done}/${p.total} · ${p.percent}%</strong></div><div><span>Data prevista</span><strong>${r.plannedDate?dateBR(r.plannedDate):'—'}</strong></div><div><span>Responsável</span><strong>${escapeHtml(r.responsible||'—')}</strong></div>`;$('#checklistDetailNotes').value=r.notes||'';$('#checklistNewItemText').value='';renderChecklistDetailItems();$('#checklistDetailDialog').showModal()}
function renderChecklistDetailItems(){const r=managementData.runs.find(x=>Number(x.id)===Number(checklistDetailId));if(!r||!$('#checklistDetailItems'))return;$('#checklistDetailItems').innerHTML=r.items.map((i,idx)=>`<div class="checklist-detail-item ${i.done?'done':''}"><button class="checklist-toggle" type="button" data-action="toggle-checklist-item" data-id="${escapeHtml(i.id)}" aria-label="${i.done?'Desmarcar':'Marcar'} item">${i.done?'✓':''}</button><span>${escapeHtml(i.text)}</span><button class="icon-btn mini" type="button" data-action="remove-checklist-item" data-id="${escapeHtml(i.id)}" title="Remover item">×</button></div>`).join('')||'<div class="empty-state compact"><strong>Checklist sem itens.</strong><span>Adicione itens específicos acima ou configure o modelo para os próximos processos.</span></div>';const p=checklistProgress(r);$('#checklistDetailMeta').children[0].querySelector('strong').textContent=checklistRunStatus(r)==='concluido'?'Concluído':'Em andamento';$('#checklistDetailMeta').children[1].querySelector('strong').textContent=`${p.done}/${p.total} · ${p.percent}%`}
function renderSuppliers(){if(!isAdmin()||!$('#supplierGrid'))return;const all=managementData.suppliers,active=all.filter(s=>s.status!=='inativo'),q=normalizeText($('#supplierSearch')?.value||''),filter=$('#supplierStatusFilter')?.value||'ativos';$('#supplierTotalCount').textContent=String(all.length);$('#supplierActiveCount').textContent=String(active.length);$('#supplierWhatsappCount').textContent=String(active.filter(s=>String(s.phone||'').replace(/\D/g,'').length>=10).length);$('#supplierCategoryCount').textContent=String(new Set(active.map(s=>normalizeText(s.category)).filter(Boolean)).size);const rows=all.filter(s=>(filter==='todos'||(filter==='ativos'&&s.status!=='inativo')||(filter==='inativos'&&s.status==='inativo'))&&(!q||normalizeText([s.legalName,s.tradeName,s.contactPerson,s.phone,s.email,s.category,s.notes].join(' ')).includes(q))).sort((a,b)=>a.legalName.localeCompare(b.legalName));$('#supplierGrid').innerHTML=rows.map(s=>{const digits=String(s.phone||'').replace(/\D/g,'');const wa=digits.length>=10?(digits.startsWith('55')?digits:`55${digits}`):'';return `<article class="supplier-card ${s.status==='inativo'?'inactive':''}"><div class="supplier-card-head"><div><span class="tag ${s.status==='inativo'?'subtle':'ok'}">${s.status==='inativo'?'Inativo':'Ativo'}</span><h4>${escapeHtml(s.tradeName||s.legalName)}</h4><p>${escapeHtml(s.legalName)}</p></div>${s.category?`<small>${escapeHtml(s.category)}</small>`:''}</div><div class="supplier-contact-list">${s.contactPerson?`<span><b>Contato</b>${escapeHtml(s.contactPerson)}</span>`:''}${s.phone?`<span><b>Fone / WhatsApp</b>${escapeHtml(s.phone)}</span>`:''}${s.email?`<span><b>E-mail</b>${escapeHtml(s.email)}</span>`:''}</div><div class="row-actions">${wa?`<a class="action-btn supplier-wa" href="https://wa.me/${wa}" target="_blank" rel="noopener">WhatsApp</a>`:''}<button class="action-btn" type="button" data-action="edit-supplier" data-id="${s.id}">Editar</button><button class="action-btn" type="button" data-action="toggle-supplier" data-id="${s.id}">${s.status==='inativo'?'Reativar':'Inativar'}</button></div></article>`}).join('')||'<div class="empty-state"><strong>Nenhum fornecedor encontrado.</strong><span>Cadastre empresas e contatos para deixar as informações da Loja centralizadas.</span></div>'}
function openSupplier(id=null){if(!isAdmin())return;const s=id?managementData.suppliers.find(x=>Number(x.id)===Number(id)):null;$('#supplierEditId').value=s?.id||'';$('#supplierDialogTitle').textContent=s?'Editar fornecedor':'Novo fornecedor';$('#supplierLegalName').value=s?.legalName||'';$('#supplierTradeName').value=s?.tradeName||'';$('#supplierContactPerson').value=s?.contactPerson||'';$('#supplierPhone').value=s?.phone||'';$('#supplierEmail').value=s?.email||'';$('#supplierCategory').value=s?.category||'';$('#supplierStatus').value=s?.status==='inativo'?'inativo':'ativo';$('#supplierNotes').value=s?.notes||'';$('#supplierDialog').showModal()}
window.openChecklistRun=openChecklistRun;
window.editSupplier=id=>openSupplier(id);
async function toggleSupplier(id){if(!isAdmin())return;const s=managementData.suppliers.find(x=>Number(x.id)===Number(id));if(!s)return;s.status=s.status==='inativo'?'ativo':'inativo';s.updatedAt=new Date().toISOString();s.updatedBy=session.name;try{await saveManagementData();renderSuppliers();toast(`Fornecedor ${s.status==='ativo'?'reativado':'inativado'}.`)}catch(err){toast(err.message)}}
window.toggleSupplier=toggleSupplier;
window.toggleChecklistItem=async function(itemId){const r=managementData.runs.find(x=>Number(x.id)===Number(checklistDetailId));if(!r)return;const i=r.items.find(x=>x.id===String(itemId));if(!i)return;i.done=!i.done;i.updatedAt=new Date().toISOString();i.updatedBy=session.name;r.updatedAt=i.updatedAt;r.updatedBy=session.name;renderChecklistDetailItems();try{await saveManagementData();renderChecklistRuns()}catch(err){toast(err.message)}};
window.removeChecklistItem=function(itemId){const r=managementData.runs.find(x=>Number(x.id)===Number(checklistDetailId));if(!r)return;const i=r.items.find(x=>x.id===String(itemId));if(!i||!confirm(`Remover o item “${i.text}”?`))return;r.items=r.items.filter(x=>x.id!==String(itemId));r.updatedAt=new Date().toISOString();r.updatedBy=session.name;renderChecklistDetailItems()};

const titles={dashboard:['Vida da Loja','Início'],social:['Vida da Loja','Área Social'],finance:['Tesouraria','Financeiro'],library:['Acervo intelectual','Biblioteca'],members:['Quadro','Irmãos'],attendance:['Vida da Loja','Chancelaria'],management:['Gestão da Loja','Gestão'],managements:['Memória institucional','Gestões'],admin:['Configuração','Administração']};
function setMobileNav(open){
  const app=$('#appView');
  const btn=$('#mobileMenuBtn');
  const backdrop=$('#mobileNavBackdrop');
  if(!app)return;
  const isOpen=!!open && window.matchMedia('(max-width:760px)').matches;
  app.classList.toggle('mobile-nav-open',isOpen);
  btn?.setAttribute('aria-expanded',isOpen?'true':'false');
  if(backdrop)backdrop.classList.toggle('hidden',!isOpen);
}

function go(view){if(['admin','management'].includes(view)&&!isAdmin())return;setMobileNav(false);$$('.view').forEach(v=>v.classList.remove('active-view'));const target=$(`#view-${view}`);if(!target)return;target.classList.add('active-view');$$('#navMenu button').forEach(b=>b.classList.toggle('active',b.dataset.view===view));$('#pageEyebrow').textContent=titles[view][0];$('#pageTitle').textContent=titles[view][1];if(view==='finance')renderFinance();if(view==='library')renderLibrary();if(view==='social')renderSocialArchive();if(view==='attendance'){attendanceManagerPage='call';renderAttendance()}if(view==='management'){try{renderManagement()}catch(err){console.error('Falha ao renderizar Gestão:',err);toast('Não foi possível abrir a área Gestão. Atualize a página e tente novamente.')}}if(view==='managements')renderManagements();if(view==='dashboard'){renderDashboard();renderSocial()}}
function renderAll(){fillMembers();fillMonthFilter();fillAccessOfficeFilter();renderFinance();renderFinanceConfig();renderFinanceAux();renderChartOfAccounts();renderCommitments('pagar');renderCommitments('receber');renderLibrary();renderMembers();renderAccessManagement();renderDashboard();renderSocial();renderAttendance();renderAudit()}
function renderDashboard(){const accessible=docs.filter(canAccessDoc);$('#statLibrary').textContent=accessible.length;const own=finance.filter(f=>f.memberId===session.memberId);const hasOpen=own.some(f=>['aberto','atrasado'].includes(effectiveStatus(f)));$('#statFinance').textContent=!own.length?'Sem lançamentos':hasOpen?'Pendente':'Em dia';$('#statFinanceDetail').textContent=own.length?monthLabel([...own].sort((a,b)=>b.month.localeCompare(a.month))[0].month):'Nenhuma competência cadastrada'}

function fillMonthFilter(){const el=$('#financeMonthFilter');if(!el)return;const selected=el.value||'todos';const months=[...new Set(finance.map(f=>f.month))].sort().reverse();el.innerHTML='<option value="todos">Todas as competências</option>'+months.map(m=>`<option value="${m}">${monthLabel(m)}</option>`).join('');el.value=months.includes(selected)?selected:'todos'}
function financeYears(){const years=[...new Set([...finance.map(f=>Number(String(f.month).slice(0,4))),...Object.keys(duesConfig).map(Number)].filter(Number.isFinite))].sort((a,b)=>b-a);return years.length?years:[new Date().getFullYear()]}
function renderFinanceMonthTabs(){const tabs=$('#financeMonthTabs'),yearEl=$('#financeYearTabs');if(!tabs||!yearEl)return;const years=financeYears();if(!years.includes(Number(financeSelectedYear)))financeSelectedYear=years[0];yearEl.innerHTML=years.map(y=>`<option value="${y}">${y}</option>`).join('');yearEl.value=String(financeSelectedYear);const labels=['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];tabs.innerHTML=labels.map((label,i)=>{const mo=String(i+1).padStart(2,'0'),key=`${financeSelectedYear}-${mo}`,count=finance.filter(f=>f.month===key).length;return `<button type="button" class="finance-month-tab ${financeSelectedMonth===mo?'active':''}" data-month="${mo}"><span>${label}</span><small>${count}</small></button>`}).join('');tabs.querySelectorAll('[data-month]').forEach(btn=>btn.addEventListener('click',()=>{financeSelectedMonth=btn.dataset.month;renderFinanceMonthTabs();renderFinance()}))}

function configuredForYear(year){return duesConfig[String(year)]||null}
function monthlyGlmergsPerMember(cfg){return Math.max(0,Number(cfg?.capitationValue||0))+Math.max(0,Number(cfg?.damValue||0))}
function annualGlmergsPerMember(cfg){return monthlyGlmergsPerMember(cfg)*12}
function monthlyNetDuesPerMember(cfg){return Number(cfg?.baseValue||0)-monthlyGlmergsPerMember(cfg)}
function annualNetDuesPerMember(cfg){return Number(cfg?.baseValue||0)*12-annualGlmergsPerMember(cfg)}
function renderDuesMonthlySummary(year){
  const cfg=configuredForYear(year)||{baseValue:0,capitationValue:0,damValue:0};
  $('#duesMonthlyGrossDisplay')&&($('#duesMonthlyGrossDisplay').textContent=money(cfg.baseValue||0));
  $('#duesMonthlyGlmergsDisplay')&&($('#duesMonthlyGlmergsDisplay').textContent=money(monthlyGlmergsPerMember(cfg)));
  $('#duesMonthlyNetDisplay')&&($('#duesMonthlyNetDisplay').textContent=money(monthlyNetDuesPerMember(cfg)));
  $('#duesAnnualGlmergsDisplay')&&($('#duesAnnualGlmergsDisplay').textContent=money(annualGlmergsPerMember(cfg)));
  $('#duesMonthlyGlmergsDetail')&&($('#duesMonthlyGlmergsDetail').textContent=`Capitação ${money(cfg.capitationValue||0)}/mês + DAM ${money(cfg.damValue||0)}/mês`);
}
function renderDuesConfigBreakdown(cfg){
  const active=members.filter(m=>m.active).length;
  $('#duesConfigGrossMonthly')&&($('#duesConfigGrossMonthly').textContent=money(cfg.baseValue||0));
  $('#duesConfigGlmergsMonthly')&&($('#duesConfigGlmergsMonthly').textContent=money(monthlyGlmergsPerMember(cfg)));
  $('#duesConfigNetMonthly')&&($('#duesConfigNetMonthly').textContent=money(monthlyNetDuesPerMember(cfg)));
  $('#duesConfigNetAnnual')&&($('#duesConfigNetAnnual').textContent=money(annualNetDuesPerMember(cfg)));
  $('#duesInstitutionalCost')&&($('#duesInstitutionalCost').textContent=money(active*monthlyGlmergsPerMember(cfg)));
}
function currentDuesConfigInputs(){return {year:Number($('#duesConfigYear')?.value)||new Date().getFullYear(),baseValue:Math.max(0,Number($('#duesBaseValue')?.value)||0),capitationValue:Math.max(0,Number($('#duesCapitationValue')?.value)||0),damValue:Math.max(0,Number($('#duesDamValue')?.value)||0),dueDay:Number($('#duesDueDay')?.value)||10,notes:$('#duesConfigNotes')?.value||''}}
function syncGlmergsMonthlyProvisions(month,cfg){
  const active=members.filter(m=>m.active).length,admin=costCenters.find(c=>c.code==='CC.01')||costCenters.find(c=>c.system);
  const specs=[
    {kind:'capitation',label:'Capitação',accountCode:'2.16',unit:Number(cfg.capitationValue||0)},
    {kind:'dam',label:'DAM',accountCode:'2.17',unit:Number(cfg.damValue||0)}
  ];
  let changed=false;
  for(const spec of specs){
    const account=chartOfAccounts.find(a=>a.code===spec.accountCode),expected=Math.max(0,active*spec.unit);
    if(!account||!admin)continue;
    const related=commitments.filter(c=>c.origin==='glmergs-monthly'&&c.provisionMonth===month&&c.glmergsKind===spec.kind);
    const settled=related.find(c=>c.status==='liquidado');
    const open=related.find(c=>c.status==='aberto');
    if(settled)continue;
    if(expected>0){
      const base={type:'pagar',competence:month,dueDate:open?.dueDate||'',accountId:account.id,accountCode:account.code,costCenterId:admin.id,costCenterCode:admin.code,description:`${spec.label} GLMERGS · ${monthLabel(month)}`,counterparty:'GLMERGS',amount:expected,status:'aberto',reference:`GLMERGS-${spec.kind.toUpperCase()}-${month}`,notes:`Provisão mensal automática: ${active} irmão(s) ativo(s) × ${money(spec.unit)} por mês. Obrigação independente do pagamento ou isenção das mensalidades.`,origin:'glmergs-monthly',system:true,systemKey:`glmergs-${spec.kind}-${month}`,glmergsKind:spec.kind,provisionMonth:month,activeMembersSnapshot:active,unitValueSnapshot:spec.unit,updatedAt:new Date().toISOString(),updatedBy:session?.name||'Sistema'};
      if(open){const prev=JSON.stringify([open.amount,open.accountId,open.costCenterId,open.description,open.counterparty,open.reference,open.notes,open.activeMembersSnapshot,open.unitValueSnapshot]);Object.assign(open,base);if(prev!==JSON.stringify([open.amount,open.accountId,open.costCenterId,open.description,open.counterparty,open.reference,open.notes,open.activeMembersSnapshot,open.unitValueSnapshot]))changed=true}
      else{commitments.push({id:Date.now()+Math.floor(Math.random()*100000),...base,createdAt:new Date().toISOString(),createdBy:session?.name||'Sistema',settledDate:null,settledAmount:null,method:null,ledgerId:null,bankId:null});changed=true}
    }else if(open){commitments=commitments.filter(c=>c.id!==open.id);changed=true}
  }
  if(changed)saveCommitments();
  return changed;
}
function migrateLegacyAnnualGlmergsProvisions(){
  const before=commitments.length;
  commitments=commitments.filter(c=>!(c.origin==='glmergs-annual'&&c.status!=='liquidado'));
  return commitments.length!==before;
}
function annualDueDate(year,month,dueDay){const d=Math.max(1,Math.min(28,Number(dueDay)||10));return `${year}-${String(month).padStart(2,'0')}-${String(d).padStart(2,'0')}`}
function nextFinanceId(){return finance.reduce((m,r)=>Math.max(m,Number(r.id)||0),Date.now())+1}
function isAnnualDuesExempt(memberId,year){return Boolean(duesExemptions?.[String(year)]?.[String(memberId)]?.active)}
function annualExemptionRecord(memberId,year){return duesExemptions?.[String(year)]?.[String(memberId)]||null}
function setAnnualDuesExemption(memberId,year,enabled,reason=''){
  const y=String(year),m=String(memberId);if(!duesExemptions[y])duesExemptions[y]={};
  if(enabled)duesExemptions[y][m]={active:true,reason:String(reason||'Isenção anual').trim(),updatedAt:new Date().toISOString(),updatedBy:session?.name||'Sistema'};
  else delete duesExemptions[y][m];
  finance.filter(f=>Number(f.memberId)===Number(memberId)&&String(f.month).startsWith(`${year}-`)&&f.status!=='pago').forEach(f=>{
    if(enabled){if(f.status!=='isento'||f.annualExemption){f.status='isento';f.annualExemption=true;f.adjustReason=String(reason||'Isenção anual').trim();f.updatedAt=new Date().toISOString()}}
    else if(f.annualExemption){f.status='aberto';f.annualExemption=false;f.adjustReason='';f.updatedAt=new Date().toISOString()}
  });
  saveDuesExemptions();saveFinance();
}
function migrateGlmergsMonthlyRateConfig(){
  let changed=false;
  Object.values(duesConfig||{}).forEach(c=>{
    if(c.glmergsRateMode!=='monthly'){c.capitationValue=0;c.damValue=0;c.glmergsRateMode='monthly';c.updatedAt=new Date().toISOString();c.updatedBy=session?.name||'Sistema';changed=true}
  });
  return changed;
}
function initializeDefaultDues(){
  if(!duesConfig||typeof duesConfig!=='object')duesConfig={...seedDuesConfig};
  if(!duesConfig['2026'])duesConfig['2026']={...seedDuesConfig[2026]};
  Object.values(duesConfig).forEach(c=>{if(c.capitationValue==null)c.capitationValue=0;if(c.damValue==null)c.damValue=0;if(!c.glmergsRateMode)c.glmergsRateMode='monthly'});
  saveDuesConfig();
}
function setFinanceTab(tab){
  const allowed=['charges','revenues','expenses','events','payables','receivables','accounts','cost-centers','budget','bank','cashflow','reports','config'];if(!allowed.includes(tab))tab='charges';if(tab!=='charges'&&!canViewAllFinance())tab='charges';financeSubtab=tab;
  $$('.finance-subtab').forEach(b=>b.classList.toggle('active',b.dataset.financeTab===tab));
  const panels={charges:'#financeChargesPanel',revenues:'#financeRevenuesPanel',expenses:'#financeExpensesPanel',events:'#financeEventsPanel',payables:'#financePayablesPanel',receivables:'#financeReceivablesPanel',accounts:'#financeAccountsPanel','cost-centers':'#financeCostCentersPanel',budget:'#financeBudgetPanel',bank:'#financeBankPanel',cashflow:'#financeCashflowPanel',reports:'#financeReportsPanel',config:'#financeConfigPanel'};
  Object.entries(panels).forEach(([key,sel])=>$(sel)?.classList.toggle('hidden',key!==tab));
  $('#financeActions')?.classList.toggle('hidden',!(tab==='charges'&&canManageTreasury()));
  if(tab==='charges')renderFinance();if(tab==='revenues')renderLedger('receita');if(tab==='expenses')renderLedger('despesa');if(tab==='events')renderFinancialEvents();if(tab==='payables')renderCommitments('pagar');if(tab==='receivables')renderCommitments('receber');if(tab==='accounts')renderChartOfAccounts();if(tab==='cost-centers')renderCostCenters();if(tab==='budget')renderAnnualBudget();if(tab==='bank')renderBankTransactions();if(tab==='cashflow')renderCashflow();if(tab==='reports')renderReports();if(tab==='config')renderFinanceConfig();
}
function loadDuesConfigForm(year){
  const y=Number(year)||new Date().getFullYear();const cfg=configuredForYear(y)||{year:y,baseValue:180,dueDay:10,capitationValue:0,damValue:0,notes:'Mensalidade ordinária da Loja Modelo'};
  $('#duesConfigYear').value=y;$('#duesBaseValue').value=Number(cfg.baseValue||180);$('#duesDueDay').value=Number(cfg.dueDay||10);$('#duesCapitationValue').value=Number(cfg.capitationValue||0);$('#duesDamValue').value=Number(cfg.damValue||0);$('#duesConfigNotes').value=cfg.notes||'';
  renderFinanceConfig();
}
function renderFinanceConfig(){
  if(!session||!$('#duesConfigForm'))return;
  const canEdit=canEditDuesConfig();const viewAllowed=canViewAllFinance();
  $('#financeConfigTabBtn')?.classList.toggle('hidden',!viewAllowed);
  const form=$('#duesConfigForm');[...form.elements].forEach(el=>{if(el.id==='duesConfigYear'){el.disabled=false;return}el.disabled=!canEdit});
  $('#saveDuesConfigBtn').disabled=!canEdit;
  $('#duesConfigPermission').textContent=canEdit?'Edição liberada':'Somente leitura';$('#duesConfigPermission').classList.toggle('full',canEdit);
  const year=Number($('#duesConfigYear').value)||new Date().getFullYear();const storedCfg=configuredForYear(year)||{};const inputCfg=currentDuesConfigInputs();const cfg={...storedCfg,...inputCfg,year};
  const active=members.filter(m=>m.active).length,exempt=members.filter(m=>m.active&&isAnnualDuesExempt(m.id,year)).length,billable=Math.max(0,active-exempt),expected=billable*12,rows=finance.filter(f=>String(f.month).startsWith(`${year}-`));
  $('#duesActiveMembers').textContent=active;$('#duesExpectedCharges').textContent=expected;$('#duesRegisteredCharges').textContent=rows.length;$('#duesRegisteredDetail').textContent=`geradas mês a mês em ${year}`;$('#duesExpectedTotal').textContent=money(billable*12*Number(cfg.baseValue||0));$('#duesExemptCount').textContent=`${exempt} isento(s) de mensalidade`;renderDuesConfigBreakdown(cfg);renderDuesMonthlySummary(year);
  const years=[...new Set([...Object.keys(duesConfig).map(Number),year])].sort((a,b)=>b-a);
  $('#duesConfigRows').innerHTML=years.map(y=>{const c=configuredForYear(y);if(!c)return'';const count=finance.filter(f=>String(f.month).startsWith(`${y}-`)).length;return `<tr><td>${y}</td><td>${money(c.baseValue)}</td><td>${money(c.capitationValue||0)}</td><td>${money(c.damValue||0)}</td><td>${money(monthlyNetDuesPerMember(c))}</td><td>dia ${c.dueDay}</td><td>${count}</td><td><button class="action-btn" type="button" data-action="load-dues-year" data-year="${y}">Carregar</button></td></tr>`}).join('')||'<tr><td colspan="8">Nenhuma configuração anual.</td></tr>';
  renderFinanceSettingsForm();
}
window.loadDuesYear=function(year){const cfg=configuredForYear(year);$('#duesConfigYear').value=year;if(cfg){$('#duesBaseValue').value=cfg.baseValue;$('#duesDueDay').value=cfg.dueDay;$('#duesCapitationValue').value=Number(cfg.capitationValue||0);$('#duesDamValue').value=Number(cfg.damValue||0);$('#duesConfigNotes').value=cfg.notes||''}renderFinanceConfig()}

function filteredFinance(){let rows=canViewAllFinance()?finance:finance.filter(f=>f.memberId===session.memberId);const q=$('#financeSearch')?.value?.toLowerCase()||'';const status=$('#financeStatusFilter')?.value||'todos';const month=canViewAllFinance()?`${financeSelectedYear}-${financeSelectedMonth}`:($('#financeMonthFilter')?.value||'todos');return rows.filter(r=>(memberName(r.memberId).toLowerCase().includes(q)||monthLabel(r.month).toLowerCase().includes(q))&&(status==='todos'||effectiveStatus(r)===status)&&(month==='todos'||r.month===month)).sort((a,b)=>b.month.localeCompare(a.month)||memberName(a.memberId).localeCompare(memberName(b.memberId)))}
function renderFinance(){if(!session)return;if(canViewAllFinance())renderFinanceMonthTabs();const summaryYear=canViewAllFinance()?financeSelectedYear:Number((finance.find(f=>f.memberId===session.memberId)?.month||String(new Date().getFullYear())).slice(0,4));renderDuesMonthlySummary(summaryYear||new Date().getFullYear());const rows=filteredFinance();$('#financeRows').innerHTML=rows.map(r=>{const s=effectiveStatus(r);const whatsapp=canSendWhatsAppFinance()&&r.status!=='isento'?`<button class="action-btn whatsapp-action" data-action="open-whatsapp-finance" data-id="${r.id}">${r.status==='pago'?'Recibo WhatsApp':'WhatsApp'}</button>`:'';return `<tr><td><button class="action-btn member-finance-link" data-action="open-member-finance" data-member-id="${r.memberId}" data-year="${Number(r.month.slice(0,4))}">${memberName(r.memberId)}</button></td><td>${monthLabel(r.month)}</td><td>${money(r.value)}</td><td>${dateBR(r.due)}</td><td>${r.status==='pago'?`${dateBR(r.paidAt)}<br><small>${r.paymentMethod||''}</small>`:'—'}</td><td><span class="status ${s}">${statusLabel(s)}</span></td>${canManageTreasury()?`<td><div class="row-actions"><button class="action-btn" data-action="open-charge-details" data-id="${r.id}">Detalhes</button><button class="action-btn" data-action="open-charge-adjust" data-id="${r.id}">Ajustar</button><button class="action-btn" data-action="toggle-annual-exemption" data-member-id="${r.memberId}" data-year="${Number(r.month.slice(0,4))}">${isAnnualDuesExempt(r.memberId,Number(r.month.slice(0,4)))?'Remover isenção anual':'Isentar ano'}</button>${r.status==='pago'?`<button class="action-btn danger" data-action="reopen-charge" data-id="${r.id}">Estornar baixa</button><button class="action-btn" data-action="print-receipt" data-id="${r.id}">Recibo</button>`:r.status==='isento'?'':`<button class="action-btn" data-action="open-payment" data-id="${r.id}">Registrar pagamento</button>`}${whatsapp}</div></td>`:''}</tr>`}).join('')||`<tr><td colspan="7">Nenhum lançamento encontrado para esta competência.</td></tr>`;
 const selectedMonth=canViewAllFinance()?`${financeSelectedYear}-${financeSelectedMonth}`:($('#financeMonthFilter')?.value||'todos');$('#financeContext').textContent=`${rows.length} lançamento(s) exibido(s)${selectedMonth!=='todos'?` · ${monthLabel(selectedMonth)}`:''}.`;
 if(canViewAllFinance()){const scope=finance.filter(f=>f.month===selectedMonth);const rec=scope.filter(f=>f.status==='pago').reduce((s,f)=>s+(f.paidValue??f.value),0);const op=scope.filter(f=>['aberto','atrasado'].includes(effectiveStatus(f))).reduce((s,f)=>s+f.value,0);$('#receivedTotal').textContent=money(rec);$('#openTotal').textContent=money(op);const ids=[...new Set(scope.map(f=>f.memberId))];$('#paidMembers').textContent=ids.filter(id=>scope.some(f=>f.memberId===id)&&!scope.some(f=>f.memberId===id&&['aberto','atrasado'].includes(effectiveStatus(f)))).length;$('#pendingMembers').textContent=ids.filter(id=>scope.some(f=>f.memberId===id&&['aberto','atrasado'].includes(effectiveStatus(f)))).length;$('#receivedDetail').textContent=monthLabel(selectedMonth);$('#openDetail').textContent='em aberto + vencidas'}
}

window.openPayment=function(id){if(!canManageTreasury())return;const r=finance.find(x=>x.id===id);if(!r||r.status==='isento')return;$('#paymentChargeId').value=r.id;$('#paymentValue').value=r.value;const now=new Date();$('#paymentDate').value=`${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;$('#paymentSummary').innerHTML=`<strong>${memberName(r.memberId)}</strong><br>${monthLabel(r.month)} · ${money(r.value)} · vencimento ${dateBR(r.due)}`;$('#paymentDialog').showModal()}
window.reopenCharge=function(id){if(!canManageTreasury())return;const r=finance.find(x=>x.id===id);if(!r||r.status!=='pago')return;r.status='aberto';r.paidAt=null;r.paidValue=null;r.paymentMethod=null;r.receipt=null;r.bankId=null;r.updatedAt=new Date().toISOString();saveFinance();addAudit('Baixa estornada',`${memberName(r.memberId)} · ${monthLabel(r.month)}`);renderFinance();renderDashboard();renderAudit();toast('Pagamento estornado; mensalidade reaberta.')}

window.openWhatsAppFinance=function(id){
  if(!canSendWhatsAppFinance()){toast('Envio financeiro por WhatsApp disponível apenas para Venerável Mestre, Tesoureiro e Administrador.');return}
  const r=finance.find(x=>x.id===Number(id));if(!r)return;
  const member=members.find(m=>m.id===Number(r.memberId));if(!member)return;
  const profile=getMemberProfile(member);const rawPhone=profile?.phone||member.phone||'';const phone=String(rawPhone).replace(/\D/g,'');
  if(!phone){toast(`Não há celular cadastrado para ${member.name}.`);return}
  const firstName=(member.name||'Irmão').trim().split(/\s+/)[0];
  let message='';
  if(r.status==='pago'){
    message=`Olá, Irm∴ ${firstName}. A Tesouraria da Loja Modelo confirma o recebimento da mensalidade referente a ${monthLabel(r.month)}, no valor de ${money(r.paidValue??r.value)}, pago em ${dateBR(r.paidAt)}.${r.receipt?` Recibo: ${r.receipt}.`:''} Fraternalmente, Loja Modelo.`;
  }else{
    const status=effectiveStatus(r)==='atrasado'?'encontra-se vencida':'está em aberto';
    message=`Olá, Irm∴ ${firstName}. A Tesouraria da Loja Modelo informa que a mensalidade referente a ${monthLabel(r.month)}, no valor de ${money(r.value)}, com vencimento em ${dateBR(r.due)}, ${status}. Caso o pagamento já tenha sido realizado, por favor desconsidere esta mensagem. Fraternalmente, Loja Modelo.`;
  }
  const url=`https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
  addAudit(r.status==='pago'?'Recibo preparado no WhatsApp':'Cobrança preparada no WhatsApp',`${member.name} · ${monthLabel(r.month)}`);renderAudit();
  window.open(url,'_blank','noopener,noreferrer');
}
window.openDetails=function(id){const r=finance.find(x=>x.id===id);if(!r)return;const s=effectiveStatus(r);$('#chargeDetail').innerHTML=`<div class="detail-grid"><div class="detail-item"><span>Irmão</span><strong>${memberName(r.memberId)}</strong></div><div class="detail-item"><span>Competência</span><strong>${monthLabel(r.month)}</strong></div><div class="detail-item"><span>Valor lançado</span><strong>${money(r.value)}</strong></div><div class="detail-item"><span>Status</span><strong>${statusLabel(s)}</strong></div><div class="detail-item"><span>Vencimento</span><strong>${dateBR(r.due)}</strong></div><div class="detail-item"><span>Pagamento</span><strong>${dateBR(r.paidAt)}</strong></div><div class="detail-item"><span>Forma</span><strong>${r.paymentMethod||'—'}</strong></div><div class="detail-item"><span>Recibo</span><strong class="receipt-code">${r.receipt||'—'}</strong></div></div><div class="detail-item"><span>Observação</span><strong>${r.notes||'Sem observações'}</strong></div><div class="detail-item"><span>Última atualização</span><strong>${dateTimeBR(r.updatedAt)}</strong></div>`;$('#detailDialog').showModal()}

function renderAudit(){if(!canViewAllFinance())return;$('#auditRows').innerHTML=audit.slice(0,8).map(a=>`<div class="list-row"><div><strong>${a.action}</strong><span>${a.detail} · por ${a.actor}</span></div><small>${dateTimeBR(a.at)}</small></div>`).join('')||'<p>Sem movimentações registradas.</p>'}

function libraryFilteredRows(){
  let rows=docs.filter(canAccessDoc);
  const q=($('#librarySearch')?.value||'').trim().toLowerCase();
  const df=$('#libraryDegreeFilter')?.value||'todos';
  const tf=$('#libraryThemeFilter')?.value||'todos';
  const typef=$('#libraryTypeFilter')?.value||'todos';
  if(q)rows=rows.filter(d=>[d.title,d.author,d.theme,d.keywords,d.description,d.year].join(' ').toLowerCase().includes(q));
  if(df!=='todos')rows=rows.filter(d=>d.degree===df);
  if(tf!=='todos')rows=rows.filter(d=>d.theme===tf);
  if(typef!=='todos')rows=rows.filter(d=>d.type===typef);
  return rows.sort((a,b)=>(b.createdAt||'').localeCompare(a.createdAt||'')||a.title.localeCompare(b.title));
}
function fillLibraryThemeFilter(){
  const el=$('#libraryThemeFilter');if(!el||!session)return;
  const selected=el.value||'todos';
  const themes=[...new Set(docs.filter(canAccessDoc).map(d=>d.theme).filter(Boolean))].sort((a,b)=>a.localeCompare(b,'pt-BR'));
  el.innerHTML='<option value="todos">Todos os temas</option>'+themes.map(t=>`<option value="${escapeHtml(t)}">${escapeHtml(t)}</option>`).join('');
  el.value=themes.includes(selected)?selected:'todos';
}
function renderLibrary(){
  if(!session)return;
  fillLibraryThemeFilter();
  $$('#libraryDegreeFilter option').forEach(o=>{if(o.value!=='todos')o.disabled=!isAdmin()&&degreeRank[o.value]>degreeRank[session.degree]});
  const accessible=docs.filter(canAccessDoc), rows=libraryFilteredRows();
  $('#libraryAccessibleCount').textContent=accessible.length;
  $('#libraryWorkCount').textContent=accessible.filter(d=>d.type==='trabalho').length;
  $('#libraryThemeCount').textContent=new Set(accessible.map(d=>d.theme)).size;
  $('#libraryAccessDegree').textContent=isAdmin()?'Acesso total':degreeLabel[session.degree];
  $('#libraryResultCount').textContent=`${rows.length} documento(s) exibido(s)`;
  $('#libraryGrid').innerHTML=rows.map(d=>`<article class="doc-card">
    <div class="doc-card-top"><div class="doc-icon"></div><div class="doc-card-tags"><span class="tag">${degreeLabel[d.degree]}</span><span class="tag subtle">${escapeHtml(libraryTypeLabel[d.type]||'Documento')}</span></div></div>
    <h4>${escapeHtml(d.title)}</h4>
    <p class="doc-author">${escapeHtml(d.author)} · ${escapeHtml(d.theme)} · ${escapeHtml(d.year)}</p>
    <p class="doc-description">${escapeHtml(d.description||'Sem descrição cadastrada.')}</p>
    <p class="doc-keywords">${d.keywords?escapeHtml(d.keywords):'Sem palavras-chave'}</p>
    <div class="doc-meta"><small>${d.fileName?`<span class="file-badge">${escapeHtml((d.fileName.split('.').pop()||'arquivo').toUpperCase())}</span>`:'Registro do acervo'}</small><div class="doc-actions"><button class="text-btn" data-action="open-document-detail" data-id="${d.id}">Detalhes</button>${d.fileName?`<button class="text-btn" data-action="open-library-file" data-id="${d.id}">Abrir</button>`:''}</div></div>
  </article>`).join('')||'<div class="library-empty"><strong>Nenhum documento encontrado.</strong><p>Ajuste os filtros ou a pesquisa para consultar outro conteúdo do acervo.</p></div>';
}
window.openDocumentDetail=function(id){
  const d=docs.find(x=>x.id===id);if(!d||!canAccessDoc(d))return;
  $('#documentDetailTitle').textContent=d.title;
  $('#documentDetailBody').innerHTML=`<div class="document-detail-grid">
    <div class="document-detail-item"><span>Autor</span><strong>${escapeHtml(d.author)}</strong></div>
    <div class="document-detail-item"><span>Grau mínimo</span><strong>${degreeLabel[d.degree]}</strong></div>
    <div class="document-detail-item"><span>Tema</span><strong>${escapeHtml(d.theme)}</strong></div>
    <div class="document-detail-item"><span>Tipo / ano</span><strong>${escapeHtml(libraryTypeLabel[d.type]||'Documento')} · ${escapeHtml(d.year)}</strong></div>
    <div class="document-detail-item"><span>Palavras-chave</span><strong>${escapeHtml(d.keywords||'—')}</strong></div>
    <div class="document-detail-item"><span>Incluído no acervo</span><strong>${dateTimeBR(d.createdAt)}</strong></div>
  </div><div class="document-summary">${escapeHtml(d.description||'Sem descrição cadastrada.')}</div>${d.fileName?`<div class="document-file-box"><div><span>${escapeHtml(d.fileName)}</span><small>${escapeHtml(d.fileType||'Arquivo')} · ${formatBytes(d.fileSize)}</small></div><span class="file-badge">arquivo vinculado</span></div>`:'<div class="document-file-box"><div><span>Sem arquivo vinculado</span><small>Este registro demonstra a catalogação. O Administrador pode editar e anexar o arquivo correspondente.</small></div></div>'}`;
  let actions='<button class="btn ghost" type="button" data-detail-close>Fechar</button>';
  if(d.fileName)actions+=`<button class="btn ghost" type="button" data-action="download-library-file" data-id="${d.id}">Baixar</button><button class="btn primary" type="button" data-action="open-library-file" data-id="${d.id}">Abrir arquivo</button>`;
  if(isAdmin())actions+=`<button class="btn ghost" type="button" data-action="edit-library-document" data-id="${d.id}">Editar</button><button class="btn danger" type="button" data-action="remove-library-document" data-id="${d.id}">Excluir</button>`;
  $('#documentDetailActions').innerHTML=actions;
  $('#documentDetailActions [data-detail-close]')?.addEventListener('click',()=>$('#documentDetailDialog').close());
  $('#documentDetailDialog').showModal();
}
window.openLibraryFile=async function(id){
  const d=docs.find(x=>x.id===id);if(!d||!canAccessDoc(d)||!d.storageKey){toast('Este registro ainda não possui arquivo real anexado.');return}
  try{toast('Carregando arquivo do acervo...');const blob=await getLibraryFile(d);if(!blob){toast('Arquivo não encontrado.');return}const url=URL.createObjectURL(blob);window.open(url,'_blank','noopener');setTimeout(()=>URL.revokeObjectURL(url),60000)}catch(err){toast(err?.message||'Não foi possível abrir o arquivo.')}
}
window.downloadLibraryFile=async function(id){
  const d=docs.find(x=>x.id===id);if(!d||!canAccessDoc(d)||!d.storageKey)return;
  try{toast('Preparando download do acervo...');const blob=await getLibraryFile(d);if(!blob){toast('Arquivo não encontrado.');return}const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=d.fileName||'documento';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)}catch(err){toast(err?.message||'Não foi possível baixar o arquivo.')}
}
window.editLibraryDocument=function(id){
  if(!isAdmin())return;const d=docs.find(x=>x.id===id);if(!d)return;
  $('#documentDetailDialog').close();$('#docEditId').value=d.id;$('#documentDialogTitle').textContent='Editar documento';$('#docTitle').value=d.title;$('#docAuthor').value=d.author;$('#docDegree').value=d.degree;$('#docType').value=d.type;$('#docTheme').value=d.theme;$('#docYear').value=d.year;$('#docKeywords').value=d.keywords||'';$('#docDescription').value=d.description||'';$('#docFile').value='';$('#docFileHelp').textContent=d.fileName?`Arquivo atual: ${d.fileName} (${formatBytes(d.fileSize)}). Selecione outro somente para substituí-lo. Limite: 50 MB.`:'PDF, DOC/DOCX, TXT/RTF ou imagem. Limite de 50 MB por arquivo.';$('#documentDialog').showModal();
}
window.removeLibraryDocument=async function(id){
  if(!isAdmin())return;const d=docs.find(x=>x.id===id);if(!d)return;if(!confirm(`Excluir “${d.title}” do acervo?`))return;
  if(d.storageKey)try{await deleteLibraryFile(d)}catch{}docs=docs.filter(x=>x.id!==id);try{await saveDocs()}catch{}$('#documentDetailDialog').close();renderLibrary();renderDashboard();toast('Documento excluído do acervo.')
}

function todayKey(){const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`}
function eventSortKey(p){return `${p.eventDate||'9999-12-31'}T${p.eventTime||'23:59'}`}
function isAgendaItem(p){return (p.type==='sessao'||p.type==='evento')&&p.eventDate}
function nextSocialSession(){return social.filter(p=>p.type==='sessao'&&p.eventDate&&p.eventDate>=todayKey()).sort((a,b)=>eventSortKey(a).localeCompare(eventSortKey(b)))[0]||null}
function upcomingAgenda(){return social.filter(p=>isAgendaItem(p)&&p.eventDate>=todayKey()).sort((a,b)=>eventSortKey(a).localeCompare(eventSortKey(b)))}
function socialFilteredRows(){let rows=[...social];const q=($('#socialSearch')?.value||'').trim().toLowerCase();const type=$('#socialTypeFilter')?.value||'todos';if(q)rows=rows.filter(p=>[p.title,p.body,p.eventLocation,p.eventAddress,p.eventNotes].join(' ').toLowerCase().includes(q));if(type!=='todos')rows=rows.filter(p=>p.type===type);return rows.sort((a,b)=>Number(b.featured)-Number(a.featured)||(b.publishedAt||'').localeCompare(a.publishedAt||'')||(b.createdAt||'').localeCompare(a.createdAt||''))}
function socialCoverMarkup(p){const image=p.images?.[0];if(image)return `<div class="social-photo-frame ${image.url||image.path?'loaded':''}"><div class="social-photo-placeholder">70</div>${socialImageMarkup(image,p.title)}</div>`;const symbol=p.type==='sessao'?'∴':p.type==='evento'?'◇':p.type==='galeria'?'▧':'70';return `<div class="social-photo-frame social-placeholder-${p.type}"><div class="social-photo-placeholder">${symbol}</div></div>`}
function sessionDegreeChip(p){return p?.type==='sessao'&&p.sessionDegree?`<span class="session-degree-chip">${escapeHtml(sessionDegreeAbbr[p.sessionDegree]||'')}</span>`:''}
function socialEventMeta(p){if(!isAgendaItem(p))return'';return `<div class="event-mini"><strong>${dateLongBR(p.eventDate)}${p.eventTime?` · ${escapeHtml(p.eventTime)}`:''}${sessionDegreeChip(p)}</strong>${p.eventLocation?`<span>${escapeHtml(p.eventLocation)}</span>`:''}</div>`}
function renderAgenda(){const rows=upcomingAgenda(),list=$('#agendaList'),count=$('#agendaCount');if(count)count.textContent=`${rows.length} compromisso${rows.length===1?'':'s'} futuro${rows.length===1?'':'s'}`;if(!list)return;if(!rows.length){list.innerHTML='<div class="agenda-empty"><strong>Nenhum compromisso futuro cadastrado.</strong><span>Cadastre uma sessão ou evento na Área Social.</span></div>';return}list.innerHTML=rows.slice(0,8).map(p=>`<button class="agenda-item" type="button" data-action="open-social-detail" data-id="${p.id}"><div class="agenda-date"><strong>${new Date(p.eventDate+'T12:00:00').toLocaleDateString('pt-BR',{day:'2-digit'})}</strong><span>${new Date(p.eventDate+'T12:00:00').toLocaleDateString('pt-BR',{month:'short'}).replace('.','').toUpperCase()}</span></div><div class="agenda-copy"><div><span class="tag ${p.type==='sessao'?'session-tag':''}">${escapeHtml(socialTypeLabel[p.type])}</span><strong>${escapeHtml(p.title)}</strong></div><small>${p.eventTime?escapeHtml(p.eventTime)+' · ':''}${escapeHtml(p.eventLocation||'Local a definir')}</small></div><span class="agenda-arrow">›</span></button>`).join('')}
async function renderSocial(){if(!session)return;clearSocialObjectUrls();const rows=[...social].filter(p=>p.featured).sort((a,b)=>(b.publishedAt||'').localeCompare(a.publishedAt||'')||(b.createdAt||'').localeCompare(a.createdAt||'')),next=nextSocialSession();const nextCard=$('#nextSessionCard');if(next){nextCard.classList.remove('hidden');nextCard.innerHTML=`<div class="next-event-layout"><div class="event-date-block"><strong>${new Date(next.eventDate+'T12:00:00').toLocaleDateString('pt-BR',{day:'2-digit'})}</strong><span>${new Date(next.eventDate+'T12:00:00').toLocaleDateString('pt-BR',{month:'short'}).replace('.','').toUpperCase()}</span></div><div class="next-event-copy"><p class="eyebrow">Próxima sessão</p><h3>${escapeHtml(next.title)}</h3><p>${escapeHtml(next.body)}</p><div class="event-line"><span>${dateLongBR(next.eventDate)}${next.eventTime?` · ${escapeHtml(next.eventTime)}`:''}</span>${next.eventLocation?`<span>${escapeHtml(next.eventLocation)}</span>`:''}</div></div><button class="btn ghost" type="button" data-action="open-social-detail" data-id="${next.id}">Ver informações</button></div>`}else{nextCard.classList.remove('hidden');nextCard.innerHTML='<div class="next-event-layout next-session-empty"><div class="event-date-block"><strong>—</strong><span>AGENDA</span></div><div class="next-event-copy"><p class="eyebrow">Próxima sessão</p><h3>Nenhuma sessão futura cadastrada</h3><p>Quando uma nova sessão for cadastrada, ela aparecerá automaticamente aqui.</p></div></div>'}renderAgenda();const grid=$('#socialGrid'),empty=$('#socialHighlightsEmpty');if(grid)grid.innerHTML=rows.map((p,i)=>`<article class="post-card social-post-card ${i===0?'feature':''}">${socialCoverMarkup(p)}<div class="post-body"><div class="social-tags"><span class="tag ${p.type==='sessao'?'session-tag':''}">${escapeHtml(socialTypeLabel[p.type]||'Publicação')}</span><span class="tag subtle">Destaque</span>${p.images?.length?`<span class="tag subtle">${p.images.length} foto${p.images.length>1?'s':''}</span>`:''}</div><h3>${escapeHtml(p.title)}</h3><p>${escapeHtml(p.body)}</p>${socialEventMeta(p)}<div class="social-card-footer"><small>Publicado em ${dateLongBR(p.publishedAt)}</small><button class="text-btn" type="button" data-action="open-social-detail" data-id="${p.id}">Ver destaque</button></div></div></article>`).join('');if(empty)empty.classList.toggle('hidden',rows.length>0);if(grid)grid.classList.toggle('hidden',rows.length===0);if(grid&&rows.length)await hydrateSocialImages(grid)}
async function renderSocialArchive(){
  if(!session)return;
  const rows=socialFilteredRows(),grid=$('#socialAllGrid'),empty=$('#socialArchiveEmpty'),count=$('#socialArchiveCount');
  if(count)count.textContent=`${rows.length} registro${rows.length===1?'':'s'}`;
  if(!grid)return;
  grid.innerHTML=rows.map(p=>{
    const adminActions=isAdmin()?`<div class="social-admin-actions"><button class="text-btn" type="button" data-action="edit-social-post" data-id="${p.id}">Editar</button><button class="text-btn danger-text" type="button" data-action="remove-social-post" data-id="${p.id}">${p.type==='sessao'?'Excluir sessão':'Excluir'}</button></div>`:'';
    return `<article class="post-card social-post-card">${socialCoverMarkup(p)}<div class="post-body"><div class="social-tags"><span class="tag ${p.type==='sessao'?'session-tag':''}">${escapeHtml(socialTypeLabel[p.type]||'Publicação')}</span>${p.featured?'<span class="tag subtle">Destaque</span>':''}${p.images?.length?`<span class="tag subtle">${p.images.length} foto${p.images.length>1?'s':''}</span>`:''}</div><h3>${escapeHtml(p.title)}</h3><p>${escapeHtml(p.body)}</p>${socialEventMeta(p)}<div class="social-card-footer"><small>Publicado em ${dateLongBR(p.publishedAt)}</small><div class="row-actions"><button class="text-btn" type="button" data-action="open-social-detail" data-id="${p.id}">Ver detalhes</button>${adminActions}</div></div></div></article>`;
  }).join('');
  if(empty)empty.classList.toggle('hidden',rows.length>0);
  grid.classList.toggle('hidden',rows.length===0);
  if(rows.length)await hydrateSocialImages(grid);
}

function updateSocialEventFields(){const type=$('#socialType').value,isEvent=['sessao','evento'].includes(type),isSession=type==='sessao';$('#socialEventFields').classList.toggle('hidden',!isEvent);$('#socialSessionDegreeWrap')?.classList.toggle('hidden',!isSession);if($('#socialSessionDegree'))$('#socialSessionDegree').required=isSession;['socialEventDate','socialEventTime','socialEventLocation'].forEach(id=>{const el=$('#'+id);if(el)el.required=isEvent&&id==='socialEventDate'})}
function resetSocialForm(){if(!isAdmin())return;$('#socialForm').reset();$('#socialEditId').value='';$('#socialDialogTitle').textContent='Nova publicação';$('#socialPublishedAt').value=todayKey();$('#socialType').value='informacao';$('#socialTitle').placeholder='Título da publicação';$('#socialBody').placeholder='Escreva a informação, notícia, memória ou descrição do registro.';$('#saveSocialBtn').textContent='Publicar';$('#socialFeatured').checked=false;$('#socialPhotoHelp').textContent='Até 12 fotos por publicação, com no máximo 10 MB cada. No Netlify, as imagens ficam no armazenamento persistente da Área Social e são servidas pelo caminho imagens-social/.';updateSocialEventFields()}
function resetSessionForm(){if(!isAdmin())return;resetSocialForm();$('#socialDialogTitle').textContent='Cadastrar sessão';$('#socialType').value='sessao';$('#socialSessionDegree').value='aprendiz';$('#socialTitle').placeholder='Ex.: Sessão Ordinária do Grau de Aprendiz';$('#socialBody').placeholder='Informe pauta, finalidade ou breve descrição da sessão.';$('#saveSocialBtn').textContent='Cadastrar sessão';updateSocialEventFields();$('#socialEventDate').focus()}
window.openSocialDetail=async function(id){const p=social.find(x=>x.id===id);if(!p)return;clearSocialObjectUrls();$('#socialDetailTitle').textContent=p.title;const images=(p.images||[]).map(im=>`<figure class="social-detail-photo social-photo-frame ${im.url||im.path?'loaded':''}"><div class="social-photo-placeholder">70</div>${socialImageMarkup(im,p.title)}</figure>`).join('');$('#socialDetailBody').innerHTML=`<div class="social-detail-meta"><span class="tag">${escapeHtml(socialTypeLabel[p.type]||'Publicação')}</span><span>Publicado em ${dateLongBR(p.publishedAt)}</span></div>${isAgendaItem(p)?`<div class="event-detail-box"><div><span>Data</span><strong>${dateLongBR(p.eventDate)}</strong></div>${p.type==='sessao'?`<div><span>Grau</span><strong>${escapeHtml(sessionDegreeLabel[p.sessionDegree]||'Não definido')} ${escapeHtml(sessionDegreeAbbr[p.sessionDegree]||'')}</strong></div>`:''}<div><span>Horário</span><strong>${escapeHtml(p.eventTime||'A definir')}</strong></div><div><span>Local</span><strong>${escapeHtml(p.eventLocation||'A definir')}</strong></div><div><span>Endereço / referência</span><strong>${escapeHtml(p.eventAddress||'—')}</strong></div>${p.eventNotes?`<div class="event-detail-wide"><span>Informações adicionais</span><strong>${escapeHtml(p.eventNotes)}</strong></div>`:''}</div>`:''}<div class="social-detail-text">${escapeHtml(p.body).replace(/\n/g,'<br>')}</div>${images?`<div class="social-detail-gallery">${images}</div>`:'<div class="social-no-photo">Nenhuma fotografia anexada a esta publicação.</div>'}`;let actions='<button class="btn ghost" type="button" data-social-close>Fechar</button>';if(isAdmin())actions+=`<button class="btn ghost" type="button" data-action="edit-social-post" data-id="${p.id}">Editar</button><button class="btn danger" type="button" data-action="remove-social-post" data-id="${p.id}">${p.type==='sessao'?'Excluir sessão':'Excluir publicação'}</button>`;$('#socialDetailActions').innerHTML=actions;$('#socialDetailActions [data-social-close]')?.addEventListener('click',()=>$('#socialDetailDialog').close());$('#socialDetailDialog').showModal();await hydrateSocialImages($('#socialDetailBody'))}
window.editSocialPost=function(id){if(!isAdmin())return;const p=social.find(x=>x.id===id);if(!p)return;$('#socialDetailDialog').close();$('#socialEditId').value=p.id;$('#socialDialogTitle').textContent=p.type==='sessao'?'Editar sessão':'Editar publicação';$('#socialType').value=p.type;$('#socialSessionDegree').value=p.sessionDegree||'aprendiz';$('#saveSocialBtn').textContent=p.type==='sessao'?'Salvar sessão':'Salvar alterações';$('#socialPublishedAt').value=p.publishedAt;$('#socialTitle').value=p.title;$('#socialBody').value=p.body;$('#socialEventDate').value=p.eventDate||'';$('#socialEventTime').value=p.eventTime||'';$('#socialEventLocation').value=p.eventLocation||'';$('#socialEventAddress').value=p.eventAddress||'';$('#socialEventNotes').value=p.eventNotes||'';$('#socialFeatured').checked=Boolean(p.featured);$('#socialPhotos').value='';$('#socialPhotoHelp').textContent=p.images?.length?`Esta publicação possui ${p.images.length} foto(s) em imagens-social. Se selecionar novas imagens, elas substituirão as atuais.`:'Até 12 fotos por publicação, com no máximo 10 MB cada. Os uploads são gravados em imagens-social.';updateSocialEventFields();$('#socialDialog').showModal()}
window.removeSocialPost=async function(id){if(!isAdmin())return;const p=social.find(x=>x.id===id);if(!p)return;const attendance= p.type==='sessao'?attendanceRecordFor(p.id):null;const prompt=p.type==='sessao'?`Excluir a sessão “${p.title}”?\n\nEla será removida da Agenda e da Área Social.${attendance?' A frequência vinculada a esta sessão também será excluída.':''} Esta ação deve ser usada quando a sessão foi cadastrada por engano, cancelada ou não aconteceu.`:`Excluir “${p.title}” da Área Social?`;if(!confirm(prompt))return;if(p.type==='sessao'&&attendance){try{const response=await fetch(`/api/attendance-data?sessionId=${encodeURIComponent(p.id)}`,{method:'DELETE',cache:'no-store'});if(!response.ok)throw new Error('Falha ao excluir a frequência vinculada.');attendanceRecords=attendanceRecords.filter(r=>Number(r.sessionId)!==Number(p.id))}catch(err){toast(err.message||'Não foi possível excluir a frequência desta sessão.');return}}for(const im of p.images||[]){try{await deleteSocialImage(im)}catch{}}social=social.filter(x=>x.id!==id);try{await saveSocial()}catch{toast('O registro foi removido localmente, mas houve falha ao sincronizar o servidor.')}$('#socialDetailDialog').close();await renderSocial();await renderSocialArchive();renderDashboard();renderAttendance();toast(p.type==='sessao'?'Sessão excluída da agenda e da frequência.':'Publicação excluída da Área Social.')}

function memberProfileDefaults(member){
  return {
    name:member.name,preferredName:'',phone:member.phone,altPhone:'',email:'',birthDate:'',profession:'',maritalStatus:'',
    active:member.active,lodge:member.lodge,degree:member.degree,installedMaster:Boolean(member.installedMaster),
    address:{cep:'',street:'',number:'',complement:'',neighborhood:'',city:'',state:''},
    emergency:{name:'',relation:'',phone:''},
    masonic:{initiationDate:'',passingDate:'',raisingDate:''},
    relatives:[],notes:'',updatedAt:null,updatedBy:null
  };
}
function getMemberProfile(member){
  const d=memberProfileDefaults(member),p=memberProfiles[member.matricula]||{};
  return {...d,...p,installedMaster:Boolean(member.installedMaster),address:{...d.address,...(p.address||{})},emergency:{...d.emergency,...(p.emergency||{})},masonic:{...d.masonic,...(p.masonic||{})},relatives:Array.isArray(p.relatives)?p.relatives:[]};
}
function saveMemberProfiles(){localStorage.setItem('portalMaconicoMemberProfilesV1',JSON.stringify(memberProfiles))}
function canViewPrivateMember(member){return Boolean(session&&(isAdmin()||session.matricula===member.matricula))}
function canEditPrivateMember(){return isAdmin()}
function profileSearchText(member){const p=getMemberProfile(member);return [member.name,member.matricula,member.phone,member.masonicOffice,member.office,p.email,p.profession,p.preferredName].join(' ').toLowerCase()}
function filteredMembers(){let rows=[...members];const q=($('#memberSearch')?.value||'').trim().toLowerCase();const degree=$('#memberDegreeFilter')?.value||'todos';if(q)rows=rows.filter(m=>profileSearchText(m).includes(q));if(degree!=='todos')rows=rows.filter(m=>m.degree===degree);return rows.sort((a,b)=>a.name.localeCompare(b.name,'pt-BR'))}
function renderMembers(){
  const rows=filteredMembers();
  $('#memberTotal').textContent=members.filter(m=>m.active).length;
  $('#memberMasters').textContent=members.filter(m=>m.active&&m.degree==='mestre').length;
  $('#memberCompanions').textContent=members.filter(m=>m.active&&m.degree==='companheiro').length;
  $('#memberApprentices').textContent=members.filter(m=>m.active&&m.degree==='aprendiz').length;
  $('#memberResultCount').textContent=`${rows.length} irmão(s) exibido(s).`;
  $('#membersGrid').innerHTML=rows.map(m=>{
    const p=getMemberProfile(m),privateAllowed=canViewPrivateMember(m),editable=canEditPrivateMember();
    return `<div class="member-card detailed-card ${m.active?'':'member-inactive'}"><div class="avatar">${m.initials}</div><div class="member-card-copy"><div class="member-name-line"><strong>${escapeHtml(m.name)}</strong><span class="tag subtle">${memberDegreeAbbr(m)}</span></div><span>${memberDegreeLabel(m)} · Matrícula ${m.matricula}</span><span>${escapeHtml(m.phone||'Telefone não informado')}</span>${p.email?`<span>${escapeHtml(p.email)}</span>`:''}${m.masonicOffice&&m.masonicOffice!=='Sem cargo'?`<span class="member-office">${escapeHtml(m.masonicOffice)}</span>`:''}${!m.active?'<span class="member-inactive-label">Cadastro inativo</span>':''}<div class="member-card-actions">${privateAllowed?`<button class="text-btn" type="button" data-action="open-member-profile" data-matricula="${m.matricula}" data-mode="view">Ver ficha</button>`:''}${editable?`<button class="text-btn" type="button" data-action="open-member-profile" data-matricula="${m.matricula}" data-mode="edit">Editar cadastro</button>`:''}</div></div></div>`
  }).join('')||'<div class="library-empty">Nenhum irmão encontrado.</div>';
}
function managementOfficerRows(rows=[]){return rows.map(([name,office,note])=>`<div class="management-person"><div><strong>${escapeHtml(name)}</strong><span>${escapeHtml(office)}</span></div>${note?`<small>${escapeHtml(note)}</small>`:''}</div>`).join('')}
function managementVenerable(item){return item.elected.find(([,office])=>office==='Venerável Mestre')?.[0]||'—'}
function renderManagements(){
  const grid=$('#managementGrid');if(!grid)return;
  const q=normalizeText($('#managementSearch')?.value||'');
  const rows=historicalManagements.filter(item=>{
    if(!q)return true;
    const blob=[item.period,...item.elected.flat(),...(item.appointed||[]).flat(),...(item.updates||[]).flat()].join(' ');
    return normalizeText(blob).includes(q);
  });
  const uniquePeople=new Set(historicalManagements.flatMap(item=>[...item.elected,...(item.appointed||[]),...(item.updates||[])].map(r=>r[0])));
  $('#managementCount').textContent=historicalManagements.length;
  $('#managementPeopleCount').textContent=uniquePeople.size;
  $('#managementResultCount').textContent=`${rows.length} gestão(ões) exibida(s).`;
  grid.innerHTML=rows.map(item=>{
    const vm=managementVenerable(item),isCurrent=item.period==='2025/2026',updates=item.updates?.length?`<div class="management-update-block"><h4>Alterações registradas</h4><div class="management-people">${managementOfficerRows(item.updates)}</div></div>`:'';
    return `<article class="management-card ${isCurrent?'management-current':''}"><div class="management-card-head"><div class="management-period"><strong>${escapeHtml(item.period)}</strong>${isCurrent?'<span class="tag">Gestão atual</span>':''}</div><span class="management-count">${item.elected.length+(item.appointed?.length||0)} cargos</span></div><div class="management-vm"><span>Venerável Mestre</span><strong>${escapeHtml(vm)}</strong></div><details class="management-details"><summary>Ver composição completa</summary><div class="management-columns"><section><h4>Eleitos</h4><div class="management-people">${managementOfficerRows(item.elected)}</div></section><section><h4>Nomeados</h4><div class="management-people">${managementOfficerRows(item.appointed||[])||'<div class="management-empty">Nenhum nomeado registrado nesta relação.</div>'}</div>${updates}</section></div></details></article>`;
  }).join('')||'<div class="library-empty"><strong>Nenhuma gestão encontrada.</strong><p>Tente outro nome, cargo ou período.</p></div>';
}

function fillMembers(){const el=$('#chargeMember');if(!el)return;el.innerHTML=members.filter(m=>m.active).sort((a,b)=>a.name.localeCompare(b.name,'pt-BR')).map(m=>`<option value="${m.id}">${escapeHtml(m.name)} · ${m.matricula}</option>`).join('')}
function fillAccessOfficeFilter(){
  const el=$('#accessOfficeFilter');if(!el)return;
  const selected=el.value||'todos';
  el.innerHTML='<option value="todos">Todos os cargos</option>'+masonicOfficeOptions.map(o=>`<option value="${escapeHtml(o)}">${escapeHtml(o)}</option>`).join('');
  el.value=masonicOfficeOptions.includes(selected)?selected:'todos';
}
function filteredAccessMembers(){let rows=[...members];const q=($('#accessSearch')?.value||'').trim().toLowerCase();const office=$('#accessOfficeFilter')?.value||'todos';if(q)rows=rows.filter(m=>[m.name,m.matricula,m.masonicOffice,m.office].join(' ').toLowerCase().includes(q));if(office!=='todos')rows=rows.filter(m=>m.masonicOffice===office);return rows.sort((a,b)=>a.name.localeCompare(b.name,'pt-BR'))}
function renderAccessManagement(){
  const body=$('#accessRows');if(!body||!isAdmin())return;const rows=filteredAccessMembers();
  body.innerHTML=rows.map(m=>`<tr><td>${m.matricula}</td><td><strong>${escapeHtml(m.name)}</strong>${m.installedMaster?'<br><span class="tag subtle">M∴I∴</span>':''}</td><td><select class="office-select degree-select" data-change-action="save-member-degree" data-matricula="${m.matricula}"><option value="aprendiz" ${m.degree==='aprendiz'?'selected':''}>Aprendiz · A∴M∴</option><option value="companheiro" ${m.degree==='companheiro'?'selected':''}>Companheiro · C∴M∴</option><option value="mestre" ${m.degree==='mestre'?'selected':''}>Mestre · M∴M∴</option></select></td><td><select class="office-select cargo-select" data-change-action="save-member-office" data-matricula="${m.matricula}">${masonicOfficeOptions.map(o=>`<option value="${escapeHtml(o)}" ${m.masonicOffice===o?'selected':''}>${escapeHtml(o)}</option>`).join('')}</select></td><td><select class="office-select portal-select" data-change-action="save-member-portal-access" data-matricula="${m.matricula}"><option value="padrao" ${!m.portalAdmin?'selected':''}>Padrão pelo cargo</option><option value="admin" ${m.portalAdmin?'selected':''}>Administrador do portal</option></select></td><td><span class="access-level ${fullAccessOffices.has(m.office)?'full':''}">${escapeHtml(accessLevelFor(m))}</span></td><td><button class="text-btn" type="button" data-action="reset-member-password" data-matricula="${m.matricula}">Redefinir</button></td></tr>`).join('')||'<tr><td colspan="7">Nenhum irmão encontrado.</td></tr>';
}
window.saveMemberMasonicOffice=saveMemberMasonicOffice;
window.saveMemberPortalAccess=saveMemberPortalAccess;
window.saveMemberDegree=saveMemberDegree;
window.resetMemberPassword=async function(matricula){
  if(!isAdmin())return;const member=members.find(m=>m.matricula===String(matricula));if(!member)return;if(!confirm(`Redefinir a senha de ${member.name} para a senha provisória? No próximo acesso ele será obrigado a criar uma nova senha.`))return;
  try{const response=await fetch('/api/auth-users',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({matricula,resetPassword:true}),cache:'no-store'});let data={};try{data=await response.json()}catch{}if(!response.ok)throw new Error(data.error||'Não foi possível redefinir a senha.');alert('Senha temporária (mostrada somente agora): '+data.temporaryPassword)}catch(err){toast(err.message||'Falha ao redefinir a senha.')}
};

function setProfileFormEditable(editable){
  $$('#memberProfileForm input:not([type="hidden"]),#memberProfileForm select,#memberProfileForm textarea').forEach(el=>{if(el.id==='profileMatriculaDisplay'||el.id==='profileOfficeDisplay')el.disabled=true;else el.disabled=!editable});
  $('#saveMemberProfileBtn').classList.toggle('hidden',!editable);
  $('#addRelativeBtn').classList.toggle('hidden',!editable);
  $$('#relativesList [data-remove-relative]').forEach(btn=>btn.classList.toggle('hidden',!editable));
}
function relativeRowMarkup(relative={},index=0,editable=true){
  return `<div class="relative-row" data-relative-row><div class="relative-row-grid"><label>Nome<input data-relative="name" value="${escapeHtml(relative.name||'')}" ${editable?'':'disabled'} /></label><label>Parentesco<input data-relative="relation" value="${escapeHtml(relative.relation||'')}" placeholder="Ex.: filho, esposa, mãe" ${editable?'':'disabled'} /></label><label>Telefone<input data-relative="phone" type="tel" value="${escapeHtml(relative.phone||'')}" ${editable?'':'disabled'} /></label><label>Data de nascimento<input data-relative="birthDate" type="date" value="${escapeHtml(relative.birthDate||'')}" ${editable?'':'disabled'} /></label><label class="relative-notes">Observação<input data-relative="notes" value="${escapeHtml(relative.notes||'')}" ${editable?'':'disabled'} /></label></div><button class="icon-btn relative-remove ${editable?'':'hidden'}" type="button" data-remove-relative title="Remover familiar">×</button></div>`;
}
function renderRelatives(relatives=[],editable=true){
  const list=$('#relativesList');
  list.innerHTML=relatives.length?relatives.map((r,i)=>relativeRowMarkup(r,i,editable)).join(''):`<div class="relatives-empty">Nenhum familiar ou parente cadastrado.</div>`;
  list.querySelectorAll('[data-remove-relative]').forEach(btn=>btn.addEventListener('click',()=>{btn.closest('[data-relative-row]')?.remove();if(!list.querySelector('[data-relative-row]'))list.innerHTML='<div class="relatives-empty">Nenhum familiar ou parente cadastrado.</div>'}));
}
window.openNewMember=function(){
  if(!isAdmin())return;
  $('#memberProfileForm').reset();
  $('#memberProfileMatricula').value='__NEW__';
  $('#memberProfileTitle').textContent='Cadastrar novo irmão';
  $('#profileName').value='';$('#profilePreferredName').value='';$('#profileMatriculaDisplay').value='';$('#profileMatriculaDisplay').placeholder='Número da matrícula';
  $('#profileBirthDate').value='';$('#profilePhone').value='';$('#profileAltPhone').value='';$('#profileEmail').value='';$('#profileProfession').value='';$('#profileMaritalStatus').value='';$('#profileActive').value='true';
  $('#profileCep').value='';$('#profileStreet').value='';$('#profileNumber').value='';$('#profileComplement').value='';$('#profileNeighborhood').value='';$('#profileCity').value='';$('#profileState').value='';
  $('#profileLodge').value='70';$('#profileDegree').value='aprendiz';$('#profileInstalledMaster').checked=false;$('#profileInitiationDate').value='';$('#profilePassingDate').value='';$('#profileRaisingDate').value='';$('#profileOfficeDisplay').value='Sem cargo';
  $('#profileEmergencyName').value='';$('#profileEmergencyRelation').value='';$('#profileEmergencyPhone').value='';$('#profileNotes').value='';$('#profileUpdatedInfo').textContent='Novo cadastro. A matrícula será usada como login do irmão.';
  renderRelatives([],true);setProfileFormEditable(true);$('#profileInstalledMaster').disabled=true;$('#profileMatriculaDisplay').disabled=false;$('#profileMatriculaDisplay').required=true;$('#saveMemberProfileBtn').textContent='Cadastrar irmão';$('#memberProfileDialog').showModal();
}
window.openMemberProfile=function(matricula,mode='view'){
  const member=members.find(m=>m.matricula===String(matricula));if(!member||!canViewPrivateMember(member))return;
  const editable=mode==='edit'&&canEditPrivateMember();const p=getMemberProfile(member);$('#profileMatriculaDisplay').required=false;$('#saveMemberProfileBtn').textContent='Salvar ficha';
  $('#memberProfileMatricula').value=member.matricula;$('#memberProfileTitle').textContent=editable?`Editar ficha · ${member.name}`:`Ficha individual · ${member.name}`;
  $('#profileName').value=p.name||member.name;$('#profilePreferredName').value=p.preferredName||'';$('#profileMatriculaDisplay').value=member.matricula;$('#profileBirthDate').value=p.birthDate||'';$('#profilePhone').value=p.phone||'';$('#profileAltPhone').value=p.altPhone||'';$('#profileEmail').value=p.email||'';$('#profileProfession').value=p.profession||'';$('#profileMaritalStatus').value=p.maritalStatus||'';$('#profileActive').value=String(p.active!==false);
  $('#profileCep').value=p.address.cep||'';$('#profileStreet').value=p.address.street||'';$('#profileNumber').value=p.address.number||'';$('#profileComplement').value=p.address.complement||'';$('#profileNeighborhood').value=p.address.neighborhood||'';$('#profileCity').value=p.address.city||'';$('#profileState').value=p.address.state||'';
  $('#profileLodge').value=p.lodge||70;$('#profileDegree').value=p.degree||member.degree;$('#profileInstalledMaster').checked=Boolean(p.installedMaster??member.installedMaster);$('#profileInitiationDate').value=p.masonic.initiationDate||'';$('#profilePassingDate').value=p.masonic.passingDate||'';$('#profileRaisingDate').value=p.masonic.raisingDate||'';$('#profileOfficeDisplay').value=member.masonicOffice||'Sem cargo';
  $('#profileEmergencyName').value=p.emergency.name||'';$('#profileEmergencyRelation').value=p.emergency.relation||'';$('#profileEmergencyPhone').value=p.emergency.phone||'';$('#profileNotes').value=p.notes||'';
  $('#profileUpdatedInfo').textContent=p.updatedAt?`Última atualização: ${dateTimeBR(p.updatedAt)} · por ${p.updatedBy||'—'}`:'Ficha ainda não complementada.';
  renderRelatives(p.relatives||[],editable);setProfileFormEditable(editable);$('#profileInstalledMaster').disabled=!editable||$('#profileDegree').value!=='mestre';$('#memberProfileDialog').showModal();
}
function collectRelatives(){return [...$('#relativesList').querySelectorAll('[data-relative-row]')].map(row=>({name:row.querySelector('[data-relative="name"]')?.value.trim()||'',relation:row.querySelector('[data-relative="relation"]')?.value.trim()||'',phone:row.querySelector('[data-relative="phone"]')?.value.trim()||'',birthDate:row.querySelector('[data-relative="birthDate"]')?.value||'',notes:row.querySelector('[data-relative="notes"]')?.value.trim()||''})).filter(r=>r.name||r.relation||r.phone||r.birthDate||r.notes)}


function closeParentDialog(button){
  const dialog=button.closest('dialog');
  if(dialog?.open) dialog.close();
}
function nextAvailableMonthForMember(memberId){
  const existing=new Set(finance.filter(f=>f.memberId===memberId).map(f=>f.month));
  const d=new Date();
  let y=d.getFullYear(), m=d.getMonth()+1;
  for(let i=0;i<36;i++){
    const key=`${y}-${String(m).padStart(2,'0')}`;
    if(!existing.has(key)) return key;
    m++; if(m===13){m=1;y++;}
  }
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
}
function dueForMonth(month,day=10){
  return `${month}-${String(day).padStart(2,'0')}`;
}
function prepareChargeForm(){
  if(!canManageTreasury())return;
  const memberId=+$('#chargeMember').value || members.find(m=>m.active)?.id;
  if(memberId) $('#chargeMember').value=String(memberId);
  const month=nextAvailableMonthForMember(memberId);
  $('#chargeMonth').value=month;
  const cfg=configuredForYear(Number(month.slice(0,4)));
  $('#chargeDue').value=dueForMonth(month,cfg?.dueDay||10);
  $('#chargeValue').value=cfg?.baseValue||180;
  $('#chargeNotes').value='';
  validateChargeDuplicate();
}
function validateChargeDuplicate(){
  const memberId=+$('#chargeMember')?.value;
  const month=$('#chargeMonth')?.value;
  const duplicate=Boolean(memberId&&month&&finance.some(f=>f.memberId===memberId&&f.month===month));
  const help=$('#chargeDuplicateHelp'), btn=$('#saveChargeBtn');
  if(help){
    help.textContent=duplicate?'Já existe uma mensalidade desta competência para este irmão. Escolha outra competência.':'O sistema não permite duas mensalidades da mesma competência para o mesmo irmão.';
    help.classList.toggle('form-error',duplicate);
  }
  if(btn){btn.disabled=duplicate;btn.title=duplicate?'Competência já lançada para este irmão.':'';}
  return !duplicate;
}
function exportCSV(){if(!canViewAllFinance())return;const rows=filteredFinance();const head=['Irmão','Competência','Valor','Vencimento','Status','Data pagamento','Valor recebido','Forma','Recibo','Observação'];const data=rows.map(r=>[memberName(r.memberId),monthLabel(r.month),r.value.toFixed(2).replace('.',','),dateBR(r.due),statusLabel(effectiveStatus(r)),dateBR(r.paidAt),r.paidValue?Number(r.paidValue).toFixed(2).replace('.',','):'',r.paymentMethod||'',r.receipt||'',r.notes||'']);const esc=v=>`"${String(v).replaceAll('"','""')}"`;const csv='\ufeff'+[head,...data].map(row=>row.map(esc).join(';')).join('\n');const blob=new Blob([csv],{type:'text/csv;charset=utf-8'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=`portalMaconico-mensalidades-${new Date().toISOString().slice(0,10)}.csv`;a.click();URL.revokeObjectURL(url);addAudit('Relatório exportado',`${rows.length} lançamento(s) em CSV`);renderAudit();toast('Relatório CSV gerado.')}

$$('[data-close-dialog]').forEach(b=>b.addEventListener('click',()=>closeParentDialog(b)));

function attendanceRecordFor(sessionId){return attendanceRecords.find(r=>Number(r.sessionId)===Number(sessionId))||null}
function attendanceSessions(){return social.filter(p=>p.type==='sessao'&&p.eventDate).sort((a,b)=>(b.eventDate+(b.eventTime||'')).localeCompare(a.eventDate+(a.eventTime||'')))}
function attendanceSelectedYear(){return attendanceManagerPage==='indicators'?($('#attendanceSummaryYearFilter')?.value||$('#attendanceYearFilter')?.value||'todos'):($('#attendanceYearFilter')?.value||$('#attendanceSummaryYearFilter')?.value||'todos')}
function attendanceFinalizedRecords(){const y=attendanceSelectedYear();return attendanceRecords.filter(r=>r.finalized&&(y==='todos'||String(r.sessionDate||'').startsWith(y)))}
function attendanceEligibleMembersFor(sessionPost,record=null){
  if(record?.finalized&&Array.isArray(record.eligibleMembers)&&record.eligibleMembers.length)return record.eligibleMembers;
  if(!sessionPost?.sessionDegree)return[];
  return members.filter(m=>m.active&&degreeRank[m.degree]>=degreeRank[sessionPost.sessionDegree]).map(m=>({memberId:Number(m.id),matricula:String(m.matricula),name:m.name,degree:m.degree,installedMaster:Boolean(m.installedMaster)}));
}
function attendanceRuleText(degree){
  if(degree==='mestre')return'Sessão de Mestre: somente Mestres e Mestres Instalados entram no cálculo. Aprendizes e Companheiros não recebem falta.';
  if(degree==='companheiro')return'Sessão de Companheiro: Companheiros e Mestres entram no cálculo. Aprendizes não recebem falta.';
  return'Sessão de Aprendiz: todos os irmãos ativos podem participar e entram no cálculo da frequência.';
}
function attendancePercentClass(p){return p>=75?'good':p>=50?'mid':'low'}
function renderAttendance(){
  if(!session)return;
  const manager=canManageAttendance();$('#attendanceManagerArea')?.classList.toggle('hidden',!manager);$('#attendanceOwnArea')?.classList.toggle('hidden',manager);$('#attendanceManagerNav')?.classList.toggle('hidden',!manager);
  if(manager)renderAttendanceManager();else renderOwnAttendance();
}
function setAttendanceManagerPage(page){attendanceManagerPage=page==='indicators'?'indicators':'call';$('#attendanceCallPage')?.classList.toggle('hidden',attendanceManagerPage!=='call');$('#attendanceIndicatorsPage')?.classList.toggle('hidden',attendanceManagerPage!=='indicators');$('#attendanceGoCall')?.classList.toggle('primary',attendanceManagerPage==='call');$('#attendanceGoCall')?.classList.toggle('ghost',attendanceManagerPage!=='call');$('#attendanceGoIndicators')?.classList.toggle('primary',attendanceManagerPage==='indicators');$('#attendanceGoIndicators')?.classList.toggle('ghost',attendanceManagerPage!=='indicators');}
function renderAttendanceManager(){
  const yearEl=$('#attendanceYearFilter'),summaryYearEl=$('#attendanceSummaryYearFilter'),sessions=attendanceSessions(),years=[...new Set(sessions.map(p=>String(p.eventDate).slice(0,4)))].sort((a,b)=>b.localeCompare(a));
  const prior=yearEl?.value||summaryYearEl?.value||String(new Date().getFullYear()),resolved=(prior==='todos'||years.includes(prior))?prior:(years.includes(String(new Date().getFullYear()))?String(new Date().getFullYear()):'todos'),options='<option value="todos">Todos os anos</option>'+years.map(y=>`<option value="${y}">${y}</option>`).join('');
  if(yearEl){yearEl.innerHTML=options;yearEl.value=resolved}if(summaryYearEl){summaryYearEl.innerHTML=options;summaryYearEl.value=resolved}
  setAttendanceManagerPage(attendanceManagerPage);renderAttendanceSessionList();renderAttendanceCall();renderAttendanceSummary();
}
function renderAttendanceSessionList(){
  const list=$('#attendanceSessionList');if(!list)return;const y=attendanceSelectedYear(),q=($('#attendanceSessionSearch')?.value||'').trim().toLowerCase();
  const rows=attendanceSessions().filter(p=>(y==='todos'||String(p.eventDate).startsWith(y))&&(!q||`${p.title} ${p.eventLocation||''}`.toLowerCase().includes(q)));
  if(!rows.length){list.innerHTML='<div class="attendance-no-records">Nenhuma sessão encontrada para este filtro.</div>';return}
  list.innerHTML=rows.map(p=>{const r=attendanceRecordFor(p.id),d=new Date(p.eventDate+'T12:00:00'),degree=p.sessionDegree?`${sessionDegreeAbbr[p.sessionDegree]} · ${sessionDegreeLabel[p.sessionDegree]}`:'Grau não definido',state=r?.finalized?'Finalizada':r?'Em edição':'Sem chamada';return `<button type="button" class="attendance-session-item ${Number(attendanceSelectedSessionId)===Number(p.id)?'active':''}" data-attendance-session="${p.id}"><span class="attendance-session-date"><strong>${String(d.getDate()).padStart(2,'0')}</strong><span>${d.toLocaleDateString('pt-BR',{month:'short'}).replace('.','').toUpperCase()}</span></span><span class="attendance-session-copy"><strong>${escapeHtml(p.title)}</strong><span>${escapeHtml(degree)}${p.eventTime?` · ${escapeHtml(p.eventTime)}`:''}</span></span><span class="attendance-session-state ${r?.finalized?'final':r?'draft':''}">${state}</span></button>`}).join('');
  list.querySelectorAll('[data-attendance-session]').forEach(b=>b.addEventListener('click',()=>selectAttendanceSession(Number(b.dataset.attendanceSession))));
}
function selectAttendanceSession(id){
  const p=social.find(x=>Number(x.id)===Number(id)&&x.type==='sessao');if(!p)return;attendanceManagerPage='call';setAttendanceManagerPage('call');attendanceSelectedSessionId=Number(id);const r=attendanceRecordFor(id);attendanceWorkingPresent=new Set(r?.presentMatriculas||[]);attendanceWorkingFinalized=Boolean(r?.finalized);renderAttendanceSessionList();renderAttendanceCall();
}
function renderAttendanceCall(){
  const empty=$('#attendanceCallEmpty'),area=$('#attendanceCallArea'),p=social.find(x=>Number(x.id)===Number(attendanceSelectedSessionId)&&x.type==='sessao');if(!empty||!area)return;
  if(!p){empty.classList.remove('hidden');area.classList.add('hidden');return}empty.classList.add('hidden');area.classList.remove('hidden');
  $('#attendanceCallTitle').textContent=p.title;$('#attendanceCallMeta').textContent=`${dateLongBR(p.eventDate)}${p.eventTime?' · '+p.eventTime:''}${p.eventLocation?' · '+p.eventLocation:''}`;$('#attendanceCallEyebrow').textContent=p.sessionDegree?`Sessão de ${sessionDegreeLabel[p.sessionDegree]} · ${sessionDegreeAbbr[p.sessionDegree]}`:'Grau da sessão não definido';
  const record=attendanceRecordFor(p.id),eligible=attendanceEligibleMembersFor(p,record),present=[...attendanceWorkingPresent].filter(m=>eligible.some(e=>e.matricula===m)),absent=Math.max(0,eligible.length-present.length),percent=eligible.length?Math.round(present.length/eligible.length*100):0;
  $('#attendanceEligibleCount').textContent=eligible.length;$('#attendanceSelectedPresent').textContent=present.length;$('#attendanceSelectedAbsent').textContent=absent;$('#attendanceSelectedPercent').textContent=`${percent}%`;
  $('#attendanceDegreeRule').textContent=p.sessionDegree?`${attendanceRuleText(p.sessionDegree)} ${Math.max(0,members.filter(m=>m.active).length-eligible.length)} irmão(s) ficam fora desta chamada por grau.`:'Edite o cadastro desta sessão e informe o grau antes de realizar a chamada.';
  const status=$('#attendanceCallStatus');status.textContent=attendanceWorkingFinalized?'Finalizada':'Em edição';status.className=`status ${attendanceWorkingFinalized?'pago':'aberto'}`;
  const save=$('#attendanceSaveDraft'),finalBtn=$('#attendanceFinalize');if(save)save.classList.toggle('hidden',attendanceWorkingFinalized);if(finalBtn){finalBtn.textContent=attendanceWorkingFinalized?'Reabrir chamada':'Finalizar frequência';finalBtn.disabled=!p.sessionDegree}
  $('#attendanceMarkAll').disabled=attendanceWorkingFinalized||!p.sessionDegree;$('#attendanceClearAll').disabled=attendanceWorkingFinalized||!p.sessionDegree;
  renderAttendanceMemberGrid(eligible);
}
function renderAttendanceMemberGrid(eligibleOverride=null){
  const p=social.find(x=>Number(x.id)===Number(attendanceSelectedSessionId)&&x.type==='sessao'),grid=$('#attendanceMemberGrid');if(!p||!grid)return;const record=attendanceRecordFor(p.id),eligible=eligibleOverride||attendanceEligibleMembersFor(p,record),q=($('#attendanceMemberSearch')?.value||'').trim().toLowerCase();
  const rows=eligible.filter(m=>!q||`${m.name} ${m.matricula}`.toLowerCase().includes(q)).sort((a,b)=>a.name.localeCompare(b.name,'pt-BR'));
  if(!p.sessionDegree){grid.innerHTML='<div class="attendance-no-records">Esta sessão ainda não possui grau definido.</div>';return}
  grid.innerHTML=rows.map(m=>{const present=attendanceWorkingPresent.has(String(m.matricula)),label=m.degree==='mestre'&&m.installedMaster?'M∴I∴':sessionDegreeAbbr[m.degree];return `<button type="button" class="attendance-member-btn ${present?'present':''}" data-attendance-member="${escapeHtml(m.matricula)}" ${attendanceWorkingFinalized?'disabled':''}><span class="attendance-check">✓</span><span class="attendance-member-name"><strong>${escapeHtml(m.name)}</strong><span>Matrícula ${escapeHtml(m.matricula)}</span></span><small>${label}</small></button>`}).join('')||'<div class="attendance-no-records">Nenhum irmão encontrado.</div>';
  grid.querySelectorAll('[data-attendance-member]').forEach(b=>b.addEventListener('click',()=>{if(attendanceWorkingFinalized)return;const mat=String(b.dataset.attendanceMember);if(attendanceWorkingPresent.has(mat))attendanceWorkingPresent.delete(mat);else attendanceWorkingPresent.add(mat);renderAttendanceCall()}));
}
async function persistAttendance(finalized){
  const p=social.find(x=>Number(x.id)===Number(attendanceSelectedSessionId)&&x.type==='sessao');if(!p)return;if(!p.sessionDegree){toast('Defina primeiro o grau da sessão.');return}
  if(finalized&&p.eventDate>todayKey()){toast('A frequência só pode ser finalizada no dia da sessão ou depois dela.');return}
  try{const rec=await saveAttendanceSession(p,finalized);if(!rec)return;attendanceWorkingFinalized=Boolean(rec.finalized);attendanceWorkingPresent=new Set(rec.presentMatriculas||[]);renderAttendance();toast(finalized?'Frequência finalizada.':'Chamada salva. As faltas ainda não foram computadas.')}catch(err){toast(err.message||'Falha ao salvar a frequência.')}
}
function renderAttendanceSummary(){
  const records=attendanceFinalizedRecords(),q=($('#attendanceSummarySearch')?.value||'').trim().toLowerCase(),rows=members.filter(m=>m.active&&(!q||`${m.name} ${m.matricula}`.toLowerCase().includes(q))).sort((a,b)=>a.name.localeCompare(b.name,'pt-BR'));
  let totalPossible=0,totalPresent=0;for(const r of records){totalPossible+=(r.eligibleMembers||[]).length;totalPresent+=(r.presentMatriculas||[]).length}const totalAbsent=Math.max(0,totalPossible-totalPresent),avg=totalPossible?Math.round(totalPresent/totalPossible*100):0;
  $('#attendanceSessionCount').textContent=records.length;$('#attendancePresentCount').textContent=totalPresent;$('#attendanceAbsentCount').textContent=totalAbsent;$('#attendanceAverage').textContent=`${avg}%`;
  $('#attendanceSummaryRows').innerHTML=rows.map(m=>{const eligible=records.filter(r=>(r.eligibleMembers||[]).some(e=>String(e.matricula)===String(m.matricula))),present=eligible.filter(r=>(r.presentMatriculas||[]).includes(String(m.matricula))).length,absent=eligible.length-present,pct=eligible.length?Math.round(present/eligible.length*100):0;return `<tr><td><strong>${escapeHtml(m.name)}</strong><br><small>Matrícula ${escapeHtml(m.matricula)}</small></td><td>${memberDegreeAbbr(m)} · ${escapeHtml(memberDegreeLabel(m))}</td><td>${eligible.length}</td><td>${present}</td><td>${absent}</td><td><span class="attendance-percent ${attendancePercentClass(pct)}">${pct}%</span></td></tr>`}).join('');
}
function renderOwnAttendance(){
  const rows=[...attendanceRecords].filter(r=>r.finalized).sort((a,b)=>String(b.sessionDate).localeCompare(String(a.sessionDate))),present=rows.filter(r=>r.present).length,absent=rows.length-present,pct=rows.length?Math.round(present/rows.length*100):0;
  $('#ownAttendanceEligible').textContent=rows.length;$('#ownAttendancePresent').textContent=present;$('#ownAttendanceAbsent').textContent=absent;$('#ownAttendancePercent').textContent=`${pct}%`;
  const history=$('#ownAttendanceHistory');if(!history)return;history.innerHTML=rows.map(r=>`<div class="attendance-own-row"><span class="date">${dateBR(r.sessionDate)}</span><div><strong>${escapeHtml(r.sessionTitle)}</strong><span>${escapeHtml(sessionDegreeLabel[r.sessionDegree]||r.sessionDegree)} · ${escapeHtml(sessionDegreeAbbr[r.sessionDegree]||'')}</span></div><span class="attendance-own-status ${r.present?'present':'absent'}">${r.present?'Presente':'Falta'}</span></div>`).join('')||'<div class="attendance-no-records">Ainda não há sessões finalizadas computáveis para a sua frequência.</div>';
}

window.openChargeAdjust=function(id){if(!canManageTreasury())return;const r=finance.find(x=>x.id===Number(id));if(!r||r.status==='pago'){toast('Para alterar uma mensalidade paga, estorne a baixa primeiro.');return}$('#chargeAdjustId').value=r.id;$('#chargeAdjustValue').value=Number(r.value||0);$('#chargeAdjustStatus').value=r.status==='isento'?'isento':'aberto';$('#chargeAdjustReason').value=r.adjustReason||'';$('#chargeAdjustSummary').innerHTML=`<strong>${memberName(r.memberId)}</strong><br>${monthLabel(r.month)} · vencimento ${dateBR(r.due)} · valor atual ${money(r.value)}`;$('#chargeAdjustDialog').showModal()}
window.openMemberFinanceSheet=function(memberId,year){const member=members.find(m=>m.id===Number(memberId));if(!member)return;if(!canViewAllFinance()&&Number(memberId)!==Number(session.memberId))return;$('#memberFinanceDialog').dataset.memberId=String(memberId);fillYearSelect($('#memberFinanceYear'),year||new Date().getFullYear());$('#memberFinanceYear').value=String(year||$('#memberFinanceYear').value);renderMemberFinanceSheet();$('#memberFinanceDialog').showModal()}
function renderMemberFinanceSheet(){const memberId=Number($('#memberFinanceDialog')?.dataset.memberId),member=members.find(m=>m.id===memberId);if(!member)return;const year=Number($('#memberFinanceYear').value)||new Date().getFullYear(),rows=finance.filter(f=>f.memberId===memberId&&String(f.month).startsWith(`${year}-`)).sort((a,b)=>a.month.localeCompare(b.month)),paid=rows.filter(r=>r.status==='pago').reduce((s,r)=>s+Number(r.paidValue??r.value),0),open=rows.filter(r=>!['pago','isento'].includes(r.status)).reduce((s,r)=>s+Number(r.value),0),waived=rows.filter(r=>r.status==='isento').length;const cfg=configuredForYear(year)||{};const annualExempt=isAnnualDuesExempt(memberId,year);$('#memberFinanceTitle').textContent=`${member.name} · ${year}`;$('#memberFinanceSummary').innerHTML=`<article class="stat-card"><span>Pago</span><strong>${money(paid)}</strong><small>no exercício</small></article><article class="stat-card"><span>Em aberto</span><strong>${money(open)}</strong><small>pendências</small></article><article class="stat-card"><span>Mensalidade anual</span><strong>${annualExempt?'Isento':'Normal'}</strong><small>${annualExempt?escapeHtml(annualExemptionRecord(memberId,year)?.reason||'Isenção anual'):'cobrança mês a mês'}</small></article><article class="stat-card"><span>Mensalidade mensal</span><strong>${money(cfg.baseValue||0)}</strong><small>valor total cobrado do irmão</small></article><article class="stat-card"><span>Capitação mensal</span><strong>${money(cfg.capitationValue||0)}</strong><small>custo GLMERGS por irmão ativo</small></article><article class="stat-card"><span>DAM mensal</span><strong>${money(cfg.damValue||0)}</strong><small>custo GLMERGS por irmão ativo</small></article><article class="stat-card"><span>Líquido econômico/mês</span><strong>${money(monthlyNetDuesPerMember(cfg))}</strong><small>mensalidade menos DAM e Capitação do mês</small></article>`;const btn=$('#toggleAnnualExemptionBtn');if(btn){btn.classList.toggle('hidden',!canManageTreasury());btn.textContent=annualExempt?'Remover isenção anual':'Isentar mensalidades do ano';btn.dataset.enabled=annualExempt?'1':'0'};const byMonth=new Map(rows.map(r=>[r.month,r]));$('#memberFinanceRows').innerHTML=monthNamesShort.map((name,i)=>{const key=`${year}-${String(i+1).padStart(2,'0')}`,r=byMonth.get(key);if(!r)return`<tr><td>${name}</td><td>—</td><td>—</td><td>—</td><td><span class="status cancelado">Não cadastrada</span></td><td>—</td></tr>`;const st=effectiveStatus(r);return`<tr><td>${name}</td><td>${money(r.value)}</td><td>${dateBR(r.due)}</td><td>${r.status==='pago'?dateBR(r.paidAt):'—'}</td><td><span class="status ${st}">${statusLabel(st)}</span></td><td>${r.receipt?`<button class="action-btn" data-action="print-receipt" data-id="${r.id}">${r.receipt}</button>`:'—'}</td></tr>`}).join('')}
window.printReceipt=function(id){const r=finance.find(x=>x.id===Number(id));if(!r||r.status!=='pago')return;const member=members.find(m=>m.id===Number(r.memberId));const w=window.open('','_blank','width=720,height=900');if(!w){toast('Permita pop-ups para imprimir o recibo.');return}w.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>${r.receipt||'Recibo'} - Loja Modelo</title><style>body{font-family:Arial,sans-serif;color:#222;padding:48px;line-height:1.6}h1{font-size:24px;margin:0 0 6px}.muted{color:#666}.box{border:1px solid #bbb;padding:24px;margin:28px 0}.row{display:flex;justify-content:space-between;border-bottom:1px solid #eee;padding:8px 0}.sig{margin-top:70px;border-top:1px solid #333;width:280px;text-align:center;padding-top:8px}@media print{button{display:none}}</style></head><body><h1>Loja Modelo</h1><div class="muted">Recibo de mensalidade</div><div class="box"><div class="row"><b>Recibo</b><span>${r.receipt||'—'}</span></div><div class="row"><b>Irmão</b><span>${escapeHtml(member?.name||'')}</span></div><div class="row"><b>Matrícula</b><span>${escapeHtml(member?.matricula||'')}</span></div><div class="row"><b>Competência</b><span>${monthLabel(r.month)}</span></div><div class="row"><b>Valor recebido</b><span>${money(r.paidValue??r.value)}</span></div><div class="row"><b>Data</b><span>${dateBR(r.paidAt)}</span></div><div class="row"><b>Forma</b><span>${escapeHtml(r.paymentMethod||'—')}</span></div></div><p>Declaramos recebido o valor acima referente à competência indicada.</p><div class="sig">Tesouraria · Loja Modelo</div><p><button id="printReceiptBtn" type="button">Imprimir / Salvar em PDF</button></p></body></html>`);w.document.close();w.document.getElementById('printReceiptBtn')?.addEventListener('click',()=>w.print());addAudit('Recibo emitido',`${memberName(r.memberId)} · ${monthLabel(r.month)} · ${r.receipt}`);renderAudit()}


window.toggleAnnualDuesExemption=function(memberId,year){
  if(!canManageTreasury())return;const member=members.find(m=>m.id===Number(memberId));if(!member)return;const enabled=isAnnualDuesExempt(memberId,year);
  if(enabled){if(!confirm(`Remover a isenção anual de mensalidades de ${member.name} em ${year}? As competências geradas automaticamente e ainda não pagas voltarão a ficar em aberto.`))return;setAnnualDuesExemption(memberId,year,false);addAudit('Isenção anual removida',`${member.name} · ${year}`);toast('Isenção anual removida.');}
  else{const reason=prompt(`Motivo da isenção anual de mensalidades de ${member.name} em ${year}:`,'Isenção autorizada pela Loja');if(reason===null)return;setAnnualDuesExemption(memberId,year,true,reason||'Isenção autorizada pela Loja');addAudit('Isenção anual concedida',`${member.name} · ${year} · ${reason||'Isenção autorizada pela Loja'}`);toast('Isenção anual aplicada.');}
  renderFinance();renderMemberFinanceSheet();renderFinanceConfig();renderAnnualBudget();renderReports();renderDashboard();renderAudit();
}
// Ações delegadas compatíveis com a Content Security Policy do portal.
// Evita JavaScript inline em HTML dinâmico sem liberar 'unsafe-inline'.
document.addEventListener('click',async event=>{
  const closeEl=event.target.closest('[data-dialog-close-id]');
  if(closeEl){document.getElementById(closeEl.dataset.dialogCloseId)?.close();return}
  const el=event.target.closest('[data-action]');
  if(!el)return;
  const action=el.dataset.action;
  const id=Number(el.dataset.id);
  try{
    switch(action){
      case 'open-new-member': return window.openNewMember();
      case 'load-dues-year': return window.loadDuesYear(Number(el.dataset.year));
      case 'open-whatsapp-finance': return window.openWhatsAppFinance(id);
      case 'open-member-finance': return window.openMemberFinanceSheet(Number(el.dataset.memberId),Number(el.dataset.year));
      case 'open-charge-details': return window.openDetails(id);
      case 'open-charge-adjust': return window.openChargeAdjust(id);
      case 'toggle-annual-exemption': return window.toggleAnnualDuesExemption(Number(el.dataset.memberId),Number(el.dataset.year));
      case 'reopen-charge': return window.reopenCharge(id);
      case 'print-receipt': return window.printReceipt(id);
      case 'open-payment': return window.openPayment(id);
      case 'open-document-detail': return window.openDocumentDetail(id);
      case 'open-library-file': return await window.openLibraryFile(id);
      case 'download-library-file': return await window.downloadLibraryFile(id);
      case 'edit-library-document': return window.editLibraryDocument(id);
      case 'remove-library-document': return await window.removeLibraryDocument(id);
      case 'open-social-detail': return await window.openSocialDetail(id);
      case 'edit-social-post': return window.editSocialPost(id);
      case 'remove-social-post': return await window.removeSocialPost(id);
      case 'open-member-profile': return window.openMemberProfile(el.dataset.matricula,el.dataset.mode||'view');
      case 'reset-member-password': return await window.resetMemberPassword(el.dataset.matricula);
      case 'open-ledger-attachment': return await window.openLedgerAttachment(id);
      case 'open-ledger-dialog': return window.openLedgerDialog(el.dataset.type,id);
      case 'delete-ledger-entry': return await window.deleteLedgerEntry(id);
      case 'edit-commitment': {const c=commitments.find(x=>x.id===id);return c?window.openCommitmentDialog(c.type,id):null}
      case 'settle-commitment': return window.openCommitmentSettle(id);
      case 'cancel-commitment': return window.cancelCommitment(id);
      case 'reopen-commitment': return window.reopenCommitment(id);
      case 'reverse-commitment': return await window.reverseCommitment(id);
      case 'edit-chart-account': return window.openChartAccountDialog(id);
      case 'toggle-chart-account': return window.toggleChartAccount(id);
      case 'edit-cost-center': return window.openCostCenterDialog(id);
      case 'toggle-cost-center': return window.toggleCostCenter(id);
      case 'edit-budget': return window.openBudgetEntry(id);
      case 'remove-budget': return window.removeBudgetEntry(id);
      case 'open-reconcile': return window.openReconcile(id);
      case 'confirm-auto-reconcile': return window.confirmAutoReconcile(id);
      case 'dismiss-auto-reconcile': return window.dismissAutoReconcile(id);
      case 'confirm-ai-reconcile': return window.confirmAIReconcile(id);
      case 'dismiss-ai-reconcile': return window.dismissAIReconcile(id);
      case 'event-from-bank': return openEventFromBank(id);
      case 'create-ledger-from-bank': return window.createLedgerFromBank(id);
      case 'ignore-bank': return window.ignoreBank(id);
      case 'undo-bank': return window.undoBank(id);
      case 'open-financial-event': return renderFinancialEventDetail(id);
      case 'edit-financial-event': return openFinancialEventForm(id);
      case 'delete-event-payment': return window.deleteEventPayment(id);
    }
  }catch(err){
    console.error(`Falha na ação ${action}:`,err);
    toast(err?.message||'Não foi possível concluir esta ação.');
  }
});

document.addEventListener('change',async event=>{
  const el=event.target.closest('[data-change-action]');
  if(!el)return;
  const matricula=el.dataset.matricula;
  try{
    switch(el.dataset.changeAction){
      case 'save-member-degree': return await window.saveMemberDegree(matricula,el.value);
      case 'save-member-office': return await window.saveMemberMasonicOffice(matricula,el.value);
      case 'save-member-portal-access': return await window.saveMemberPortalAccess(matricula,el.value);
    }
  }catch(err){
    console.error(`Falha na alteração ${el.dataset.changeAction}:`,err);
    toast(err?.message||'Não foi possível salvar esta alteração.');
  }
});

// ===== Tesouraria completa: receitas, despesas, extrato, fluxo e relatórios =====
const LEDGER_ATTACHMENT_MAX=20*1024*1024;
const LEDGER_ATTACHMENT_CHUNK=4*1024*1024;
const monthNamesShort=['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
function localDateISO(){const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`}
function yearOfDate(d){return Number(String(d||'').slice(0,4))||new Date().getFullYear()}
function allFinanceYears(){const ys=[...finance.map(f=>Number(String(f.month).slice(0,4))),...ledger.map(e=>yearOfDate(e.date)),...commitments.map(c=>yearOfDate(c.dueDate||c.competence)),...bankTransactions.map(b=>yearOfDate(b.date)),...financialEvents.map(e=>Number(e.year)||yearOfDate(e.date)),...Object.keys(duesConfig).map(Number),...annualBudget.map(b=>Number(b.year)),...Object.keys(financeSettings.openingBalances||{}).map(Number),new Date().getFullYear()].filter(Number.isFinite);return [...new Set(ys)].sort((a,b)=>b-a)}
function fillYearSelect(el,selected){if(!el)return;const years=allFinanceYears();el.innerHTML=years.map(y=>`<option value="${y}">${y}</option>`).join('');el.value=String(years.includes(Number(selected))?selected:years[0])}

function fillAccountSelect(el,selectedId=null){if(!el)return;const selected=accountById(selectedId);const rows=chartOfAccounts.filter(a=>a.active||Number(a.id)===Number(selected?.id)).sort((a,b)=>a.code.localeCompare(b.code,undefined,{numeric:true}));el.innerHTML='<option value="">Selecione uma conta...</option>'+rows.map(a=>`<option value="${a.id}">${escapeHtml(accountText(a))}${a.active?'':' (inativa)'}</option>`).join('');el.value=selected?String(selected.id):''}
function fillCostCenterSelect(el,selectedId=null){if(!el)return;const selected=costCenterById(selectedId)||costCenters.find(c=>c.system);const rows=costCenters.filter(c=>c.active||Number(c.id)===Number(selected?.id)).sort((a,b)=>a.code.localeCompare(b.code,undefined,{numeric:true}));el.innerHTML='<option value="">Selecione um centro de custo...</option>'+rows.map(c=>`<option value="${c.id}">${escapeHtml(costCenterText(c))}${c.active?'':' (inativo)'}</option>`).join('');el.value=selected?String(selected.id):''}
function budgetAccountByCode(code){return chartOfAccounts.find(a=>a.code===code)||null}
function budgetCenterByCode(code){return costCenters.find(c=>c.code===code)||null}
function automaticBudgetRows(year){
  const cfg=configuredForYear(year)||{},active=members.filter(m=>m.active).length,billable=members.filter(m=>m.active&&!isAnnualDuesExempt(m.id,year)).length;
  const general=budgetCenterByCode('CC.99'),admin=budgetCenterByCode('CC.01'),dues=budgetAccountByCode('1.01'),cap=budgetAccountByCode('2.16'),dam=budgetAccountByCode('2.17');
  return [
    {id:`auto-dues-${year}`,year,accountId:dues?.id,costCenterId:general?.id,description:'Mensalidades ordinárias · previsão automática',amount:billable*12*Number(cfg.baseValue||0),automatic:true,detail:`${billable} irmão(s) cobrados × 12 × ${money(cfg.baseValue||0)}`},
    {id:`auto-cap-${year}`,year,accountId:cap?.id,costCenterId:admin?.id,description:'Capitação mensal · projeção anual automática',amount:active*12*Number(cfg.capitationValue||0),automatic:true,detail:`${active} irmão(s) ativos × 12 × ${money(cfg.capitationValue||0)}/mês`},
    {id:`auto-dam-${year}`,year,accountId:dam?.id,costCenterId:admin?.id,description:'DAM mensal · projeção anual automática',amount:active*12*Number(cfg.damValue||0),automatic:true,detail:`${active} irmão(s) ativos × 12 × ${money(cfg.damValue||0)}/mês`}
  ].filter(r=>r.accountId&&r.costCenterId);
}
function realizedBudgetAmount(year,accountId,costCenterId){
  const account=chartOfAccounts.find(a=>Number(a.id)===Number(accountId));if(!account)return 0;let total=0;
  if(account.code==='1.01'&&String(costCenters.find(c=>Number(c.id)===Number(costCenterId))?.code)==='CC.99')total+=finance.filter(f=>String(f.month).startsWith(`${year}-`)&&f.status==='pago').reduce((s,f)=>s+Number(f.paidValue??f.value),0);
  total+=ledger.filter(e=>yearOfDate(e.date)===Number(year)&&Number(e.accountId)===Number(accountId)&&Number(e.costCenterId||3099)===Number(costCenterId)).reduce((s,e)=>s+Number(e.amount||0),0);
  return total;
}
function allBudgetRows(year){return [...automaticBudgetRows(year),...annualBudget.filter(b=>Number(b.year)===Number(year))]}
function renderAnnualBudget(){
  if(!session||!canViewAllFinance()||!$('#budgetRows'))return;const year=Number($('#budgetYear')?.value)||new Date().getFullYear();fillYearSelect($('#budgetYear'),year);$('#budgetYear').value=String(year);
  fillAccountSelect($('#budgetAccount'),null);fillCostCenterSelect($('#budgetCostCenter'),null);
  const rows=allBudgetRows(year).map(r=>{const account=chartOfAccounts.find(a=>Number(a.id)===Number(r.accountId)),center=costCenters.find(c=>Number(c.id)===Number(r.costCenterId)),realized=realizedBudgetAmount(year,r.accountId,r.costCenterId),difference=realized-Number(r.amount||0),pct=Number(r.amount)>0?(realized/Number(r.amount))*100:0;return {...r,account,center,realized,difference,pct}}).filter(r=>r.account&&r.center);
  const rev=rows.filter(r=>r.account.type==='receita').reduce((s,r)=>s+Number(r.amount),0),exp=rows.filter(r=>r.account.type==='despesa').reduce((s,r)=>s+Number(r.amount),0),realRev=rows.filter(r=>r.account.type==='receita').reduce((s,r)=>s+r.realized,0),realExp=rows.filter(r=>r.account.type==='despesa').reduce((s,r)=>s+r.realized,0);
  $('#newBudgetBtn')?.classList.toggle('hidden',!canManageTreasury());$('#budgetRevenueTotal').textContent=money(rev);$('#budgetExpenseTotal').textContent=money(exp);$('#budgetNetTotal').textContent=money(rev-exp);$('#budgetRealizedNet').textContent=money(realRev-realExp);
  $('#budgetRows').innerHTML=rows.sort((a,b)=>a.account.code.localeCompare(b.account.code,undefined,{numeric:true})).map(r=>`<tr><td><strong>${escapeHtml(accountText(r.account))}</strong><br><small>${escapeHtml(r.description||'')}</small></td><td>${escapeHtml(costCenterText(r.center))}</td><td>${r.account.type==='receita'?'Receita':'Despesa'}</td><td>${money(r.amount)}</td><td>${money(r.realized)}</td><td class="${r.account.type==='receita'?(r.difference>=0?'money-positive':'money-negative'):(r.difference<=0?'money-positive':'money-negative')}">${money(r.difference)}</td><td>${r.pct.toFixed(1).replace('.',',')}%</td><td>${r.automatic?`Automático<br><small>${escapeHtml(r.detail||'')}</small>`:'Manual'}</td><td>${r.automatic||!canManageTreasury()?'—':`<button class="action-btn" data-action="edit-budget" data-id="${r.id}">Editar</button><button class="action-btn danger" data-action="remove-budget" data-id="${r.id}">Excluir</button>`}</td></tr>`).join('')||'<tr><td colspan="9">Nenhuma linha orçamentária cadastrada.</td></tr>';
}
window.openBudgetEntry=function(id=null){if(!canManageTreasury())return;const row=id?annualBudget.find(b=>Number(b.id)===Number(id)):null;$('#budgetEditId').value=row?.id||'';$('#budgetDialogTitle').textContent=row?'Editar previsão orçamentária':'Nova previsão orçamentária';$('#budgetEntryYear').value=row?.year||Number($('#budgetYear')?.value)||new Date().getFullYear();fillAccountSelect($('#budgetAccount'),row?.accountId||null);fillCostCenterSelect($('#budgetCostCenter'),row?.costCenterId||null);$('#budgetDescription').value=row?.description||'';$('#budgetAmount').value=row?.amount||'';$('#budgetDialog').showModal()}
window.removeBudgetEntry=function(id){if(!canManageTreasury())return;const row=annualBudget.find(b=>Number(b.id)===Number(id));if(!row)return;if(!confirm('Excluir esta previsão orçamentária?'))return;annualBudget=annualBudget.filter(b=>Number(b.id)!==Number(id));saveAnnualBudget();addAudit('Previsão orçamentária excluída',`${row.year} · ${money(row.amount)}`);renderAnnualBudget();renderAudit();toast('Previsão removida.')}

function renderFinanceAux(){if(!session)return;const year=financeSelectedYear||new Date().getFullYear();['#revenueYearFilter','#expenseYearFilter','#eventYearFilter','#payableYearFilter','#receivableYearFilter','#cashflowYear','#reportYear'].forEach(sel=>fillYearSelect($(sel),$(sel)?.value||year));if($('#bankYearFilter')){const prev=$('#bankYearFilter').value||'todos',ys=allFinanceYears();$('#bankYearFilter').innerHTML='<option value="todos">Período completo</option>'+ys.map(y=>`<option value="${y}">${y}</option>`).join('');$('#bankYearFilter').value=prev==='todos'||ys.includes(Number(prev))?prev:'todos'};renderLedger('receita');renderLedger('despesa');renderFinancialEvents();renderCommitments('pagar');renderCommitments('receber');renderChartOfAccounts();renderCostCenters();renderAnnualBudget();renderBankTransactions();renderCashflow();renderReports();renderFinanceSettingsForm()}
function ledgerLabel(type){return type==='receita'?'Receita':'Despesa'}
function accountById(id){return chartOfAccounts.find(a=>Number(a.id)===Number(id))||null}
function accountForLedger(entry){if(!entry)return null;const direct=accountById(entry.accountId);if(direct)return direct;const legacy=normalizeText(entry.category||'');if(!legacy)return null;return chartOfAccounts.find(a=>a.type===entry.type&&normalizeText(a.name)===legacy)||null}
function accountText(account){return account?`${account.code} · ${account.name}`:'Não classificado'}
function ledgerAccountText(entry){const account=accountForLedger(entry);return account?accountText(account):(entry?.category?`${entry.category} · legado`:'Não classificado')}

function costCenterById(id){return costCenters.find(c=>Number(c.id)===Number(id))||null}
function costCenterText(c){return c?`${c.code} · ${c.name}`:'Geral / não alocado'}
function costCenterForLedger(entry){return costCenterById(entry?.costCenterId)||costCenters.find(c=>c.code===(entry?.costCenterCode||'CC.99'))||costCenters.find(c=>c.system)||null}
function ledgerCostCenterText(entry){return costCenterText(costCenterForLedger(entry))}
function fillLedgerCostCenterSelect(selectedId=null){const select=$('#ledgerCostCenter');if(!select)return;const selected=costCenterById(selectedId)||costCenters.find(c=>c.system);const rows=costCenters.filter(c=>c.active||Number(c.id)===Number(selected?.id)).sort((a,b)=>a.code.localeCompare(b.code,undefined,{numeric:true}));select.innerHTML='<option value="">Selecione um centro de custo...</option>'+rows.map(c=>`<option value="${c.id}">${escapeHtml(costCenterText(c))}${c.active?'':' · INATIVO'}</option>`).join('');select.value=String(selected?.id||'')}
function renderCostCenters(){if(!session||!canViewAllFinance()||!$('#costCenterRows'))return;const q=normalizeText($('#costCenterSearch')?.value||''),status=$('#costCenterStatusFilter')?.value||'ativos';const rows=costCenters.filter(c=>(status==='todos'||(status==='ativos'?c.active:!c.active))&&(!q||normalizeText([c.code,c.name,c.description].join(' ')).includes(q))).sort((a,b)=>a.code.localeCompare(b.code,undefined,{numeric:true}));const active=costCenters.filter(c=>c.active),unallocated=ledger.filter(e=>(costCenterForLedger(e)?.system===true)).length,used=new Set(ledger.map(e=>Number(costCenterForLedger(e)?.id)).filter(Boolean));$('#costCenterActiveCount').textContent=active.length;$('#costCenterUsedCount').textContent=used.size;$('#costCenterUnallocatedCount').textContent=unallocated;$('#costCenterProjectCount').textContent=costCenters.filter(c=>c.active&&String(c.code||'').startsWith('CC.10.')).length;$('#newCostCenterBtn')?.classList.toggle('hidden',!canManageTreasury());$('#costCenterRows').innerHTML=rows.map(c=>{const uses=ledger.filter(e=>Number(costCenterForLedger(e)?.id)===Number(c.id)).length;return `<tr><td><strong>${escapeHtml(c.code)}</strong></td><td><strong>${escapeHtml(c.name)}</strong>${c.description?`<br><small>${escapeHtml(c.description)}</small>`:''}</td><td><span class="status ${c.active?'pago':'cancelado'}">${c.active?'Ativo':'Inativo'}</span></td><td>${uses}</td><td><div class="row-actions">${canManageTreasury()?`<button class="action-btn" data-action="edit-cost-center" data-id="${c.id}">Editar</button>${c.system?'':`<button class="action-btn ${c.active?'danger':''}" data-action="toggle-cost-center" data-id="${c.id}">${c.active?'Desativar':'Reativar'}</button>`}`:'—'}</div></td></tr>`}).join('')||'<tr><td colspan="5">Nenhum centro de custo encontrado.</td></tr>'}
window.openCostCenterDialog=function(id=null){if(!canManageTreasury())return;const c=id?costCenterById(id):null;$('#costCenterForm').reset();$('#costCenterEditId').value=c?.id||'';$('#costCenterDialogTitle').textContent=c?'Editar centro de custo':'Novo centro de custo';$('#costCenterCode').value=c?.code||'';$('#costCenterCode').disabled=Boolean(c?.system);$('#costCenterName').value=c?.name||'';$('#costCenterDescription').value=c?.description||'';$('#costCenterActive').checked=c?.active!==false;$('#costCenterDialog').showModal()}
window.toggleCostCenter=function(id){if(!canManageTreasury())return;const c=costCenterById(id);if(!c)return;if(c.system){toast('O centro Geral / não alocado é estrutural e deve permanecer ativo.');return}c.active=!c.active;c.updatedAt=new Date().toISOString();c.updatedBy=session.name;saveCostCenters();addAudit(c.active?'Centro de custo reativado':'Centro de custo desativado',costCenterText(c));renderCostCenters();renderAudit();toast(c.active?'Centro de custo reativado.':'Centro de custo desativado.')}
function fillLedgerAccountSelect(type,selectedId=null,legacyCategory=''){
  const el=$('#ledgerAccount');if(!el)return;
  const selected=accountById(selectedId)||chartOfAccounts.find(a=>a.type===type&&normalizeText(a.name)===normalizeText(legacyCategory));
  const rows=chartOfAccounts.filter(a=>a.type===type&&(a.active||Number(a.id)===Number(selected?.id))).sort((a,b)=>a.code.localeCompare(b.code,undefined,{numeric:true}));
  el.innerHTML='<option value="">Selecione uma conta...</option>'+rows.map(a=>`<option value="${a.id}">${escapeHtml(accountText(a))}${a.active?'':' (inativa)'}</option>`).join('');
  el.value=selected?String(selected.id):'';
}
function renderChartOfAccounts(){
  if(!session||!canViewAllFinance()||!$('#chartAccountRows'))return;
  const q=normalizeText($('#chartAccountSearch')?.value||''),type=$('#chartAccountTypeFilter')?.value||'todos',status=$('#chartAccountStatusFilter')?.value||'ativos';
  const rows=chartOfAccounts.filter(a=>(type==='todos'||a.type===type)&&(status==='todos'||(status==='ativos'?a.active:!a.active))&&(!q||normalizeText([a.code,a.name,a.group,a.description].join(' ')).includes(q))).sort((a,b)=>a.code.localeCompare(b.code,undefined,{numeric:true}));
  const active=chartOfAccounts.filter(a=>a.active),legacyCount=ledger.filter(e=>!accountForLedger(e)).length;
  $('#chartAccountActiveCount').textContent=active.length;$('#chartAccountRevenueCount').textContent=active.filter(a=>a.type==='receita').length;$('#chartAccountExpenseCount').textContent=active.filter(a=>a.type==='despesa').length;$('#chartAccountUnclassifiedCount').textContent=legacyCount;
  $('#newChartAccountBtn')?.classList.toggle('hidden',!canManageTreasury());
  $('#chartAccountRows').innerHTML=rows.map(a=>{const uses=a.code==='1.01'?finance.length:ledger.filter(e=>Number(e.accountId)===Number(a.id)).length;return `<tr><td><strong>${escapeHtml(a.code)}</strong></td><td><strong>${escapeHtml(a.name)}</strong>${a.description?`<br><small>${escapeHtml(a.description)}</small>`:''}</td><td>${a.type==='receita'?'Receita':'Despesa'}</td><td>${escapeHtml(a.group||'—')}</td><td><span class="status ${a.active?'pago':'cancelado'}">${a.active?'Ativa':'Inativa'}</span></td><td>${uses}</td><td><div class="row-actions">${canManageTreasury()?`<button class="action-btn" data-action="edit-chart-account" data-id="${a.id}">Editar</button>${a.system?'':`<button class="action-btn ${a.active?'danger':''}" data-action="toggle-chart-account" data-id="${a.id}">${a.active?'Desativar':'Reativar'}</button>`}`:'—'}</div></td></tr>`}).join('')||'<tr><td colspan="7">Nenhuma conta encontrada.</td></tr>';
}
window.openChartAccountDialog=function(id=null){
  if(!canManageTreasury())return;const a=id?accountById(id):null;$('#chartAccountForm').reset();$('#chartAccountEditId').value=a?.id||'';$('#chartAccountDialogTitle').textContent=a?'Editar conta':'Nova conta';$('#chartAccountCode').value=a?.code||'';$('#chartAccountName').value=a?.name||'';$('#chartAccountType').value=a?.type||'despesa';$('#chartAccountGroup').value=a?.group||'';$('#chartAccountDescription').value=a?.description||'';$('#chartAccountActive').checked=a?.active!==false;$('#chartAccountType').disabled=Boolean(a&&ledger.some(e=>Number(e.accountId)===Number(a.id)));$('#chartAccountDialog').showModal();
}
window.toggleChartAccount=function(id){
  if(!canManageTreasury())return;const a=accountById(id);if(!a)return;if(a.system){toast('Esta conta é estrutural do sistema e deve permanecer ativa.');return}a.active=!a.active;a.updatedAt=new Date().toISOString();saveChartOfAccounts();addAudit(a.active?'Conta contábil reativada':'Conta contábil desativada',`${a.code} · ${a.name}`);renderChartOfAccounts();renderAudit();toast(a.active?'Conta reativada.':'Conta desativada.');
}
function filteredLedger(type){const searchEl=type==='receita'?$('#revenueSearch'):$('#expenseSearch'),yearEl=type==='receita'?$('#revenueYearFilter'):$('#expenseYearFilter');const q=normalizeText(searchEl?.value||''),year=Number(yearEl?.value)||new Date().getFullYear();return ledger.filter(e=>e.type===type&&yearOfDate(e.date)===year&&(!q||normalizeText([ledgerAccountText(e),ledgerCostCenterText(e),e.description,e.counterparty,e.method,e.reference].join(' ')).includes(q))).sort((a,b)=>String(b.date).localeCompare(String(a.date)))}
function renderLedger(type){if(!session||!canViewAllFinance())return;const rows=filteredLedger(type),isRev=type==='receita',prefix=isRev?'revenue':'expense',year=Number($(`#${prefix}YearFilter`)?.value)||new Date().getFullYear(),now=new Date(),month=String(now.getMonth()+1).padStart(2,'0');const yrows=ledger.filter(e=>e.type===type&&yearOfDate(e.date)===year),mrows=yrows.filter(e=>String(e.date).slice(5,7)===month);$(`#${prefix}YearTotal`).textContent=money(yrows.reduce((s,e)=>s+Number(e.amount||0),0));$(`#${prefix}YearDetail`).textContent=`exercício ${year}`;$(`#${prefix}MonthTotal`).textContent=money(mrows.reduce((s,e)=>s+Number(e.amount||0),0));$(`#${prefix}Count`).textContent=yrows.length;$(`#${prefix}Pending`).textContent=yrows.filter(e=>!e.bankId).length;$(`#${prefix}Rows`).innerHTML=rows.map(e=>`<tr><td>${dateBR(e.date)}</td><td>${escapeHtml(ledgerAccountText(e))}</td><td>${escapeHtml(ledgerCostCenterText(e))}</td><td><strong>${escapeHtml(e.description||'')}</strong>${e.reference?`<br><small>${escapeHtml(e.reference)}</small>`:''}</td><td>${escapeHtml(e.counterparty||'—')}</td><td>${money(e.amount)}</td><td>${escapeHtml(e.method||'—')}</td><td><span class="status ${e.bankId?'pago':'aberto'}">${e.bankId?'Conciliado':'Não conciliado'}</span></td><td><div class="row-actions">${e.attachment?.storageKey?`<button class="action-btn" data-action="open-ledger-attachment" data-id="${e.id}">Comprovante</button>`:''}${e.commitmentId?`<span class="tag subtle">Baixa de conta</span>`:canManageTreasury()?`<button class="action-btn" data-action="open-ledger-dialog" data-type="${type}" data-id="${e.id}">Editar</button><button class="action-btn danger" data-action="delete-ledger-entry" data-id="${e.id}">Excluir</button>`:''}</div></td></tr>`).join('')||`<tr><td colspan="9">Nenhum lançamento de ${isRev?'receita':'despesa'} encontrado.</td></tr>`}
window.openLedgerDialog=function(type,id=null){if(!canManageTreasury())return;const e=id?ledger.find(x=>x.id===Number(id)):null;$('#ledgerForm').reset();$('#ledgerEditId').value=e?.id||'';$('#ledgerType').value=type;$('#ledgerDialogTitle').textContent=e?`Editar ${ledgerLabel(type).toLowerCase()}`:`Nova ${ledgerLabel(type).toLowerCase()}`;$('#ledgerDate').value=e?.date||localDateISO();fillLedgerAccountSelect(type,e?.accountId||null,e?.category||'');fillLedgerCostCenterSelect(e?.costCenterId||3099);$('#ledgerDescription').value=e?.description||'';$('#ledgerCounterparty').value=e?.counterparty||'';$('#ledgerAmount').value=e?.amount||'';$('#ledgerMethod').value=e?.method||'Pix';$('#ledgerReference').value=e?.reference||'';$('#ledgerNotes').value=e?.notes||'';$('#ledgerCounterpartyLabel').childNodes[0].nodeValue=type==='receita'?'Origem / pagador':'Fornecedor / favorecido';$('#ledgerAttachmentHelp').textContent=e?.attachment?.fileName?`Atual: ${e.attachment.fileName} (${formatBytes(e.attachment.fileSize)}). Selecione outro para substituir.`:'PDF, JPG, PNG ou WEBP · até 20 MB.';$('#ledgerDialog').showModal()}
async function uploadFinanceAttachment(file,key,onProgress){const count=Math.ceil(file.size/LEDGER_ATTACHMENT_CHUNK);for(let i=0;i<count;i++){const chunk=file.slice(i*LEDGER_ATTACHMENT_CHUNK,Math.min(file.size,(i+1)*LEDGER_ATTACHMENT_CHUNK));const response=await fetch('/api/finance-file',{method:'POST',headers:{'Content-Type':'application/octet-stream','X-Storage-Key':key,'X-Chunk-Index':String(i),'X-Chunk-Count':String(count),'X-File-Name':encodeURIComponent(file.name),'X-File-Type':file.type||'application/octet-stream','X-File-Size':String(file.size)},body:chunk});let data={};try{data=await response.json()}catch{}if(!response.ok)throw new Error(data.error||'Falha ao enviar comprovante.');onProgress?.(Math.round(((i+1)/count)*100))}return{storageKey:key,storage:'netlify-blobs-chunked',chunkCount:count,fileName:file.name,fileType:file.type||'application/octet-stream',fileSize:file.size}}
async function getFinanceAttachment(att){const chunks=[];for(let i=0;i<Number(att.chunkCount||1);i++){const r=await fetch(`/api/finance-file?key=${encodeURIComponent(att.storageKey)}&chunk=${i}`,{cache:'no-store'});if(!r.ok)throw new Error('Falha ao recuperar comprovante.');chunks.push(await r.blob())}return new Blob(chunks,{type:att.fileType||'application/octet-stream'})}
async function deleteFinanceAttachment(att){if(!att?.storageKey||!financeUsesRemote())return;await fetch(`/api/finance-file?key=${encodeURIComponent(att.storageKey)}`,{method:'DELETE'})}
window.openLedgerAttachment=async function(id){const e=ledger.find(x=>x.id===Number(id));if(!e?.attachment)return;try{const blob=await getFinanceAttachment(e.attachment),url=URL.createObjectURL(blob);window.open(url,'_blank','noopener,noreferrer');setTimeout(()=>URL.revokeObjectURL(url),60000)}catch(err){toast(err.message||'Não foi possível abrir o comprovante.')}}
window.deleteLedgerEntry=async function(id){if(!canManageTreasury())return;const e=ledger.find(x=>x.id===Number(id));if(e?.commitmentId){toast('Este lançamento é uma baixa de conta prevista. Faça o estorno em Contas a Pagar/Receber.');return}if(!e||!confirm(`Excluir ${ledgerLabel(e.type).toLowerCase()} de ${money(e.amount)}?`))return;if(e.attachment)try{await deleteFinanceAttachment(e.attachment)}catch{}ledger=ledger.filter(x=>x.id!==e.id);const b=bankTransactions.find(b=>b.matchedKind==='ledger'&&Number(b.matchedId)===e.id);if(b){b.status='pending';b.matchedKind=null;b.matchedId=null}saveLedger();saveBankTransactions();addAudit(`${ledgerLabel(e.type)} excluída`,`${e.description} · ${money(e.amount)}`);renderFinanceAux();renderAudit();toast('Lançamento excluído.')}


function commitmentTypeLabel(type){return type==='receber'?'Conta a receber':'Conta a pagar'}
function commitmentStatus(c){if(c.status==='liquidado'||c.status==='cancelado')return c.status;if(!c.dueDate)return'provisionado';if(c.dueDate<localDateISO())return'vencido';return'aberto'}
function commitmentStatusLabel(c){const s=commitmentStatus(c);return s==='liquidado'?(c.type==='receber'?'Recebida':'Paga'):s==='cancelado'?'Cancelada':s==='vencido'?'Vencida':s==='provisionado'?'Provisionada':'A vencer'}
function commitmentAccount(c){return accountById(c.accountId)||chartOfAccounts.find(a=>a.code===c.accountCode)||null}
function commitmentCenter(c){return costCenterById(c.costCenterId)||costCenters.find(x=>x.code===c.costCenterCode)||costCenters.find(x=>x.system)||null}
function commitmentPrefix(type){return type==='receber'?'receivable':'payable'}
function fillCommitmentSelects(type,accountId=null,centerId=null){
  const accountSel=$('#commitmentAccount'),centerSel=$('#commitmentCostCenter');if(!accountSel||!centerSel)return;
  const nature=type==='receber'?'receita':'despesa',selectedAccount=accountById(accountId);
  accountSel.innerHTML='<option value="">Selecione uma conta...</option>'+chartOfAccounts.filter(a=>a.type===nature&&(a.active||Number(a.id)===Number(selectedAccount?.id))).sort((a,b)=>a.code.localeCompare(b.code,undefined,{numeric:true})).map(a=>`<option value="${a.id}">${escapeHtml(accountText(a))}${a.active?'':' · INATIVA'}</option>`).join('');
  accountSel.value=String(selectedAccount?.id||'');
  const selectedCenter=costCenterById(centerId)||costCenters.find(c=>c.system);centerSel.innerHTML='<option value="">Selecione um centro...</option>'+costCenters.filter(c=>c.active||Number(c.id)===Number(selectedCenter?.id)).sort((a,b)=>a.code.localeCompare(b.code,undefined,{numeric:true})).map(c=>`<option value="${c.id}">${escapeHtml(costCenterText(c))}${c.active?'':' · INATIVO'}</option>`).join('');centerSel.value=String(selectedCenter?.id||'');
}
function filteredCommitments(type){const prefix=commitmentPrefix(type),q=normalizeText($(`#${prefix}Search`)?.value||''),year=Number($(`#${prefix}YearFilter`)?.value)||new Date().getFullYear(),status=$(`#${prefix}StatusFilter`)?.value||'todos';return commitments.filter(c=>c.type===type&&yearOfDate(c.dueDate||c.competence)===year&&(status==='todos'||commitmentStatus(c)===status)&&(!q||normalizeText([c.description,c.counterparty,c.reference,accountText(commitmentAccount(c)),costCenterText(commitmentCenter(c))].join(' ')).includes(q))).sort((a,b)=>String(a.dueDate).localeCompare(String(b.dueDate)))}
function renderCommitments(type){if(!session||!canViewAllFinance())return;const prefix=commitmentPrefix(type),body=$(`#${prefix}Rows`);if(!body)return;$(`#new${type==='receber'?'Receivable':'Payable'}Btn`)?.classList.toggle('hidden',!canManageTreasury());const year=Number($(`#${prefix}YearFilter`)?.value)||new Date().getFullYear(),rows=filteredCommitments(type),yearRows=commitments.filter(c=>c.type===type&&yearOfDate(c.dueDate||c.competence)===year),open=yearRows.filter(c=>!['liquidado','cancelado'].includes(c.status)),overdue=open.filter(c=>commitmentStatus(c)==='vencido'),settled=yearRows.filter(c=>c.status==='liquidado'),today=new Date(localDateISO()+'T12:00:00'),limit=new Date(today);limit.setDate(limit.getDate()+30);const next30=open.filter(c=>{if(!c.dueDate)return false;const d=new Date(c.dueDate+'T12:00:00');return d>=today&&d<=limit});$(`#${prefix}OpenTotal`).textContent=money(open.reduce((s,c)=>s+Number(c.amount),0));$(`#${prefix}OverdueTotal`).textContent=money(overdue.reduce((s,c)=>s+Number(c.amount),0));$(`#${prefix}OverdueCount`).textContent=`${overdue.length} conta(s)`;$(`#${prefix}SettledTotal`).textContent=money(settled.reduce((s,c)=>s+Number(c.settledAmount??c.amount),0));$(`#${prefix}Next30Total`).textContent=money(next30.reduce((s,c)=>s+Number(c.amount),0));body.innerHTML=rows.map(c=>{const st=commitmentStatus(c),acc=commitmentAccount(c),cc=commitmentCenter(c),settledText=c.status==='liquidado'?`${dateBR(c.settledDate)}<br><small>${escapeHtml(c.method||'')}</small>`:'—';let actions='—';if(canManageTreasury()){if(c.status==='liquidado')actions=`<div class="row-actions"><button class="action-btn danger" data-action="reverse-commitment" data-id="${c.id}">Estornar baixa</button></div>`;else if(c.status==='cancelado')actions=`<div class="row-actions"><button class="action-btn" data-action="reopen-commitment" data-id="${c.id}">Reabrir</button></div>`;else if(['glmergs-annual','glmergs-monthly'].includes(c.origin))actions=`<div class="row-actions"><button class="action-btn" data-action="edit-commitment" data-id="${c.id}">${c.dueDate?'Ajustar vencimento':'Definir vencimento'}</button><button class="action-btn" data-action="settle-commitment" data-id="${c.id}">Registrar repasse</button></div>`;else actions=`<div class="row-actions"><button class="action-btn" data-action="edit-commitment" data-id="${c.id}">Editar</button><button class="action-btn" data-action="settle-commitment" data-id="${c.id}">${type==='receber'?'Registrar recebimento':'Registrar pagamento'}</button><button class="action-btn danger" data-action="cancel-commitment" data-id="${c.id}">Cancelar</button></div>`}return `<tr><td>${escapeHtml(c.competence||'—')}</td><td>${c.dueDate?dateBR(c.dueDate):'<span class="tag subtle">A definir</span>'}</td><td>${escapeHtml(accountText(acc))}</td><td>${escapeHtml(costCenterText(cc))}</td><td><strong>${escapeHtml(c.description)}</strong>${c.reference?`<br><small>${escapeHtml(c.reference)}</small>`:''}</td><td>${escapeHtml(c.counterparty||'—')}</td><td>${money(c.amount)}</td><td><span class="status ${st==='liquidado'?'pago':st==='cancelado'?'cancelado':st==='vencido'?'atrasado':'aberto'}">${commitmentStatusLabel(c)}</span></td><td>${settledText}</td><td>${actions}</td></tr>`}).join('')||`<tr><td colspan="10">Nenhuma ${type==='receber'?'conta a receber':'conta a pagar'} para o filtro selecionado.</td></tr>`}
window.openCommitmentDialog=function(type,id=null){if(!canManageTreasury())return;const c=id?commitments.find(x=>x.id===Number(id)):null;if(c?.status==='liquidado')return toast('Estorne a baixa antes de editar esta conta.');$('#commitmentForm').reset();$('#commitmentEditId').value=c?.id||'';$('#commitmentType').value=type;$('#commitmentDialogTitle').textContent=['glmergs-annual','glmergs-monthly'].includes(c?.origin)?'Definir vencimento do repasse GLMERGS':(c?`Editar ${commitmentTypeLabel(type).toLowerCase()}`:`Nova ${commitmentTypeLabel(type).toLowerCase()}`);const now=localDateISO();$('#commitmentCompetence').value=c?.competence||now.slice(0,7);$('#commitmentDueDate').value=c?.dueDate||'';fillCommitmentSelects(type,c?.accountId,c?.costCenterId);$('#commitmentDescription').value=c?.description||'';$('#commitmentCounterparty').value=c?.counterparty||'';$('#commitmentAmount').value=c?.amount||'';$('#commitmentReference').value=c?.reference||'';$('#commitmentNotes').value=c?.notes||'';$('#commitmentCounterpartyLabel').childNodes[0].nodeValue=type==='receber'?'Pagador / origem':'Fornecedor / favorecido';const locked=['glmergs-annual','glmergs-monthly'].includes(c?.origin);['commitmentCompetence','commitmentAccount','commitmentCostCenter','commitmentDescription','commitmentCounterparty','commitmentAmount','commitmentReference'].forEach(fid=>{const el=$('#'+fid);if(el)el.disabled=Boolean(locked)});$('#commitmentDialog').showModal()}
window.openCommitmentSettle=function(id){if(!canManageTreasury())return;const c=commitments.find(x=>x.id===Number(id));if(!c||c.status!=='aberto')return;$('#commitmentSettleForm').reset();$('#commitmentSettleId').value=c.id;$('#commitmentSettleTitle').textContent=c.type==='receber'?'Registrar recebimento':'Registrar pagamento';$('#commitmentSettleSummary').innerHTML=`<strong>${escapeHtml(c.description)} · ${money(c.amount)}</strong><br>${escapeHtml(accountText(commitmentAccount(c)))} · vence em ${dateBR(c.dueDate)}`;$('#commitmentSettleDate').value=localDateISO();$('#commitmentSettleAmount').value=Number(c.amount).toFixed(2);$('#commitmentSettleMethod').value='Pix';$('#commitmentSettleReference').value=c.reference||'';$('#commitmentSettleNotes').value='';$('#commitmentSettleDialog').showModal()}
function createLedgerForCommitment(c,{date,amount,method,reference,notes,bankId=null}){const acc=commitmentAccount(c),cc=commitmentCenter(c),id=Date.now()+Math.floor(Math.random()*1000),entry={id,type:c.type==='receber'?'receita':'despesa',date,accountId:acc?.id||c.accountId,accountCode:acc?.code||c.accountCode||'',category:acc?.name||c.category||'',costCenterId:cc?.id||c.costCenterId||3099,costCenterCode:cc?.code||c.costCenterCode||'CC.99',costCenterName:cc?.name||c.costCenterName||'Geral / não alocado',description:c.description,counterparty:c.counterparty,amount:Number(amount),method,reference:reference||c.reference||'',notes:[`Baixa de ${commitmentTypeLabel(c.type).toLowerCase()} #${c.id}`,c.notes,notes].filter(Boolean).join(' | '),bankId,attachment:null,commitmentId:c.id,origin:'commitment',createdAt:new Date().toISOString(),createdBy:session.name,updatedAt:new Date().toISOString(),updatedBy:session.name};ledger.push(entry);c.status='liquidado';c.settledDate=date;c.settledAmount=Number(amount);c.method=method;c.ledgerId=id;c.bankId=bankId;c.updatedAt=new Date().toISOString();c.updatedBy=session.name;return entry}
window.cancelCommitment=function(id){if(!canManageTreasury())return;const c=commitments.find(x=>x.id===Number(id));if(!c||c.status!=='aberto')return;if(!confirm(`Cancelar ${commitmentTypeLabel(c.type).toLowerCase()} de ${money(c.amount)}?`))return;c.status='cancelado';c.updatedAt=new Date().toISOString();c.updatedBy=session.name;saveCommitments();addAudit(`${commitmentTypeLabel(c.type)} cancelada`,`${c.description} · ${money(c.amount)}`);renderCommitments(c.type);renderReports();toast('Conta cancelada.')}
window.reopenCommitment=function(id){if(!canManageTreasury())return;const c=commitments.find(x=>x.id===Number(id));if(!c||c.status!=='cancelado')return;c.status='aberto';c.updatedAt=new Date().toISOString();c.updatedBy=session.name;saveCommitments();addAudit(`${commitmentTypeLabel(c.type)} reaberta`,`${c.description} · ${money(c.amount)}`);renderCommitments(c.type);renderReports();toast('Conta reaberta.')}
window.reverseCommitment=async function(id){if(!canManageTreasury())return;const c=commitments.find(x=>x.id===Number(id));if(!c||c.status!=='liquidado')return;if(!confirm(`Estornar a baixa de ${money(c.settledAmount??c.amount)}?`))return;const e=ledger.find(x=>x.id===Number(c.ledgerId));if(e?.bankId){const b=bankTransactions.find(x=>x.id===Number(e.bankId));if(b){b.status='pending';b.matchedKind=null;b.matchedId=null;b.reconciledAt=null;b.reconciledBy=null;saveBankTransactions()}}if(e?.attachment)try{await deleteFinanceAttachment(e.attachment)}catch{}ledger=ledger.filter(x=>x.id!==Number(c.ledgerId));c.status='aberto';c.settledDate=null;c.settledAmount=null;c.method=null;c.ledgerId=null;c.bankId=null;c.updatedAt=new Date().toISOString();c.updatedBy=session.name;saveLedger();saveCommitments();addAudit(`Baixa de ${commitmentTypeLabel(c.type).toLowerCase()} estornada`,`${c.description} · ${money(c.amount)}`);renderFinanceAux();renderAudit();toast('Baixa estornada.')}


function eventById(id){return financialEvents.find(e=>Number(e.id)===Number(id))||null}
function eventRevenueAccount(){return chartOfAccounts.find(a=>a.code==='1.04')||null}
function eventExpenseAccount(){return chartOfAccounts.find(a=>a.code==='2.09')||null}
function eventCostCenter(){return costCenters.find(c=>c.code==='CC.04')||costCenters.find(c=>c.system)||null}
function eventPaymentsFor(id){return eventPayments.filter(p=>Number(p.eventId)===Number(id))}
function eventLedgerFor(id,type=null){return ledger.filter(e=>Number(e.eventId)===Number(id)&&(!type||e.type===type))}
function ticketsForAmount(amount,ticketValue){if(!(ticketValue>0))return 0;const q=Number(amount)/Number(ticketValue),n=Math.round(q);return Math.abs(q-n)<0.001?n:0}
function renderFinancialEvents(){if(!session||!canViewAllFinance()||!$('#financialEventRows'))return;fillYearSelect($('#eventYearFilter'),$('#eventYearFilter')?.value||new Date().getFullYear());const year=Number($('#eventYearFilter')?.value)||new Date().getFullYear(),q=normalizeText($('#eventSearch')?.value||'');const rows=financialEvents.filter(e=>Number(e.year)===year&&(!q||normalizeText([e.name,e.description].join(' ')).includes(q))).sort((a,b)=>String(b.date).localeCompare(String(a.date)));let rev=0,exp=0,tickets=0;rows.forEach(e=>{rev+=eventLedgerFor(e.id,'receita').reduce((s,x)=>s+Number(x.amount||0),0);exp+=eventLedgerFor(e.id,'despesa').reduce((s,x)=>s+Number(x.amount||0),0);tickets+=eventPaymentsFor(e.id).reduce((s,p)=>s+Number(p.tickets||0),0)});$('#eventRevenueTotal').textContent=money(rev);$('#eventExpenseTotal').textContent=money(exp);$('#eventResultTotal').textContent=money(rev-exp);$('#eventTicketTotal').textContent=String(tickets);$('#newFinancialEventBtn')?.classList.toggle('hidden',!canManageTreasury());$('#financialEventRows').innerHTML=rows.map(e=>{const payments=eventPaymentsFor(e.id),er=eventLedgerFor(e.id,'receita').reduce((s,x)=>s+Number(x.amount||0),0),ee=eventLedgerFor(e.id,'despesa').reduce((s,x)=>s+Number(x.amount||0),0),tk=payments.reduce((s,p)=>s+Number(p.tickets||0),0),people=new Set(payments.map(p=>p.memberId)).size;return `<article class="event-finance-card"><div class="event-finance-head"><div><span class="tag ${e.status==='encerrado'?'subtle':''}">${e.status==='encerrado'?'Encerrado':'Ativo'}</span><h4>${escapeHtml(e.name)}</h4><p>${e.date?dateBR(e.date):'Data não definida'} · ingresso ${money(e.ticketValue)}</p></div><strong class="${er-ee>=0?'money-positive':'money-negative'}">${money(er-ee)}</strong></div><div class="event-finance-metrics"><span><b>${money(er)}</b><small>receitas</small></span><span><b>${money(ee)}</b><small>despesas</small></span><span><b>${tk}</b><small>ingressos</small></span><span><b>${people}</b><small>irmãos pagantes</small></span></div><div class="row-actions"><button class="action-btn" data-action="open-financial-event" data-id="${e.id}">Abrir controle</button>${canManageTreasury()?`<button class="action-btn" data-action="edit-financial-event" data-id="${e.id}">Editar</button>`:''}</div></article>`}).join('')||'<div class="empty-state"><strong>Nenhum evento financeiro neste exercício.</strong><span>Cadastre aniversários, jantares, confraternizações e outras receitas extraordinárias.</span></div>'}
function openFinancialEventForm(id=null){if(!canManageTreasury())return;const e=id?eventById(id):null;$('#financialEventForm').reset();$('#financialEventEditId').value=e?.id||'';$('#financialEventDialogTitle').textContent=e?'Editar evento financeiro':'Novo evento financeiro';$('#financialEventName').value=e?.name||'';$('#financialEventDate').value=e?.date||localDateISO();$('#financialEventTicketValue').value=e?.ticketValue||'';$('#financialEventDescription').value=e?.description||'';$('#financialEventStatus').value=e?.status||'ativo';$('#financialEventDialog').showModal()}
function renderFinancialEventDetail(id){const e=eventById(id);if(!e)return;$('#financialEventDetailDialog').dataset.eventId=e.id;const pays=eventPaymentsFor(e.id).sort((a,b)=>String(b.date).localeCompare(String(a.date))),expenses=eventLedgerFor(e.id,'despesa').sort((a,b)=>String(b.date).localeCompare(String(a.date))),rev=eventLedgerFor(e.id,'receita').reduce((s,x)=>s+Number(x.amount||0),0),exp=expenses.reduce((s,x)=>s+Number(x.amount||0),0);$('#financialEventDetailTitle').textContent=e.name;$('#financialEventDetailSummary').innerHTML=`<strong>${e.date?dateBR(e.date):'Sem data'} · ingresso ${money(e.ticketValue)}</strong><span>Receitas ${money(rev)} · Despesas ${money(exp)} · Resultado ${money(rev-exp)}</span>`;const byMember=new Map();pays.forEach(p=>{const r=byMember.get(Number(p.memberId))||{memberId:Number(p.memberId),amount:0,tickets:0,count:0};r.amount+=Number(p.amount||0);r.tickets+=Number(p.tickets||0);r.count++;byMember.set(Number(p.memberId),r)});$('#financialEventMemberRows').innerHTML=[...byMember.values()].sort((a,b)=>memberName(a.memberId).localeCompare(memberName(b.memberId))).map(r=>`<tr><td><strong>${escapeHtml(memberName(r.memberId))}</strong></td><td>${money(r.amount)}</td><td><strong>${r.tickets}</strong></td><td>${r.count}</td></tr>`).join('')||'<tr><td colspan="4">Nenhum irmão com pagamento registrado.</td></tr>';$('#financialEventPaymentRows').innerHTML=pays.map(p=>`<tr><td>${dateBR(p.date)}</td><td><strong>${escapeHtml(memberName(p.memberId))}</strong></td><td>${money(p.amount)}</td><td>${p.tickets}</td><td>${escapeHtml(p.method||'—')}</td><td>${escapeHtml(p.reference||'—')}</td><td>${canManageTreasury()?`<button class="action-btn danger" data-action="delete-event-payment" data-id="${p.id}">Excluir</button>`:'—'}</td></tr>`).join('')||'<tr><td colspan="7">Nenhum pagamento registrado.</td></tr>';$('#financialEventExpenseRows').innerHTML=expenses.map(x=>`<tr><td>${dateBR(x.date)}</td><td>${escapeHtml(x.description)}</td><td>${escapeHtml(x.counterparty||'—')}</td><td>${money(x.amount)}</td><td>${escapeHtml(x.method||'—')}</td></tr>`).join('')||'<tr><td colspan="5">Nenhuma despesa vinculada ao evento.</td></tr>';$('#eventDetailPaymentBtn')?.classList.toggle('hidden',!canManageTreasury());$('#eventDetailExpenseBtn')?.classList.toggle('hidden',!canManageTreasury());$('#financialEventDetailDialog').showModal()}
function openEventPayment(eventId,bankId=null){if(!canManageTreasury())return;const e=eventById(eventId);if(!e)return;const b=bankId?bankTransactions.find(x=>Number(x.id)===Number(bankId)):null;$('#eventPaymentForm').reset();$('#eventPaymentEventId').value=e.id;$('#eventPaymentBankId').value=b?.id||'';$('#eventPaymentTitle').textContent=`Pagamento · ${e.name}`;$('#eventPaymentMember').innerHTML=members.filter(m=>m.active).sort((a,b)=>a.name.localeCompare(b.name)).map(m=>`<option value="${m.id}">${escapeHtml(m.name)}</option>`).join('');$('#eventPaymentDate').value=b?.date||localDateISO();$('#eventPaymentAmount').value=b?Math.abs(Number(b.amount)).toFixed(2):Number(e.ticketValue).toFixed(2);$('#eventPaymentMethod').value=b?'Extrato bancário':'Pix';$('#eventPaymentReference').value=b?.fitid||'';$('#eventPaymentNotes').value=b?b.description:'';updateEventPaymentTicketPreview();$('#eventPaymentDialog').showModal()}
function updateEventPaymentTicketPreview(){const e=eventById(Number($('#eventPaymentEventId')?.value)),amount=Number($('#eventPaymentAmount')?.value)||0,n=e?ticketsForAmount(amount,e.ticketValue):0;$('#eventPaymentTickets').value=n||'';$('#eventPaymentWarning').textContent=n?`${n} ingresso(s) × ${money(e.ticketValue)} = ${money(amount)}`:`O valor deve ser múltiplo exato de ${money(e?.ticketValue||0)}.`;$('#saveEventPaymentBtn').disabled=!n}
function openEventExpense(eventId){if(!canManageTreasury())return;const e=eventById(eventId);if(!e)return;$('#eventExpenseForm').reset();$('#eventExpenseEventId').value=e.id;$('#eventExpenseTitle').textContent=`Despesa · ${e.name}`;$('#eventExpenseDate').value=localDateISO();$('#eventExpenseMethod').value='Pix';$('#eventExpenseDialog').showModal()}
function createEventPayment(eventId,memberId,{date,amount,method,reference,notes,bankId=null}){const e=eventById(eventId);if(!e)throw new Error('Evento não encontrado.');const tickets=ticketsForAmount(amount,e.ticketValue);if(!tickets)throw new Error(`O valor deve ser múltiplo de ${money(e.ticketValue)}.`);const acc=eventRevenueAccount(),cc=eventCostCenter(),pid=Date.now()+Math.floor(Math.random()*1000),lid=pid+1,p={id:pid,eventId:e.id,memberId:Number(memberId),date,amount:Number(amount),tickets,method,reference,notes,bankId,ledgerId:lid,createdAt:new Date().toISOString(),createdBy:session.name},entry={id:lid,type:'receita',date,accountId:acc?.id||1004,accountCode:acc?.code||'1.04',category:acc?.name||'Eventos e confraternizações',costCenterId:cc?.id||3004,costCenterCode:cc?.code||'CC.04',costCenterName:cc?.name||'Eventos e confraternizações',description:`${e.name} · ${memberName(memberId)} · ${tickets} ingresso(s)`,counterparty:memberName(memberId),amount:Number(amount),method,reference,notes,bankId,eventId:e.id,eventPaymentId:pid,origin:'event-payment',attachment:null,createdAt:new Date().toISOString(),createdBy:session.name,updatedAt:new Date().toISOString(),updatedBy:session.name};eventPayments.push(p);ledger.push(entry);if(bankId){const b=bankTransactions.find(x=>Number(x.id)===Number(bankId));if(b){b.status='reconciled';b.matchedKind='event';b.matchedId=pid;b.reconciledAt=new Date().toISOString();b.reconciledBy=session.name;saveBankTransactions()}}saveEventPayments();saveLedger();addAudit('Pagamento de evento registrado',`${e.name} · ${memberName(memberId)} · ${tickets} ingresso(s) · ${money(amount)}`);return p}
window.deleteEventPayment=function(id){if(!canManageTreasury())return;const p=eventPayments.find(x=>Number(x.id)===Number(id));if(!p||!confirm(`Excluir o pagamento de ${memberName(p.memberId)} no valor de ${money(p.amount)}?`))return;const e=eventById(p.eventId);ledger=ledger.filter(x=>Number(x.id)!==Number(p.ledgerId));if(p.bankId){const b=bankTransactions.find(x=>Number(x.id)===Number(p.bankId));if(b){b.status='pending';b.matchedKind=null;b.matchedId=null;b.reconciledAt=null;b.reconciledBy=null;saveBankTransactions()}}eventPayments=eventPayments.filter(x=>Number(x.id)!==Number(id));saveEventPayments();saveLedger();addAudit('Pagamento de evento excluído',`${e?.name||'Evento'} · ${memberName(p.memberId)} · ${money(p.amount)}`);renderFinancialEvents();renderFinancialEventDetail(p.eventId);renderFinanceAux()}
function openEventFromBank(bankId){if(!canManageTreasury())return;const b=bankTransactions.find(x=>Number(x.id)===Number(bankId));if(!b||b.status!=='pending'||b.amount<=0)return;const options=financialEvents.filter(e=>e.status==='ativo'&&ticketsForAmount(Math.abs(b.amount),e.ticketValue)>0);if(!options.length){toast('Nenhum evento ativo possui ingresso compatível com este valor.');return}$('#eventBankForm').reset();$('#eventBankId').value=b.id;$('#eventBankEvent').innerHTML=options.map(e=>`<option value="${e.id}">${escapeHtml(e.name)} · ${ticketsForAmount(Math.abs(b.amount),e.ticketValue)} ingresso(s) · ${money(e.ticketValue)}/un.</option>`).join('');$('#eventBankMember').innerHTML=members.filter(m=>m.active).sort((a,b)=>a.name.localeCompare(b.name)).map(m=>`<option value="${m.id}">${escapeHtml(m.name)}</option>`).join('');const bm=bestMemberForBank(b);if(bm)$('#eventBankMember').value=String(bm.member.id);$('#eventBankSummary').innerHTML=`<strong>${dateBR(b.date)} · Crédito ${money(Math.abs(b.amount))}</strong><br>${escapeHtml(b.description)}`;$('#eventBankDialog').showModal()}
function bestMemberForBank(bt){let best=null;for(const m of members.filter(x=>x.active)){const score=similarityScore(bt.description,m.name);if(!best||score>best.score)best={member:m,score}}return best&&best.score>0?best:null}

function normalizeText(v=''){return String(v).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim()}
function parseMoneyValue(v){if(typeof v==='number')return v;let t=String(v??'').trim().replace(/R\$|\s/g,'');if(!t)return NaN;if(t.includes(',')&&t.includes('.'))t=t.lastIndexOf(',')>t.lastIndexOf('.')?t.replace(/\./g,'').replace(',','.'):t.replace(/,/g,'');else if(t.includes(','))t=t.replace(/\./g,'').replace(',','.');return Number(t)}
function parseFlexibleDate(v){if(v instanceof Date&&!isNaN(v))return v.toISOString().slice(0,10);if(typeof v==='number'&&window.XLSX){const d=XLSX.SSF.parse_date_code(v);if(d)return `${d.y}-${String(d.m).padStart(2,'0')}-${String(d.d).padStart(2,'0')}`}const t=String(v||'').trim();let m=t.match(/^(\d{1,2})[\/.-](\d{1,2})[\/.-](\d{2,4})/);if(m){let y=Number(m[3]);if(y<100)y+=2000;return `${y}-${m[2].padStart(2,'0')}-${m[1].padStart(2,'0')}`}m=t.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})/);if(m)return `${m[1]}-${m[2].padStart(2,'0')}-${m[3].padStart(2,'0')}`;return''}
function parseDelimited(text){const first=(text.split(/\r?\n/).find(l=>l.trim())||''),delim=(first.match(/;/g)||[]).length>=(first.match(/,/g)||[]).length?';':',';const rows=[];let row=[],field='',quoted=false;for(let i=0;i<text.length;i++){const c=text[i];if(c==='"'){if(quoted&&text[i+1]==='"'){field+='"';i++}else quoted=!quoted}else if(c===delim&&!quoted){row.push(field);field=''}else if((c==='\n'||c==='\r')&&!quoted){if(c==='\r'&&text[i+1]==='\n')i++;row.push(field);if(row.some(x=>String(x).trim()))rows.push(row);row=[];field=''}else field+=c}row.push(field);if(row.some(x=>String(x).trim()))rows.push(row);return rows}
function detectBankHeader(row){const h=(row||[]).map(normalizeText),find=rx=>h.findIndex(x=>rx.test(x)),di=find(/^(data|date)$|data movimento|data lancamento|data lançamento/),descI=find(/historico|descricao|memo|description|detalhe|lançamento|lancamento/),amountI=find(/^valor$|amount|valor movimento/),debitI=find(/debito|debit|saida/),creditI=find(/credito|credit|entrada/),idI=find(/fitid|id transacao|identificador|transaction id|transacao id/),score=[di,descI,amountI,debitI,creditI].filter(i=>i>=0).length;return score>=2&&di>=0?{di,descI,amountI,debitI,creditI,idI,score}:null}
function tableToBankRows(rows,sourceName){if(!rows?.length)return[];const out=[];let header=null,contextYear=null;for(let i=0;i<rows.length;i++){const rowText=(rows[i]||[]).map(v=>String(v||'')).join(' '),ym=rowText.match(/(?:^|\D)(20\d{2})(?:\D|$)/);if(ym)contextYear=Number(ym[1]);const maybe=detectBankHeader(rows[i]);if(maybe){header=maybe;continue}if(!header)continue;const r=rows[i];let date=parseFlexibleDate(r[header.di]);if(!date&&contextYear){const dm=String(r[header.di]||'').trim().match(/^(\d{1,2})[\/.-](\d{1,2})$/);if(dm)date=`${contextYear}-${dm[2].padStart(2,'0')}-${dm[1].padStart(2,'0')}`}if(!date)continue;contextYear=yearOfDate(date);let amount=header.amountI>=0?parseMoneyValue(r[header.amountI]):NaN;if(!Number.isFinite(amount)){const cr=header.creditI>=0?parseMoneyValue(r[header.creditI]):NaN,db=header.debitI>=0?parseMoneyValue(r[header.debitI]):NaN;if(Number.isFinite(cr)&&cr!==0)amount=Math.abs(cr);else if(Number.isFinite(db)&&db!==0)amount=-Math.abs(db)}if(!Number.isFinite(amount)||amount===0)continue;out.push({date,description:String(r[header.descI>=0?header.descI:0]||'Movimentação bancária').trim(),amount,fitid:header.idI>=0?String(r[header.idI]||'').trim():'',source:sourceName})}return out}
function parseOFX(text,sourceName){const out=[];for(const block of text.match(/<STMTTRN>[\s\S]*?(?=<STMTTRN>|<\/BANKTRANLIST>|$)/gi)||[]){const tag=n=>{const m=block.match(new RegExp(`<${n}>([^<\\r\\n]+)`,'i'));return m?m[1].trim():''};const rawDate=tag('DTPOSTED').slice(0,8),date=rawDate.length===8?`${rawDate.slice(0,4)}-${rawDate.slice(4,6)}-${rawDate.slice(6,8)}`:'',amount=Number(tag('TRNAMT'));if(!date||!Number.isFinite(amount))continue;out.push({date,description:[tag('NAME'),tag('MEMO')].filter(Boolean).join(' — ')||'Movimentação bancária',amount,fitid:tag('FITID'),source:sourceName})}return out}
function bankFingerprint(b){const fid=String(b.fitid||'').trim();return fid&&fid.length>=5&&!/^0+$/.test(fid)?`fit:${fid}`:`raw:${b.date}|${Number(b.amount).toFixed(2)}|${normalizeText(b.description)}`}
async function importBankStatement(file){let rows=[],sources=[];const ext=(file.name.split('.').pop()||'').toLowerCase();if(['ofx','qfx'].includes(ext)){rows=parseOFX(await file.text(),file.name);sources=['OFX/QFX']}else if(['xlsx','xls'].includes(ext)){if(!window.XLSX)throw new Error('Leitor XLSX não carregado.');const wb=XLSX.read(await file.arrayBuffer(),{type:'array',cellDates:true});for(const sheetName of wb.SheetNames){const ws=wb.Sheets[sheetName],part=tableToBankRows(XLSX.utils.sheet_to_json(ws,{header:1,raw:true,defval:''}),`${file.name} · ${sheetName}`);rows.push(...part);sources.push(`${sheetName}: ${part.length}`)}}else{rows=tableToBankRows(parseDelimited(await file.text()),file.name);sources=['CSV/TXT']}const existing=new Set(bankTransactions.map(bankFingerprint));let added=0;const batch=`${Date.now()}-${file.name}`;for(const r of rows){if(existing.has(bankFingerprint(r)))continue;bankTransactions.push({id:Date.now()+added+Math.floor(Math.random()*1000),...r,status:'pending',matchedKind:null,matchedId:null,importBatch:batch,importedAt:new Date().toISOString(),importedBy:session.name});existing.add(bankFingerprint(r));added++}saveBankTransactions();const months=[...new Set(rows.map(r=>String(r.date).slice(0,7)))].sort(),range=months.length?`${monthLabel(months[0])} até ${monthLabel(months.at(-1))}`:'sem período identificado';addAudit('Extrato importado',`${file.name} · ${added} nova(s) de ${rows.length} lida(s) · ${months.length} mês(es) · ${range}`);return{added,total:rows.length,months,range,sources}}
function dateDiffDays(a,b){return Math.abs((new Date(a+'T12:00:00')-new Date(b+'T12:00:00'))/86400000)}
function similarityScore(desc,text){const a=new Set(normalizeText(desc).split(' ').filter(x=>x.length>3)),b=new Set(normalizeText(text).split(' ').filter(x=>x.length>3));let n=0;a.forEach(x=>{if(b.has(x))n++});return n}
function bankCandidates(bt){const amt=Math.abs(Number(bt.amount));const list=[];if(bt.amount>0){const bm=bestMemberForBank(bt);if(bm){for(const ev of financialEvents.filter(e=>e.status==='ativo'&&Number(e.ticketValue)>0)){const n=ticketsForAmount(amt,ev.ticketValue);if(n)list.push({value:`event:${ev.id}:${bm.member.id}`,label:`Evento · ${ev.name} · ${bm.member.name} · ${n} ingresso(s) · ${money(amt)}`,score:3+bm.score*3,kind:'event',id:ev.id,memberId:bm.member.id})}}for(const c of commitments.filter(x=>x.type==='receber'&&x.status==='aberto'&&Math.abs(Number(x.amount)-amt)<0.02)){list.push({value:`commitment:${c.id}`,label:`Conta a receber · ${c.description} · ${money(c.amount)}`,score:6+similarityScore(bt.description,[c.description,c.counterparty].join(' '))*3+(dateDiffDays(bt.date,c.dueDate)<=20?3:0),kind:'commitment',id:c.id})}for(const d of finance.filter(x=>!['pago','isento'].includes(x.status)&&Math.abs(Number(x.value)-amt)<0.02)){const name=memberName(d.memberId),score=4+similarityScore(bt.description,name)*4+(dateDiffDays(bt.date,d.due)<=45?2:0);list.push({value:`due:${d.id}`,label:`Mensalidade · ${name} · ${monthLabel(d.month)} · ${money(d.value)}`,score,kind:'due',id:d.id})}for(const e of ledger.filter(x=>x.type==='receita'&&!x.bankId&&Math.abs(Number(x.amount)-amt)<0.02)){list.push({value:`ledger:${e.id}`,label:`Receita · ${e.description} · ${money(e.amount)}`,score:3+similarityScore(bt.description,[e.description,e.counterparty].join(' '))*2+(dateDiffDays(bt.date,e.date)<=10?2:0),kind:'ledger',id:e.id})}}else{for(const c of commitments.filter(x=>x.type==='pagar'&&x.status==='aberto'&&Math.abs(Number(x.amount)-amt)<0.02)){list.push({value:`commitment:${c.id}`,label:`Conta a pagar · ${c.description} · ${money(c.amount)}`,score:7+similarityScore(bt.description,[c.description,c.counterparty].join(' '))*3+(dateDiffDays(bt.date,c.dueDate)<=20?3:0),kind:'commitment',id:c.id})}for(const e of ledger.filter(x=>x.type==='despesa'&&!x.bankId&&Math.abs(Number(x.amount)-amt)<0.02)){list.push({value:`ledger:${e.id}`,label:`Despesa · ${e.description} · ${money(e.amount)}`,score:4+similarityScore(bt.description,[e.description,e.counterparty].join(' '))*2+(dateDiffDays(bt.date,e.date)<=10?2:0),kind:'ledger',id:e.id})}}return list.sort((a,b)=>b.score-a.score)}
function bankSuggestion(bt){return bankCandidates(bt)[0]||null}
function autoConfidenceClass(v){const n=Number(v)||0;return n>=85?'ai-high':n>=65?'ai-medium':'ai-low'}
function targetMemberId(candidate){if(!candidate)return null;if(candidate.kind==='due'){const d=finance.find(x=>Number(x.id)===Number(candidate.id));return d?Number(d.memberId):null}if(candidate.kind==='event')return Number(candidate.memberId)||null;return null}
function historicalEntityBonus(bt,candidate){const memberId=targetMemberId(candidate);if(!memberId)return 0;let best=0;for(const old of bankTransactions){if(Number(old.id)===Number(bt.id)||old.status!=='reconciled')continue;let oldMemberId=null;if(old.matchedKind==='due'){const d=finance.find(x=>Number(x.id)===Number(old.matchedId));oldMemberId=d?Number(d.memberId):null}else if(old.matchedKind==='event'){const p=eventPayments.find(x=>Number(x.id)===Number(old.matchedId));oldMemberId=p?Number(p.memberId):null}if(oldMemberId!==memberId)continue;const sim=similarityScore(bt.description,old.description);if(sim>best)best=sim}return Math.min(12,best*6)}
function meaningfulSimilarityScore(a,b){const stop=new Set(['pix','recebido','recebida','enviado','enviada','debito','credito','banco','inter','transferencia','transacao','pagamento','pagto','compra','cartao','movimento','lancamento','historico','valor','data','brasil']);const make=v=>new Set(normalizeText(v).split(' ').filter(x=>x.length>3&&!stop.has(x)));const A=make(a),B=make(b);let n=0;for(const x of A)if(B.has(x))n++;return n}
function historicalLedgerSuggestion(bt){let best=null;for(const old of bankTransactions){if(Number(old.id)===Number(bt.id)||old.status!=='reconciled'||old.matchedKind!=='ledger')continue;if(Math.sign(Number(old.amount))!==Math.sign(Number(bt.amount)))continue;const e=ledger.find(x=>Number(x.id)===Number(old.matchedId));if(!e)continue;const score=Math.max(meaningfulSimilarityScore(bt.description,old.description),meaningfulSimilarityScore(bt.description,[e.description,e.counterparty].join(' ')));if(score<=0)continue;if(!best||score>best.score)best={score,entry:e,old}}if(!best)return null;const acc=accountForLedger(best.entry),cc=costCenterForLedger(best.entry);if(!acc||!cc)return null;const confidence=Math.min(94,best.score>=3?94:best.score===2?86:72);return{bankId:Number(bt.id),action:'create_ledger',candidateTarget:null,accountCode:acc.code,costCenterCode:cc.code,counterparty:best.entry.counterparty||'',confidence,reason:`Classificação aprendida com conciliação anterior semelhante (${best.score} termo(s) relevante(s) em comum).`}}
function keywordLedgerSuggestion(bt){const d=normalizeText(bt.description);if(bt.amount>=0)return null;const rules=[
  {rx:/\b(ceee|equatorial)\b/,account:'2.02',center:'CC.02',name:'energia elétrica'},
  {rx:/\b(corsan|saneamento|agua)\b/,account:'2.03',center:'CC.02',name:'água e saneamento'},
  {rx:/\b(claro|net|vivo|tim|internet)\b/,account:'2.04',center:'CC.01',name:'internet e comunicação'},
  {rx:/\b(tarifa|cesta|pacote|manutencao conta|bank fee)\b/,account:'2.12',center:'CC.01',name:'tarifa bancária'},
  {rx:/\bglmergs\b.*\bcapitacao\b|\bcapitacao\b.*\bglmergs\b/,account:'2.16',center:'CC.01',name:'Capitação GLMERGS'},
  {rx:/\bglmergs\b.*\bdam\b|\bdam\b.*\bglmergs\b/,account:'2.17',center:'CC.01',name:'DAM GLMERGS'}
];for(const r of rules){if(!r.rx.test(d))continue;const acc=chartOfAccounts.find(a=>a.code===r.account&&a.active!==false),cc=costCenters.find(c=>c.code===r.center&&c.active!==false);if(acc&&cc)return{bankId:Number(bt.id),action:'create_ledger',candidateTarget:null,accountCode:acc.code,costCenterCode:cc.code,counterparty:'',confidence:88,reason:`Regra local reconheceu ${r.name} pelo histórico textual do extrato.`}}return null}
function candidateEvidence(bt,c){if(!c)return 0;if(c.kind==='due'){const d=finance.find(x=>Number(x.id)===Number(c.id));return similarityScore(bt.description,d?memberName(d.memberId):'')}if(c.kind==='event'){return similarityScore(bt.description,memberName(c.memberId))}if(c.kind==='commitment'){const x=commitments.find(v=>Number(v.id)===Number(c.id));return similarityScore(bt.description,x?[x.description,x.counterparty].join(' '):'')}if(c.kind==='ledger'){const x=ledger.find(v=>Number(v.id)===Number(c.id));return similarityScore(bt.description,x?[x.description,x.counterparty].join(' '):'')}return 0}
function smartBankSuggestion(bt){const candidates=bankCandidates(bt).map(c=>({...c,learnBonus:historicalEntityBonus(bt,c)}));if(candidates.length){candidates.sort((a,b)=>(b.score+b.learnBonus)-(a.score+a.learnBonus));const top=candidates[0],second=candidates[1],evidence=candidateEvidence(bt,top),margin=(top.score+top.learnBonus)-((second?.score||0)+(second?.learnBonus||0));let confidence=0;if(top.kind==='due')confidence=evidence>=2?97:evidence===1?88:(margin>=4?66:48);else if(top.kind==='event')confidence=evidence>=2?96:evidence===1?86:50;else if(top.kind==='commitment')confidence=evidence>=2?95:evidence===1?84:(margin>=4?72:55);else if(top.kind==='ledger')confidence=evidence>=2?92:evidence===1?78:56;confidence=Math.min(99,confidence+Math.min(8,top.learnBonus));if(second&&margin<=1)confidence=Math.min(confidence,68);const reasonParts=[];if(evidence)reasonParts.push(`${evidence} termo(s) relevante(s) coincidem`);reasonParts.push('valor compatível');if(top.learnBonus)reasonParts.push('há conciliações anteriores semelhantes');if(margin<=1&&second)reasonParts.push('existem candidatos próximos');return{bankId:Number(bt.id),action:confidence>=60?'match':'manual',candidateTarget:confidence>=60?top.value:null,accountCode:null,costCenterCode:null,counterparty:'',confidence,reason:reasonParts.join('; ')+'.'}}const learned=historicalLedgerSuggestion(bt);if(learned)return learned;const keyword=keywordLedgerSuggestion(bt);if(keyword)return keyword;return{bankId:Number(bt.id),action:'manual',candidateTarget:null,accountCode:null,costCenterCode:null,counterparty:'',confidence:0,reason:'Nenhuma correspondência segura foi encontrada pelo motor local.'}}
function suggestionLabel(s,b,fallback='Correspondência sugerida'){if(!s)return'';if(s.action==='match'){const c=bankCandidates(b).find(x=>x.value===s.candidateTarget);return c?.label||fallback}if(s.action==='create_ledger'){const a=chartOfAccounts.find(x=>x.code===s.accountCode),c=costCenters.find(x=>x.code===s.costCenterCode);return `Criar ${b.amount>0?'receita':'despesa'} · ${a?accountText(a):s.accountCode||'conta'} · ${c?costCenterText(c):s.costCenterCode||'centro'}`}return'Manual: revisar esta movimentação'}
function filteredBankRows(){const rawYear=$('#bankYearFilter')?.value||String(new Date().getFullYear()),year=rawYear==='todos'?null:Number(rawYear),status=$('#bankStatusFilter')?.value||'todos',q=($('#bankSearch')?.value||'').toLowerCase();return bankTransactions.filter(b=>(year==null||yearOfDate(b.date)===year)&&(status==='todos'||b.status===status)&&(!q||normalizeText(b.description).includes(normalizeText(q)))).sort((a,b)=>String(b.date).localeCompare(String(a.date)))}
function renderBankTransactions(){
  if(!session||!canViewAllFinance())return;
  const rows=filteredBankRows();
  $('#bankCreditTotal').textContent=money(rows.filter(b=>b.amount>0).reduce((s,b)=>s+b.amount,0));
  $('#bankDebitTotal').textContent=money(Math.abs(rows.filter(b=>b.amount<0).reduce((s,b)=>s+b.amount,0)));
  $('#bankPendingCount').textContent=rows.filter(b=>b.status==='pending').length;
  $('#bankReconciledCount').textContent=rows.filter(b=>b.status==='reconciled').length;
  const pendingVisible=rows.filter(b=>b.status==='pending');
  const autoRemaining=pendingVisible.filter(b=>!autoReconcileSuggestions.has(Number(b.id)));
  const autoComplete=pendingVisible.length>0&&autoRemaining.length===0;
  const aiRemaining=pendingVisible.filter(b=>autoReconcileSuggestions.has(Number(b.id))&&!aiReconcileSuggestions.has(Number(b.id)));
  if($('#autoReconcileBtn')){
    $('#autoReconcileBtn').disabled=autoReconcileLoading||aiReconcileLoading||!canManageTreasury()||!autoRemaining.length;
    $('#autoReconcileBtn').textContent=autoReconcileLoading?'Analisando automaticamente...':`⚡ Etapa 1 · Analisar automaticamente${autoRemaining.length?` (${autoRemaining.length})`:''}`;
  }
  if($('#aiReconcileBtn')){
    $('#aiReconcileBtn').disabled=aiReconcileLoading||autoReconcileLoading||!canManageTreasury()||!autoComplete||!aiRemaining.length;
    $('#aiReconcileBtn').textContent=aiReconcileLoading?'Revisando com IA...':`✨ Etapa 2 · Revisar com IA${aiRemaining.length?` (${Math.min(aiRemaining.length,25)}${aiRemaining.length>25?` de ${aiRemaining.length}`:''})`:''}`;
    $('#aiReconcileBtn').title=!pendingVisible.length?'Não há movimentações pendentes.':!autoComplete?'Conclua primeiro a análise automática de todas as movimentações deste filtro.':'A IA revisa até 25 movimentações por vez.';
  }
  $('#bankRows').innerHTML=rows.map(b=>{
    const auto=b.status==='pending'?autoReconcileSuggestions.get(Number(b.id)):null;
    const ai=b.status==='pending'?aiReconcileSuggestions.get(Number(b.id)):null;
    const rule=b.status==='pending'?bankSuggestion(b):null;
    const statusLabelBank=b.status==='reconciled'?'Conciliado':b.status==='ignored'?'Ignorado':'Pendente';
    let sugHtml='—';
    if(auto||ai){
      sugHtml=`<div class="suggestion-stack">${auto?`<div class="ai-suggestion ${autoConfidenceClass(auto.confidence)}"><div><span class="ai-badge">AUTO ${Math.round(Number(auto.confidence)||0)}%</span> <strong>${escapeHtml(suggestionLabel(auto,b,'Correspondência sugerida automaticamente'))}</strong></div><small>${escapeHtml(auto.reason||'Sugestão gerada pelo motor local.')}</small></div>`:''}${ai?`<div class="ai-suggestion ai-review ${autoConfidenceClass(ai.confidence)}"><div><span class="ai-badge">IA ${Math.round(Number(ai.confidence)||0)}%</span> <strong>${escapeHtml(suggestionLabel(ai,b,'Correspondência sugerida pela IA'))}</strong></div><small>${escapeHtml(ai.reason||'Revisão gerada pela IA.')}</small></div>`:''}</div>`;
    }else if(rule){sugHtml=`<small>${escapeHtml(rule.label)}</small>`}
    let actions='';
    if(b.status==='pending'&&canManageTreasury()){
      if(ai){actions+=`<button class="action-btn ai-confirm" data-action="confirm-ai-reconcile" data-id="${b.id}" ${ai.action==='manual'?'disabled':''}>Confirmar IA</button><button class="action-btn" data-action="open-reconcile" data-id="${b.id}">Corrigir</button><button class="action-btn" data-action="dismiss-ai-reconcile" data-id="${b.id}">Dispensar IA</button>`;if(auto&&auto.action!=='manual')actions+=`<button class="action-btn" data-action="confirm-auto-reconcile" data-id="${b.id}">Usar AUTO</button>`}
      else if(auto){actions+=`<button class="action-btn ai-confirm" data-action="confirm-auto-reconcile" data-id="${b.id}" ${auto.action==='manual'?'disabled':''}>Confirmar AUTO</button><button class="action-btn" data-action="open-reconcile" data-id="${b.id}">Corrigir</button><button class="action-btn" data-action="dismiss-auto-reconcile" data-id="${b.id}">Refazer AUTO</button>`}
      else{actions+=`<button class="action-btn" data-action="open-reconcile" data-id="${b.id}">Conciliar</button>${b.amount>0?`<button class="action-btn" data-action="event-from-bank" data-id="${b.id}">Evento</button>`:''}<button class="action-btn" data-action="create-ledger-from-bank" data-id="${b.id}">Criar ${b.amount>0?'receita':'despesa'}</button><button class="action-btn danger" data-action="ignore-bank" data-id="${b.id}">Ignorar</button>`}
    }else if(b.status!=='pending'&&canManageTreasury()){actions=`<button class="action-btn" data-action="undo-bank" data-id="${b.id}">Desfazer</button>`}
    return `<tr><td>${dateBR(b.date)}</td><td><strong>${escapeHtml(b.description)}</strong><br><small>${escapeHtml(b.source||'')}</small></td><td class="${b.amount>=0?'money-positive':'money-negative'}">${b.amount>=0?'+':'−'} ${money(Math.abs(b.amount))}</td><td>${sugHtml}</td><td><span class="status ${b.status==='reconciled'?'pago':b.status==='ignored'?'cancelado':'aberto'}">${statusLabelBank}</span></td><td><div class="row-actions">${actions}</div></td></tr>`;
  }).join('')||'<tr><td colspan="6">Nenhuma movimentação bancária para o filtro selecionado.</td></tr>';
}
function analyzeBankAutomatically(){
  if(!canManageTreasury()||autoReconcileLoading||aiReconcileLoading)return;
  const rows=filteredBankRows().filter(b=>b.status==='pending'&&!autoReconcileSuggestions.has(Number(b.id)));
  if(!rows.length){toast('Todas as movimentações pendentes deste filtro já passaram pela análise automática.');return}
  autoReconcileLoading=true;renderBankTransactions();
  if($('#aiReconcileInfo'))$('#aiReconcileInfo').textContent=`Etapa 1/2 · Analisando automaticamente ${rows.length} movimentação(ões), sem API externa...`;
  setTimeout(()=>{try{
    for(const b of rows)autoReconcileSuggestions.set(Number(b.id),smartBankSuggestion(b));
    const high=rows.filter(b=>(autoReconcileSuggestions.get(Number(b.id))?.confidence||0)>=85).length;
    const manual=rows.filter(b=>autoReconcileSuggestions.get(Number(b.id))?.action==='manual').length;
    if($('#aiReconcileInfo'))$('#aiReconcileInfo').textContent=`Etapa 1 concluída · ${rows.length} movimentação(ões) analisada(s) automaticamente. ${high} com alta confiança; ${manual} para revisão manual. Agora a Etapa 2 pode revisar os resultados com IA.`;
    toast('Análise automática concluída. Agora você pode iniciar a revisão com IA.');
  }catch(err){if($('#aiReconcileInfo'))$('#aiReconcileInfo').textContent=err.message||'Falha na análise automática.';toast(err.message||'Falha na análise automática.')}finally{autoReconcileLoading=false;renderBankTransactions()}},20)
}
async function analyzeBankWithAI(){ toast('IA desativada nesta instalação.'); }
window.dismissAutoReconcile=function(id){autoReconcileSuggestions.delete(Number(id));aiReconcileSuggestions.delete(Number(id));renderBankTransactions()}
window.dismissAIReconcile=function(id){aiReconcileSuggestions.delete(Number(id));renderBankTransactions()}
function createLedgerFromSuggestion(b,sug,source){const type=b.amount>0?'receita':'despesa',acc=chartOfAccounts.find(a=>a.code===sug.accountCode&&a.type===type&&a.active!==false),cc=costCenters.find(c=>c.code===sug.costCenterCode&&c.active!==false);if(!acc||!cc)throw new Error('A classificação sugerida não está mais disponível.');const isAI=source==='IA',entry={id:Date.now(),type,date:b.date,accountId:acc.id,accountCode:acc.code,category:acc.name,costCenterId:cc.id,costCenterCode:cc.code,costCenterName:cc.name,description:b.description,counterparty:sug.counterparty||'',amount:Math.abs(b.amount),method:'Extrato bancário',reference:b.fitid||'',notes:`Classificação sugerida por ${isAI?'IA':'motor automático'} e confirmada por ${session.name}. ${sug.reason||''}`.trim(),bankId:b.id,attachment:null,createdAt:new Date().toISOString(),createdBy:session.name,updatedAt:new Date().toISOString(),updatedBy:session.name};ledger.push(entry);b.status='reconciled';b.matchedKind='ledger';b.matchedId=entry.id;b.reconciledAt=new Date().toISOString();b.reconciledBy=session.name;saveLedger();saveBankTransactions();addAudit(`${ledgerLabel(type)} conciliada com sugestão ${isAI?'de IA':'automática'}`,`${accountText(acc)} · ${costCenterText(cc)} · ${entry.description} · ${money(entry.amount)}`)}
function applyReconcileSuggestion(id,sug,source){if(!canManageTreasury())return;const b=bankTransactions.find(x=>Number(x.id)===Number(id));if(!b||b.status!=='pending'||!sug)return;if(sug.action==='manual'){toast(`${source==='IA'?'A IA':'O motor automático'} marcou esta movimentação para revisão manual.`);return}const label=suggestionLabel(sug,b);if(!confirm(`Confirmar esta sugestão ${source==='IA'?'da IA':'automática'}?\n\n${label}\n\nConfiança: ${Math.round(Number(sug.confidence)||0)}%\n${sug.reason||''}`))return;try{if(sug.action==='match')applyBankMatch(b,sug.candidateTarget);else if(sug.action==='create_ledger')createLedgerFromSuggestion(b,sug,source);else throw new Error('Sugestão inválida.');autoReconcileSuggestions.delete(Number(id));aiReconcileSuggestions.delete(Number(id));renderFinance();renderFinanceAux();renderAudit();toast('Sugestão confirmada e movimentação conciliada.')}catch(err){toast(err.message||'Não foi possível aplicar a sugestão.')}}
window.confirmAutoReconcile=function(id){return applyReconcileSuggestion(id,autoReconcileSuggestions.get(Number(id)),'AUTO')}
window.confirmAIReconcile=function(id){return applyReconcileSuggestion(id,aiReconcileSuggestions.get(Number(id)),'IA')}

window.openReconcile=function(id){if(!canManageTreasury())return;const b=bankTransactions.find(x=>x.id===Number(id));if(!b)return;const c=bankCandidates(b);$('#reconcileBankId').value=b.id;$('#reconcileBankSummary').innerHTML=`<strong>${dateBR(b.date)} · ${b.amount>0?'Crédito':'Débito'} ${money(Math.abs(b.amount))}</strong><br>${escapeHtml(b.description)}`;$('#reconcileTarget').innerHTML=c.length?c.map(x=>`<option value="${x.value}">${escapeHtml(x.label)}</option>`).join(''):'<option value="">Nenhuma correspondência encontrada</option>';$('#reconcileDialog').showModal()}
function applyBankMatch(b,target){const [kind,idRaw]=target.split(':'),id=Number(idRaw);if(kind==='due'){const d=finance.find(x=>x.id===id);if(!d||d.status==='pago')throw new Error('Mensalidade indisponível.');d.status='pago';d.paidAt=b.date;d.paidValue=Math.abs(b.amount);d.paymentMethod='Extrato bancário';d.receipt=d.receipt||nextReceipt(d);d.updatedAt=new Date().toISOString();d.bankId=b.id;saveFinance();b.matchedKind='due';b.matchedId=d.id}else if(kind==='commitment'){const c=commitments.find(x=>x.id===id);if(!c||c.status!=='aberto')throw new Error('Conta prevista indisponível.');const e=createLedgerForCommitment(c,{date:b.date,amount:Math.abs(b.amount),method:'Extrato bancário',reference:b.fitid||'',notes:`Conciliado com ${b.description}`,bankId:b.id});saveCommitments();saveLedger();b.matchedKind='commitment';b.matchedId=c.id}else if(kind==='ledger'){const e=ledger.find(x=>x.id===id);if(!e)throw new Error('Lançamento indisponível.');e.bankId=b.id;e.updatedAt=new Date().toISOString();e.updatedBy=session.name;saveLedger();b.matchedKind='ledger';b.matchedId=e.id}else if(kind==='event'){const parts=target.split(':'),eventId=Number(parts[1]),memberId=Number(parts[2]);const p=createEventPayment(eventId,memberId,{date:b.date,amount:Math.abs(b.amount),method:'Extrato bancário',reference:b.fitid||'',notes:b.description,bankId:b.id});b.matchedKind='event';b.matchedId=p.id}else throw new Error('Selecione uma correspondência.');b.status='reconciled';b.reconciledAt=new Date().toISOString();b.reconciledBy=session.name;saveBankTransactions();addAudit('Movimentação conciliada',`${dateBR(b.date)} · ${money(Math.abs(b.amount))} · ${b.description}`)}
window.createLedgerFromBank=function(id){if(!canManageTreasury())return;const b=bankTransactions.find(x=>x.id===Number(id));if(!b||b.status!=='pending')return;const type=b.amount>0?'receita':'despesa',fallback=chartOfAccounts.find(a=>a.code===(type==='receita'?'1.99':'2.99')),generalCenter=costCenters.find(c=>c.system)||costCenters.find(c=>c.code==='CC.99'),entry={id:Date.now(),type,date:b.date,accountId:fallback?.id||null,accountCode:fallback?.code||'',category:fallback?.name||(type==='receita'?'Outras receitas':'Outras despesas'),costCenterId:generalCenter?.id||3099,costCenterCode:generalCenter?.code||'CC.99',costCenterName:generalCenter?.name||'Geral / não alocado',description:b.description,counterparty:'',amount:Math.abs(b.amount),method:'Extrato bancário',reference:b.fitid||'',notes:`Criado a partir do extrato ${b.source||''}`.trim(),bankId:b.id,attachment:null,createdAt:new Date().toISOString(),createdBy:session.name,updatedAt:new Date().toISOString(),updatedBy:session.name};ledger.push(entry);b.status='reconciled';b.matchedKind='ledger';b.matchedId=entry.id;b.reconciledAt=new Date().toISOString();b.reconciledBy=session.name;saveLedger();saveBankTransactions();addAudit(`${ledgerLabel(type)} criada pelo extrato`,`${accountText(fallback)} · ${entry.description} · ${money(entry.amount)}`);renderFinanceAux();renderAudit();toast(`${ledgerLabel(type)} criada e conciliada.`)}
window.ignoreBank=function(id){if(!canManageTreasury())return;const b=bankTransactions.find(x=>x.id===Number(id));if(!b)return;b.status='ignored';b.reconciledAt=new Date().toISOString();b.reconciledBy=session.name;saveBankTransactions();addAudit('Movimentação bancária ignorada',`${dateBR(b.date)} · ${money(Math.abs(b.amount))}`);renderBankTransactions();renderAudit()}
window.undoBank=function(id){if(!canManageTreasury())return;const b=bankTransactions.find(x=>x.id===Number(id));if(!b)return;if(b.matchedKind==='due'){const d=finance.find(x=>x.id===Number(b.matchedId));if(d&&d.bankId===b.id){d.status='aberto';d.paidAt=null;d.paidValue=null;d.paymentMethod=null;d.receipt=null;d.bankId=null;d.updatedAt=new Date().toISOString();saveFinance()}}if(b.matchedKind==='ledger'){const e=ledger.find(x=>x.id===Number(b.matchedId));if(e&&e.bankId===b.id){e.bankId=null;saveLedger()}}if(b.matchedKind==='event'){const p=eventPayments.find(x=>Number(x.id)===Number(b.matchedId));if(p){ledger=ledger.filter(e=>Number(e.id)!==Number(p.ledgerId));eventPayments=eventPayments.filter(x=>Number(x.id)!==Number(p.id));saveLedger();saveEventPayments()}}if(b.matchedKind==='commitment'){const c=commitments.find(x=>x.id===Number(b.matchedId));if(c&&c.bankId===b.id){ledger=ledger.filter(e=>e.id!==Number(c.ledgerId));c.status='aberto';c.settledDate=null;c.settledAmount=null;c.method=null;c.ledgerId=null;c.bankId=null;c.updatedAt=new Date().toISOString();c.updatedBy=session.name;saveLedger();saveCommitments()}}b.status='pending';b.matchedKind=null;b.matchedId=null;b.reconciledAt=null;b.reconciledBy=null;saveBankTransactions();addAudit('Conciliação desfeita',`${dateBR(b.date)} · ${money(Math.abs(b.amount))}`);renderFinanceAux();renderFinance();renderAudit();toast('Conciliação desfeita.')}

function openingBalance(year){return Number(financeSettings.openingBalances?.[String(year)]??financeSettings.openingBalances?.[year]??0)||0}
function cashflowForYear(year){let running=openingBalance(year);return monthNamesShort.map((name,i)=>{const mo=String(i+1).padStart(2,'0'),prefix=`${year}-${mo}`,dues=finance.filter(f=>f.status==='pago'&&String(f.paidAt||'').startsWith(prefix)).reduce((s,f)=>s+Number(f.paidValue??f.value),0),revenues=ledger.filter(e=>e.type==='receita'&&String(e.date).startsWith(prefix)).reduce((s,e)=>s+Number(e.amount),0),expenses=ledger.filter(e=>e.type==='despesa'&&String(e.date).startsWith(prefix)).reduce((s,e)=>s+Number(e.amount),0),net=dues+revenues-expenses;running+=net;return{name,month:prefix,dues,revenues,expenses,net,balance:running}})}
function renderCashflow(){if(!session||!canViewAllFinance())return;const year=Number($('#cashflowYear')?.value)||new Date().getFullYear(),rows=cashflowForYear(year),dues=rows.reduce((s,r)=>s+r.dues,0),rev=rows.reduce((s,r)=>s+r.revenues,0),exp=rows.reduce((s,r)=>s+r.expenses,0),net=dues+rev-exp;$('#cashflowIncome').textContent=money(dues+rev);$('#cashflowExpenses').textContent=money(exp);$('#cashflowNet').textContent=money(net);$('#cashflowBalance').textContent=money(openingBalance(year)+net);const bankNet=bankTransactions.filter(b=>yearOfDate(b.date)===year&&b.status!=='ignored').reduce((s,b)=>s+Number(b.amount),0);$('#cashflowAccountLabel').textContent=`${financeSettings.accountLabel||'Conta bancária'} · saldo pelo extrato: ${money(openingBalance(year)+bankNet)}`;$('#cashflowRows').innerHTML=rows.map(r=>`<tr><td>${r.name}</td><td>${money(r.dues)}</td><td>${money(r.revenues)}</td><td>${money(r.expenses)}</td><td class="${r.net>=0?'money-positive':'money-negative'}">${money(r.net)}</td><td>${money(r.balance)}</td></tr>`).join('')}
function renderReports(){if(!session||!canViewAllFinance())return;const year=Number($('#reportYear')?.value)||new Date().getFullYear(),cf=cashflowForYear(year),dues=cf.reduce((s,r)=>s+r.dues,0),rev=cf.reduce((s,r)=>s+r.revenues,0),exp=cf.reduce((s,r)=>s+r.expenses,0),open=finance.filter(f=>String(f.month).startsWith(`${year}-`)&&!['pago','isento'].includes(f.status)).reduce((s,f)=>s+Number(f.value),0),pendingMembers=new Set(finance.filter(f=>String(f.month).startsWith(`${year}-`)&&!['pago','isento'].includes(f.status)).map(f=>f.memberId)).size,systemBalance=openingBalance(year)+dues+rev-exp,bankNet=bankTransactions.filter(b=>yearOfDate(b.date)===year&&b.status!=='ignored').reduce((s,b)=>s+Number(b.amount),0),bankBalance=openingBalance(year)+bankNet,diff=bankBalance-systemBalance;const openPayables=commitments.filter(c=>c.type==='pagar'&&yearOfDate(c.dueDate||c.competence)===year&&!['liquidado','cancelado'].includes(c.status)),openReceivables=commitments.filter(c=>c.type==='receber'&&yearOfDate(c.dueDate||c.competence)===year&&!['liquidado','cancelado'].includes(c.status)),overduePayables=openPayables.filter(c=>commitmentStatus(c)==='vencido'),overdueReceivables=openReceivables.filter(c=>commitmentStatus(c)==='vencido');const cfg=configuredForYear(year)||{},glmergsGenerated=commitments.filter(c=>c.origin==='glmergs-monthly'&&String(c.provisionMonth||c.competence).startsWith(`${year}-`)&&c.status!=='cancelado').reduce((s,c)=>s+Number(c.amount||0),0),glmergsAnnualProjection=members.filter(m=>m.active).length*annualGlmergsPerMember(cfg),glmergsPaid=ledger.filter(e=>yearOfDate(e.date)===year&&['2.16','2.17'].includes(accountForLedger(e)?.code||e.accountCode)).reduce((s,e)=>s+Number(e.amount||0),0),glmergsPending=Math.max(0,glmergsGenerated-glmergsPaid),economicAdjusted=(dues+rev-exp)-glmergsPending;const rows=[['Mensalidades recebidas',money(dues),'Entrada bruta efetivamente recebida'],['Obrigação GLMERGS gerada',money(glmergsGenerated),'DAM + Capitação das competências mensais já geradas, para todos os irmãos ativos'],['Projeção GLMERGS anual',money(glmergsAnnualProjection),'Projeção: irmãos ativos × 12 × DAM/Capitação mensal'],['GLMERGS já repassado',money(glmergsPaid),'Saídas efetivamente registradas nas contas 2.16 e 2.17'],['GLMERGS ainda a repassar',money(glmergsPending),'Obrigação institucional ainda não liquidada'],['Resultado econômico ajustado',money(economicAdjusted),'Resultado de caixa menos obrigação GLMERGS ainda não paga'],['Outras receitas',money(rev),'Receitas extraordinárias'],['Despesas',money(exp),'Custos e pagamentos realizados'],['Contas a pagar em aberto',money(openPayables.reduce((s,c)=>s+Number(c.amount),0)),`${overduePayables.length} vencida(s)`],['Contas a receber em aberto',money(openReceivables.reduce((s,c)=>s+Number(c.amount),0)),`${overdueReceivables.length} vencida(s)`],['Resultado do exercício',money(dues+rev-exp),'Entradas menos despesas'],['Mensalidades em aberto',money(open),`${pendingMembers} irmão(s) com pendência`],['Saldo do sistema',money(systemBalance),'Saldo inicial + lançamentos'],['Saldo pelo extrato importado',money(bankBalance),'Movimentações bancárias não ignoradas'],['Diferença a conciliar',money(diff),'Extrato menos saldo do sistema']];$('#reportRows').innerHTML=rows.map(r=>`<tr><td>${r[0]}</td><td><strong>${r[1]}</strong></td><td>${r[2]}</td></tr>`).join('');$('#reportSummary').innerHTML=`<strong>Exercício ${year}</strong><span>${pendingMembers} irmão(s) com pendência · ${bankTransactions.filter(b=>yearOfDate(b.date)===year&&b.status==='pending').length} movimento(s) bancário(s) pendente(s)</span>`;const centerMap=new Map(costCenters.map(c=>[Number(c.id),{center:c,revenues:0,expenses:0}])),general=costCenters.find(c=>c.system)||costCenters.find(c=>c.code==='CC.99');if(general&&dues)centerMap.get(Number(general.id)).revenues+=dues;ledger.filter(e=>yearOfDate(e.date)===year).forEach(e=>{const c=costCenterForLedger(e)||general;if(!c)return;if(!centerMap.has(Number(c.id)))centerMap.set(Number(c.id),{center:c,revenues:0,expenses:0});const row=centerMap.get(Number(c.id));if(e.type==='receita')row.revenues+=Number(e.amount||0);else row.expenses+=Number(e.amount||0)});const centerRows=[...centerMap.values()].filter(r=>r.revenues||r.expenses).sort((a,b)=>a.center.code.localeCompare(b.center.code,undefined,{numeric:true}));$('#reportCostCenterRows').innerHTML=centerRows.map(r=>`<tr><td><strong>${escapeHtml(costCenterText(r.center))}</strong></td><td>${money(r.revenues)}</td><td>${money(r.expenses)}</td><td class="${r.revenues-r.expenses>=0?'money-positive':'money-negative'}">${money(r.revenues-r.expenses)}</td></tr>`).join('')||'<tr><td colspan="4">Sem movimentações classificadas no exercício.</td></tr>'}
function csvDownload(filename,head,rows){const esc=v=>`"${String(v??'').replaceAll('"','""')}"`,csv='\ufeff'+[head,...rows].map(r=>r.map(esc).join(';')).join('\n'),blob=new Blob([csv],{type:'text/csv;charset=utf-8'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=filename;a.click();URL.revokeObjectURL(url)}
function exportConsolidated(){const year=Number($('#reportYear').value),rows=[],duesAccount=chartOfAccounts.find(a=>a.code==='1.01'),general=costCenters.find(c=>c.system)||costCenters.find(c=>c.code==='CC.99');finance.filter(f=>f.status==='pago'&&yearOfDate(f.paidAt)===year).forEach(f=>rows.push([f.paidAt,'Mensalidade',duesAccount?.code||'1.01',duesAccount?.name||'Mensalidades ordinárias',general?.code||'CC.99',general?.name||'Geral / não alocado',memberName(f.memberId),f.paidValue??f.value,f.paymentMethod||'',f.receipt||'']));ledger.filter(e=>yearOfDate(e.date)===year).forEach(e=>{const a=accountForLedger(e),c=costCenterForLedger(e);rows.push([e.date,e.type==='receita'?'Receita':'Despesa',a?.code||e.accountCode||'',a?.name||e.category||'Não classificado',c?.code||e.costCenterCode||'CC.99',c?.name||e.costCenterName||'Geral / não alocado',e.description,e.type==='despesa'?-Number(e.amount):Number(e.amount),e.method||'',e.reference||''])});rows.sort((a,b)=>String(a[0]).localeCompare(String(b[0])));csvDownload(`portalMaconico-financeiro-${year}.csv`,['Data','Tipo','Código da conta','Conta','Código centro de custo','Centro de custo','Descrição','Valor','Forma','Referência'],rows)}
function exportPending(){const year=Number($('#reportYear').value),rows=finance.filter(f=>String(f.month).startsWith(`${year}-`)&&!['pago','isento'].includes(f.status)).map(f=>[memberName(f.memberId),f.month,dateBR(f.due),f.value,statusLabel(effectiveStatus(f))]);csvDownload(`portalMaconico-inadimplencia-${year}.csv`,['Irmão','Competência','Vencimento','Valor','Status'],rows)}
function exportBank(){const year=Number($('#reportYear').value),rows=bankTransactions.filter(b=>yearOfDate(b.date)===year).map(b=>[b.date,b.description,b.amount,b.status,b.matchedKind||'',b.matchedId||'',b.source||'']);csvDownload(`portalMaconico-conciliacao-${year}.csv`,['Data','Histórico','Valor','Status','Vínculo','ID','Origem'],rows)}
function renderFinanceSettingsForm(){if(!$('#financeSettingsForm'))return;const year=Number($('#financeSettingsYear').value)||new Date().getFullYear();$('#financeSettingsYear').value=year;$('#financeOpeningBalance').value=openingBalance(year);$('#financeAccountLabel').value=financeSettings.accountLabel||'';[...$('#financeSettingsForm').elements].forEach(el=>{if(el.id==='financeSettingsYear'){el.disabled=false}else el.disabled=!canManageTreasury()});$('#saveFinanceSettingsBtn').disabled=!canManageTreasury()}


$('#budgetForm')?.addEventListener('submit',e=>{e.preventDefault();if(!canManageTreasury())return;const id=Number($('#budgetEditId').value)||null,year=Number($('#budgetEntryYear').value),accountId=Number($('#budgetAccount').value),costCenterId=Number($('#budgetCostCenter').value),amount=Math.max(0,Number($('#budgetAmount').value)||0),description=$('#budgetDescription').value.trim();if(!year||!accountId||!costCenterId||amount<=0){toast('Informe ano, conta, centro de custo e valor orçado.');return}const autoConflict=automaticBudgetRows(year).some(r=>Number(r.accountId)===accountId&&Number(r.costCenterId)===costCenterId);if(autoConflict){toast('Esta combinação já possui orçamento automático. Ajuste os valores na Configuração anual.');return}const duplicate=annualBudget.some(b=>Number(b.year)===year&&Number(b.accountId)===accountId&&Number(b.costCenterId)===costCenterId&&Number(b.id)!==Number(id));if(duplicate){toast('Já existe orçamento para esta conta e centro de custo no ano selecionado.');return}const existing=id?annualBudget.find(b=>Number(b.id)===id):null,now=new Date().toISOString(),record={id:existing?.id||Date.now(),year,accountId,costCenterId,description,amount,createdAt:existing?.createdAt||now,createdBy:existing?.createdBy||session.name,updatedAt:now,updatedBy:session.name};if(existing)Object.assign(existing,record);else annualBudget.push(record);saveAnnualBudget();addAudit(existing?'Orçamento atualizado':'Orçamento cadastrado',`${year} · ${accountText(chartOfAccounts.find(a=>a.id===accountId))} · ${costCenterText(costCenters.find(c=>c.id===costCenterId))} · ${money(amount)}`);$('#budgetDialog').close();renderAnnualBudget();renderAudit();toast(existing?'Previsão atualizada.':'Previsão orçamentária cadastrada.')});
$('#chargeAdjustForm')?.addEventListener('submit',e=>{e.preventDefault();if(!canManageTreasury())return;const r=finance.find(x=>x.id===Number($('#chargeAdjustId').value));if(!r||r.status==='pago')return;const previous=`${money(r.value)} · ${statusLabel(effectiveStatus(r))}`;r.value=Math.max(0,Number($('#chargeAdjustValue').value)||0);r.status=$('#chargeAdjustStatus').value==='isento'?'isento':'aberto';r.adjustReason=$('#chargeAdjustReason').value.trim();r.adjustedAt=new Date().toISOString();r.adjustedBy=session.name;r.updatedAt=new Date().toISOString();saveFinance();addAudit('Mensalidade ajustada',`${memberName(r.memberId)} · ${monthLabel(r.month)} · ${previous} → ${money(r.value)} · ${statusLabel(effectiveStatus(r))} · ${r.adjustReason}`);$('#chargeAdjustDialog').close();renderFinance();renderDashboard();renderAudit();toast('Mensalidade ajustada.')});
$('#memberFinanceYear')?.addEventListener('change',renderMemberFinanceSheet);$('#toggleAnnualExemptionBtn')?.addEventListener('click',()=>{const memberId=Number($('#memberFinanceDialog')?.dataset.memberId),year=Number($('#memberFinanceYear')?.value);window.toggleAnnualDuesExemption(memberId,year)});
$('#eventBankForm')?.addEventListener('submit',e=>{e.preventDefault();if(!canManageTreasury())return;const b=bankTransactions.find(x=>Number(x.id)===Number($('#eventBankId').value)),eventId=Number($('#eventBankEvent').value),memberId=Number($('#eventBankMember').value);if(!b||b.status!=='pending')return toast('Movimentação bancária indisponível.');try{const p=createEventPayment(eventId,memberId,{date:b.date,amount:Math.abs(b.amount),method:'Extrato bancário',reference:b.fitid||'',notes:b.description,bankId:b.id});$('#eventBankDialog').close();renderBankTransactions();renderFinancialEvents();renderAudit();toast(`${p.tickets} ingresso(s) registrado(s) no evento.`)}catch(err){toast(err.message)}});
$('#newFinancialEventBtn')?.addEventListener('click',()=>openFinancialEventForm());$('#eventYearFilter')?.addEventListener('change',renderFinancialEvents);$('#eventSearch')?.addEventListener('input',renderFinancialEvents);
$('#financialEventForm')?.addEventListener('submit',e=>{e.preventDefault();if(!canManageTreasury())return;const id=Number($('#financialEventEditId').value)||null,existing=id?eventById(id):null,record={id:existing?.id||Date.now(),name:$('#financialEventName').value.trim(),date:$('#financialEventDate').value,year:yearOfDate($('#financialEventDate').value),ticketValue:Number($('#financialEventTicketValue').value),description:$('#financialEventDescription').value.trim(),status:$('#financialEventStatus').value==='encerrado'?'encerrado':'ativo',createdAt:existing?.createdAt||new Date().toISOString(),createdBy:existing?.createdBy||session.name,updatedAt:new Date().toISOString(),updatedBy:session.name};if(!record.name||!record.date||!(record.ticketValue>0)){toast('Informe nome, data e valor unitário do ingresso.');return}if(existing)Object.assign(existing,record);else financialEvents.push(record);saveFinancialEvents();addAudit(existing?'Evento financeiro atualizado':'Evento financeiro criado',`${record.name} · ingresso ${money(record.ticketValue)}`);$('#financialEventDialog').close();renderFinancialEvents();renderAudit();toast('Evento financeiro salvo.')});
$('#eventDetailPaymentBtn')?.addEventListener('click',()=>openEventPayment(Number($('#financialEventDetailDialog').dataset.eventId)));$('#eventDetailExpenseBtn')?.addEventListener('click',()=>openEventExpense(Number($('#financialEventDetailDialog').dataset.eventId)));$('#eventPaymentAmount')?.addEventListener('input',updateEventPaymentTicketPreview);
$('#eventPaymentForm')?.addEventListener('submit',e=>{e.preventDefault();if(!canManageTreasury())return;try{const p=createEventPayment(Number($('#eventPaymentEventId').value),Number($('#eventPaymentMember').value),{date:$('#eventPaymentDate').value,amount:Number($('#eventPaymentAmount').value),method:$('#eventPaymentMethod').value,reference:$('#eventPaymentReference').value.trim(),notes:$('#eventPaymentNotes').value.trim(),bankId:Number($('#eventPaymentBankId').value)||null});$('#eventPaymentDialog').close();renderFinancialEvents();renderFinancialEventDetail(p.eventId);renderFinanceAux();toast('Pagamento do evento registrado.')}catch(err){toast(err.message)}});
$('#eventExpenseForm')?.addEventListener('submit',e=>{e.preventDefault();if(!canManageTreasury())return;const eventId=Number($('#eventExpenseEventId').value),ev=eventById(eventId),acc=eventExpenseAccount(),cc=eventCostCenter(),entry={id:Date.now(),type:'despesa',date:$('#eventExpenseDate').value,accountId:acc?.id||2009,accountCode:acc?.code||'2.09',category:acc?.name||'Eventos e confraternizações',costCenterId:cc?.id||3004,costCenterCode:cc?.code||'CC.04',costCenterName:cc?.name||'Eventos e confraternizações',description:$('#eventExpenseDescription').value.trim(),counterparty:$('#eventExpenseCounterparty').value.trim(),amount:Number($('#eventExpenseAmount').value),method:$('#eventExpenseMethod').value,reference:$('#eventExpenseReference').value.trim(),notes:$('#eventExpenseNotes').value.trim(),eventId,origin:'event-expense',bankId:null,attachment:null,createdAt:new Date().toISOString(),createdBy:session.name,updatedAt:new Date().toISOString(),updatedBy:session.name};if(!ev||!entry.description||!(entry.amount>0)){toast('Informe descrição e valor da despesa.');return}ledger.push(entry);saveLedger();addAudit('Despesa de evento registrada',`${ev.name} · ${entry.description} · ${money(entry.amount)}`);$('#eventExpenseDialog').close();renderFinancialEvents();renderFinancialEventDetail(eventId);renderFinanceAux();toast('Despesa do evento registrada.')});
$('#newRevenueBtn')?.addEventListener('click',()=>openLedgerDialog('receita'));
$('#newChartAccountBtn')?.addEventListener('click',()=>openChartAccountDialog());$('#newCostCenterBtn')?.addEventListener('click',()=>openCostCenterDialog());
$('#chartAccountSearch')?.addEventListener('input',renderChartOfAccounts);$('#chartAccountTypeFilter')?.addEventListener('change',renderChartOfAccounts);$('#chartAccountStatusFilter')?.addEventListener('change',renderChartOfAccounts);$('#costCenterSearch')?.addEventListener('input',renderCostCenters);$('#costCenterStatusFilter')?.addEventListener('change',renderCostCenters);
$('#newExpenseBtn')?.addEventListener('click',()=>openLedgerDialog('despesa'));
$('#newPayableBtn')?.addEventListener('click',()=>openCommitmentDialog('pagar'));$('#newReceivableBtn')?.addEventListener('click',()=>openCommitmentDialog('receber'));
['payable','receivable'].forEach(prefix=>{$(`#${prefix}Search`)?.addEventListener('input',()=>renderCommitments(prefix==='payable'?'pagar':'receber'));$(`#${prefix}YearFilter`)?.addEventListener('change',()=>renderCommitments(prefix==='payable'?'pagar':'receber'));$(`#${prefix}StatusFilter`)?.addEventListener('change',()=>renderCommitments(prefix==='payable'?'pagar':'receber'))});
$('#revenueSearch')?.addEventListener('input',()=>renderLedger('receita'));$('#expenseSearch')?.addEventListener('input',()=>renderLedger('despesa'));$('#revenueYearFilter')?.addEventListener('change',()=>renderLedger('receita'));$('#expenseYearFilter')?.addEventListener('change',()=>renderLedger('despesa'));
$('#bankSearch')?.addEventListener('input',renderBankTransactions);$('#bankYearFilter')?.addEventListener('change',renderBankTransactions);$('#bankStatusFilter')?.addEventListener('change',renderBankTransactions);$('#cashflowYear')?.addEventListener('change',renderCashflow);$('#reportYear')?.addEventListener('change',renderReports);
$('#exportConsolidatedBtn')?.addEventListener('click',exportConsolidated);$('#exportPendingBtn')?.addEventListener('click',exportPending);$('#exportBankBtn')?.addEventListener('click',exportBank);
$('#autoReconcileBtn')?.addEventListener('click',analyzeBankAutomatically);
$('#aiReconcileBtn')?.addEventListener('click',analyzeBankWithAI);
$('#bankStatementFile')?.addEventListener('change',async e=>{if(!canManageTreasury())return;const file=e.target.files?.[0];if(!file)return;$('#bankImportInfo').textContent=`Importando ${file.name}...`;try{const r=await importBankStatement(file);if($('#bankYearFilter'))$('#bankYearFilter').value='todos';renderBankTransactions();renderCashflow();renderReports();renderAudit();$('#bankImportInfo').textContent=`${file.name}: ${r.added} nova(s) de ${r.total} lida(s) · ${r.months.length} mês(es) · ${r.range}${r.sources.length>1?' · '+r.sources.join(' | '):''}.`;toast('Extrato importado com sucesso.')}catch(err){$('#bankImportInfo').textContent=err.message||'Falha ao importar extrato.';toast(err.message||'Falha ao importar extrato.')}finally{e.target.value=''}});
$('#commitmentForm')?.addEventListener('submit',e=>{e.preventDefault();if(!canManageTreasury())return;const id=Number($('#commitmentEditId').value)||Date.now(),existing=commitments.find(x=>x.id===id),type=$('#commitmentType').value;if(['glmergs-annual','glmergs-monthly'].includes(existing?.origin)){existing.dueDate=$('#commitmentDueDate').value;existing.notes=$('#commitmentNotes').value.trim()||existing.notes;existing.updatedAt=new Date().toISOString();existing.updatedBy=session.name;saveCommitments();addAudit('Vencimento de repasse GLMERGS atualizado',`${existing.description} · ${existing.dueDate?dateBR(existing.dueDate):'a definir'} · ${money(existing.amount)}`);$('#commitmentDialog').close();renderCommitments('pagar');renderReports();renderAudit();toast('Vencimento do repasse atualizado.');return}const account=accountById($('#commitmentAccount').value),center=costCenterById($('#commitmentCostCenter').value);if(!account||account.type!==(type==='receber'?'receita':'despesa')){toast('Selecione uma conta contábil compatível.');return}if(!center){toast('Selecione um Centro de Custo.');return}const record={id,type,competence:$('#commitmentCompetence').value,dueDate:$('#commitmentDueDate').value,accountId:account.id,accountCode:account.code,costCenterId:center.id,costCenterCode:center.code,description:$('#commitmentDescription').value.trim(),counterparty:$('#commitmentCounterparty').value.trim(),amount:Number($('#commitmentAmount').value),reference:$('#commitmentReference').value.trim(),notes:$('#commitmentNotes').value.trim(),status:existing?.status||'aberto',settledDate:existing?.settledDate||null,settledAmount:existing?.settledAmount??null,method:existing?.method||null,ledgerId:existing?.ledgerId||null,bankId:existing?.bankId||null,createdAt:existing?.createdAt||new Date().toISOString(),createdBy:existing?.createdBy||session.name,updatedAt:new Date().toISOString(),updatedBy:session.name};if(existing)Object.assign(existing,record);else commitments.push(record);saveCommitments();addAudit(`${commitmentTypeLabel(type)} ${existing?'atualizada':'cadastrada'}`,`${record.description} · ${money(record.amount)} · vence ${dateBR(record.dueDate)}`);$('#commitmentDialog').close();renderCommitments(type);renderReports();toast('Previsão financeira salva.')});
$('#commitmentSettleForm')?.addEventListener('submit',e=>{e.preventDefault();if(!canManageTreasury())return;const c=commitments.find(x=>x.id===Number($('#commitmentSettleId').value));if(!c||c.status!=='aberto')return;const date=$('#commitmentSettleDate').value,amount=Number($('#commitmentSettleAmount').value),method=$('#commitmentSettleMethod').value,reference=$('#commitmentSettleReference').value.trim(),notes=$('#commitmentSettleNotes').value.trim();createLedgerForCommitment(c,{date,amount,method,reference,notes});saveCommitments();saveLedger();addAudit(`${c.type==='receber'?'Recebimento':'Pagamento'} registrado`,`${c.description} · ${money(amount)} · ${method}`);$('#commitmentSettleDialog').close();renderFinanceAux();renderAudit();toast(c.type==='receber'?'Recebimento registrado.':'Pagamento registrado.')});
$('#ledgerForm')?.addEventListener('submit',async e=>{e.preventDefault();if(!canManageTreasury())return;const id=Number($('#ledgerEditId').value)||Date.now(),existing=ledger.find(x=>x.id===id),type=$('#ledgerType').value,account=accountById($('#ledgerAccount').value),costCenter=costCenterById($('#ledgerCostCenter').value),file=$('#ledgerAttachment').files?.[0]||null;if(!account||account.type!==type){toast('Selecione uma conta válida do Plano de Contas.');return}if(!account.active&&Number(existing?.accountId)!==Number(account.id)){toast('Esta conta está inativa. Selecione uma conta ativa.');return}if(!costCenter){toast('Selecione um Centro de Custo.');return}if(!costCenter.active&&Number(existing?.costCenterId)!==Number(costCenter.id)){toast('Este Centro de Custo está inativo. Selecione um centro ativo.');return}if(file&&file.size>LEDGER_ATTACHMENT_MAX){toast('O comprovante deve ter no máximo 20 MB.');return}let attachment=existing?.attachment||null;const btn=$('#saveLedgerBtn'),prev=btn.textContent;if(file){btn.disabled=true;try{const key=`finance-${id}-${Date.now()}`;attachment=await uploadFinanceAttachment(file,key,p=>btn.textContent=`Enviando ${p}%`);if(existing?.attachment)try{await deleteFinanceAttachment(existing.attachment)}catch{}}catch(err){btn.disabled=false;btn.textContent=prev;toast(err.message||'Falha ao enviar comprovante.');return}}const record={id,type,date:$('#ledgerDate').value,accountId:account.id,accountCode:account.code,category:account.name,costCenterId:costCenter.id,costCenterCode:costCenter.code,costCenterName:costCenter.name,description:$('#ledgerDescription').value.trim(),counterparty:$('#ledgerCounterparty').value.trim(),amount:Number($('#ledgerAmount').value),method:$('#ledgerMethod').value,reference:$('#ledgerReference').value.trim(),notes:$('#ledgerNotes').value.trim(),attachment,bankId:existing?.bankId||null,createdAt:existing?.createdAt||new Date().toISOString(),createdBy:existing?.createdBy||session.name,updatedAt:new Date().toISOString(),updatedBy:session.name};if(existing)Object.assign(existing,record);else ledger.push(record);saveLedger();addAudit(`${ledgerLabel(type)} ${existing?'atualizada':'lançada'}`,`${accountText(account)} · ${costCenterText(costCenter)} · ${record.description} · ${money(record.amount)}`);$('#ledgerDialog').close();btn.disabled=false;btn.textContent=prev;renderFinanceAux();renderAudit();toast(`${ledgerLabel(type)} salva com sucesso.`)});
$('#costCenterForm')?.addEventListener('submit',e=>{e.preventDefault();if(!canManageTreasury())return;const editId=Number($('#costCenterEditId').value)||null,existing=editId?costCenterById(editId):null,code=$('#costCenterCode').value.trim().toUpperCase(),name=$('#costCenterName').value.trim(),description=$('#costCenterDescription').value.trim(),active=$('#costCenterActive').checked;if(!/^CC\.\d{2,3}(?:\.\d{2,3})*$/.test(code)){toast('Use um código como CC.01 ou CC.10.01.');return}if(costCenters.some(c=>c.code===code&&Number(c.id)!==Number(editId))){toast('Já existe um Centro de Custo com este código.');return}if(!name){toast('Informe o nome do Centro de Custo.');return}const record={id:existing?.id||Date.now(),code,name,description,active:existing?.system?true:active,system:existing?.system===true,createdAt:existing?.createdAt||new Date().toISOString(),updatedAt:new Date().toISOString(),updatedBy:session.name};if(existing)Object.assign(existing,record);else costCenters.push(record);saveCostCenters();addAudit(existing?'Centro de custo atualizado':'Centro de custo criado',costCenterText(record));$('#costCenterDialog').close();renderCostCenters();renderLedger('receita');renderLedger('despesa');renderReports();renderAudit();toast(existing?'Centro de custo atualizado.':'Centro de custo criado.');});
$('#chartAccountForm')?.addEventListener('submit',e=>{e.preventDefault();if(!canManageTreasury())return;const editId=Number($('#chartAccountEditId').value)||null,existing=editId?accountById(editId):null,code=$('#chartAccountCode').value.trim(),name=$('#chartAccountName').value.trim(),type=$('#chartAccountType').value,group=$('#chartAccountGroup').value.trim(),description=$('#chartAccountDescription').value.trim(),active=$('#chartAccountActive').checked;if(!/^\d+(?:\.\d+)*$/.test(code)){toast('Use um código numérico hierárquico, por exemplo 2.05.');return}if(chartOfAccounts.some(a=>a.code===code&&Number(a.id)!==Number(editId))){toast('Já existe uma conta com este código.');return}if(!name||!group){toast('Informe o nome e o grupo da conta.');return}if(existing&&ledger.some(x=>Number(x.accountId)===Number(existing.id))&&type!==existing.type){toast('Não é possível alterar a natureza de uma conta que já possui lançamentos.');return}const record={id:existing?.id||Date.now(),code,name,type,group,description,active:existing?.system?true:active,system:existing?.system===true,createdAt:existing?.createdAt||new Date().toISOString(),updatedAt:new Date().toISOString(),updatedBy:session.name};if(existing)Object.assign(existing,record);else chartOfAccounts.push(record);saveChartOfAccounts();addAudit(existing?'Conta contábil atualizada':'Conta contábil criada',`${record.code} · ${record.name} · ${record.type==='receita'?'Receita':'Despesa'}`);$('#chartAccountDialog').close();renderChartOfAccounts();renderLedger('receita');renderLedger('despesa');renderAudit();toast(existing?'Conta atualizada.':'Conta criada.');});
$('#reconcileForm')?.addEventListener('submit',e=>{e.preventDefault();if(!canManageTreasury())return;const b=bankTransactions.find(x=>x.id===Number($('#reconcileBankId').value)),target=$('#reconcileTarget').value;if(!b||!target){toast('Selecione uma correspondência.');return}try{applyBankMatch(b,target);$('#reconcileDialog').close();renderFinance();renderFinanceAux();renderAudit();toast('Movimentação conciliada.')}catch(err){toast(err.message||'Falha na conciliação.')}});
$('#financeSettingsYear')?.addEventListener('change',renderFinanceSettingsForm);
$('#financeSettingsForm')?.addEventListener('submit',e=>{e.preventDefault();if(!canManageTreasury()){toast('Somente Venerável Mestre, Tesoureiro e Administrador podem alterar estes parâmetros.');return}const year=Number($('#financeSettingsYear').value),bal=Number($('#financeOpeningBalance').value)||0;financeSettings.openingBalances=financeSettings.openingBalances||{};financeSettings.openingBalances[String(year)]=bal;financeSettings.accountLabel=$('#financeAccountLabel').value.trim()||'Conta bancária Loja Modelo';saveFinanceSettings();addAudit('Parâmetros bancários atualizados',`${year} · saldo inicial ${money(bal)} · ${financeSettings.accountLabel}`);renderCashflow();renderReports();renderAudit();toast('Parâmetros bancários salvos.')});

$('#chargeMember').addEventListener('change',()=>{const m=nextAvailableMonthForMember(+$('#chargeMember').value),cfg=configuredForYear(Number(m.slice(0,4)));$('#chargeMonth').value=m;$('#chargeDue').value=dueForMonth(m,cfg?.dueDay||10);$('#chargeValue').value=cfg?.baseValue||180;validateChargeDuplicate()});
$('#chargeMonth').addEventListener('change',()=>{if($('#chargeMonth').value){const m=$('#chargeMonth').value,cfg=configuredForYear(Number(m.slice(0,4)));$('#chargeDue').value=dueForMonth(m,cfg?.dueDay||10);$('#chargeValue').value=cfg?.baseValue||$('#chargeValue').value||180}validateChargeDuplicate()});
$('#installAppBtn')?.addEventListener('click',installPortalMaconicoApp);
$('#themeToggleBtn')?.addEventListener('click',togglePortalTheme);
$('#loginForm').addEventListener('submit',login);$('#logoutBtn').addEventListener('click',logout);$('#changePasswordBtn')?.addEventListener('click',()=>openPasswordChange(false));$('#cancelPasswordChangeBtn')?.addEventListener('click',()=>{if($('#passwordChangeDialog').dataset.required==='1')return;$('#passwordChangeDialog').close()});$('#passwordChangeForm')?.addEventListener('submit',async e=>{e.preventDefault();const p=$('#newPassword').value,c=$('#confirmNewPassword').value;if(p!==c){toast('As senhas não coincidem.');return}const btn=e.submitter||e.target.querySelector('button[type="submit"]');if(btn)btn.disabled=true;try{const response=await fetch('/api/auth-change-password',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({password:p}),cache:'no-store'});let data={};try{data=await response.json()}catch{}if(!response.ok)throw new Error(data.error||'Não foi possível alterar a senha.');session=data.user;const wasRequired=$('#passwordChangeDialog').dataset.required==='1';$('#passwordChangeDialog').close();toast('Senha atualizada com sucesso.');if(wasRequired)await completeAuthenticatedStart();else showApp()}catch(err){toast(err.message||'Falha ao alterar a senha.')}finally{if(btn)btn.disabled=false}});$('#passwordChangeDialog')?.addEventListener('cancel',e=>{if($('#passwordChangeDialog').dataset.required==='1')e.preventDefault()});$('#mobileMenuBtn')?.addEventListener('click',()=>setMobileNav(!$('#appView')?.classList.contains('mobile-nav-open')));$('#mobileNavBackdrop')?.addEventListener('click',()=>setMobileNav(false));window.addEventListener('resize',()=>{if(window.innerWidth>760)setMobileNav(false)});document.addEventListener('keydown',e=>{if(e.key==='Escape')setMobileNav(false)});$$('#navMenu button').forEach(b=>b.addEventListener('click',()=>go(b.dataset.view)));$$('[data-go]').forEach(b=>b.addEventListener('click',()=>go(b.dataset.go)));$$('[data-management-tab]').forEach(b=>b.addEventListener('click',()=>setManagementTab(b.dataset.managementTab)));$('#checklistSearch')?.addEventListener('input',renderChecklistRuns);$('#checklistStatusFilter')?.addEventListener('change',renderChecklistRuns);$('#supplierSearch')?.addEventListener('input',renderSuppliers);$('#supplierStatusFilter')?.addEventListener('change',renderSuppliers);$('#manageChecklistTemplatesBtn')?.addEventListener('click',openChecklistTemplates);$('#newChecklistTemplateBtn')?.addEventListener('click',newChecklistTemplate);$('#checklistTemplatePicker')?.addEventListener('change',e=>loadChecklistTemplateIntoForm(e.target.value));$('#newChecklistRunBtn')?.addEventListener('click',openNewChecklistRun);$('#checklistRunTemplate')?.addEventListener('change',updateChecklistRunTemplateHelp);$('#newSupplierBtn')?.addEventListener('click',()=>openSupplier());$('#financeSearch').addEventListener('input',renderFinance);$('#financeStatusFilter').addEventListener('change',renderFinance);$('#financeMonthFilter').addEventListener('change',renderFinance);$('#financeYearTabs').addEventListener('change',e=>{financeSelectedYear=Number(e.target.value)||new Date().getFullYear();renderFinanceMonthTabs();renderFinance()});$('#librarySearch').addEventListener('input',renderLibrary);$('#managementSearch')?.addEventListener('input',renderManagements);$('#libraryDegreeFilter').addEventListener('change',renderLibrary);$('#libraryThemeFilter').addEventListener('change',renderLibrary);$('#libraryTypeFilter').addEventListener('change',renderLibrary);$('#socialSearch')?.addEventListener('input',renderSocialArchive);$('#socialTypeFilter')?.addEventListener('change',renderSocialArchive);$('#socialType').addEventListener('change',updateSocialEventFields);$('#memberSearch').addEventListener('input',renderMembers);$('#memberDegreeFilter').addEventListener('change',renderMembers);$('#profileDegree')?.addEventListener('change',()=>{const isMaster=$('#profileDegree').value==='mestre';$('#profileInstalledMaster').disabled=!isMaster;if(!isMaster)$('#profileInstalledMaster').checked=false});$('#accessSearch').addEventListener('input',renderAccessManagement);$('#accessOfficeFilter').addEventListener('change',renderAccessManagement);
$$('[data-finance-tab]').forEach(b=>b.addEventListener('click',()=>setFinanceTab(b.dataset.financeTab)));$('#budgetYear')?.addEventListener('change',renderAnnualBudget);$('#newBudgetBtn')?.addEventListener('click',()=>window.openBudgetEntry());$('#duesConfigYear').addEventListener('change',()=>loadDuesConfigForm($('#duesConfigYear').value));['duesBaseValue','duesCapitationValue','duesDamValue'].forEach(id=>$('#'+id)?.addEventListener('input',()=>renderFinanceConfig()));
$('#newChargeBtn').addEventListener('click',()=>{prepareChargeForm();$('#chargeDialog').showModal();});$('#bulkChargeBtn').addEventListener('click',()=>{const m=$('#bulkMonth').value||`${new Date().getFullYear()}-${String(new Date().getMonth()+1).padStart(2,'0')}`,cfg=configuredForYear(Number(m.slice(0,4)));if(!cfg){toast('Configure primeiro os valores mensais deste exercício em Configurações.');setFinanceTab('config');loadDuesConfigForm(Number(m.slice(0,4)));return}$('#bulkValue').value=cfg.baseValue;$('#bulkDue').value=dueForMonth(m,cfg.dueDay||10);$('#bulkNotes').value=cfg.notes||'';$('#bulkChargeDialog').showModal();});$('#bulkMonth')?.addEventListener('change',()=>{const m=$('#bulkMonth').value;if(!m)return;const cfg=configuredForYear(Number(m.slice(0,4)));if(!cfg){toast('Este exercício ainda não possui configuração anual.');return}$('#bulkValue').value=cfg.baseValue;$('#bulkDue').value=dueForMonth(m,cfg.dueDay||10);$('#bulkNotes').value=cfg.notes||''});$('#exportFinanceBtn').addEventListener('click',exportCSV);$('#newDocumentBtn').addEventListener('click',()=>{if(!isAdmin())return;$('#documentForm').reset();$('#docEditId').value='';$('#documentDialogTitle').textContent='Adicionar ao acervo';$('#docYear').value=new Date().getFullYear();$('#docFileHelp').textContent='PDF, DOC/DOCX, TXT/RTF ou imagem. Limite de 50 MB por arquivo.';$('#documentDialog').showModal();});
$('#newPostBtn').addEventListener('click',()=>{if(!isAdmin())return;resetSocialForm();$('#socialDialog').showModal();});$('#newSessionBtn')?.addEventListener('click',()=>{if(!isAdmin())return;resetSessionForm();$('#socialDialog').showModal();});
$('#addRelativeBtn').addEventListener('click',()=>{if(!isAdmin())return;const list=$('#relativesList');list.querySelector('.relatives-empty')?.remove();list.insertAdjacentHTML('beforeend',relativeRowMarkup({},list.querySelectorAll('[data-relative-row]').length,true));const row=list.lastElementChild;row?.querySelector('[data-remove-relative]')?.addEventListener('click',()=>{row.remove();if(!list.querySelector('[data-relative-row]'))list.innerHTML='<div class="relatives-empty">Nenhum familiar ou parente cadastrado.</div>'})});

$('#memberProfileForm').addEventListener('submit',async e=>{
  e.preventDefault();if(!isAdmin())return;
  const isNew=$('#memberProfileMatricula').value==='__NEW__';
  const typedMatricula=($('#profileMatriculaDisplay').value||'').trim();
  const matricula=isNew?typedMatricula:$('#memberProfileMatricula').value;
  if(!/^\d+$/.test(matricula)){toast('Informe uma matrícula numérica válida.');return}
  if(isNew&&members.some(m=>m.matricula===matricula)){toast('Já existe um irmão cadastrado com esta matrícula.');return}
  let member=isNew?null:members.find(m=>m.matricula===matricula);if(!isNew&&!member)return;
  const name=$('#profileName').value.trim();if(!name){toast('Informe o nome do irmão.');return}
  const degree=$('#profileDegree').value;const installedMaster=degree==='mestre'&&$('#profileInstalledMaster').checked;
  const previousActive=member?.active;const active=$('#profileActive').value==='true';
  try{
    if(isNew)await createAuthUserServer({memberId:Number(matricula),matricula,name,phone:$('#profilePhone').value.trim(),active,degree,installedMaster,initials:initialsFromName(name),masonicOffice:'Sem cargo',portalAdmin:false});
    else await updateAuthUserServer(matricula,{name,phone:$('#profilePhone').value.trim(),active,degree,installedMaster});
  }catch(err){toast(err.message||'Não foi possível sincronizar o acesso deste irmão no servidor.');return}
  if(isNew){
    const seed={id:Number(matricula),matricula,name,lodge:+$('#profileLodge').value||70,phone:$('#profilePhone').value.trim(),active,degree,initials:initialsFromName(name),defaultOffice:'Irmão'};
    addedMembers.push(seed);saveAddedMembers();
    member={...seed,id:Number(seed.id),masonicOffice:'Sem cargo',portalAdmin:false,office:'Irmão'};members.push(member);
  }
  const record={
    ...(isNew?memberProfileDefaults(member):getMemberProfile(member)),
    name,preferredName:$('#profilePreferredName').value.trim(),birthDate:$('#profileBirthDate').value,
    phone:$('#profilePhone').value.trim(),altPhone:$('#profileAltPhone').value.trim(),email:$('#profileEmail').value.trim(),profession:$('#profileProfession').value.trim(),maritalStatus:$('#profileMaritalStatus').value,
    active,lodge:+$('#profileLodge').value||70,degree,installedMaster,
    address:{cep:$('#profileCep').value.trim(),street:$('#profileStreet').value.trim(),number:$('#profileNumber').value.trim(),complement:$('#profileComplement').value.trim(),neighborhood:$('#profileNeighborhood').value.trim(),city:$('#profileCity').value.trim(),state:$('#profileState').value.trim().toUpperCase()},
    emergency:{name:$('#profileEmergencyName').value.trim(),relation:$('#profileEmergencyRelation').value.trim(),phone:$('#profileEmergencyPhone').value.trim()},
    masonic:{initiationDate:$('#profileInitiationDate').value,passingDate:$('#profilePassingDate').value,raisingDate:$('#profileRaisingDate').value},
    relatives:collectRelatives(),notes:$('#profileNotes').value.trim(),updatedAt:new Date().toISOString(),updatedBy:session.name
  };
  memberProfiles[matricula]=record;saveMemberProfiles();
  member.name=record.name;member.phone=record.phone;member.active=record.active;member.lodge=record.lodge;member.degree=record.degree;member.installedMaster=Boolean(record.installedMaster);member.initials=initialsFromName(record.name);
  const added=addedMembers.find(m=>String(m.matricula)===matricula);if(added){Object.assign(added,{name:record.name,phone:record.phone,active:record.active,lodge:record.lodge,degree:record.degree,installedMaster:Boolean(record.installedMaster),initials:member.initials});saveAddedMembers()}
  if(session?.matricula===matricula){if(hostedPortal)await refreshServerSession();else{session.name=member.name;session.degree=member.degree;session.installedMaster=Boolean(member.installedMaster);session.masonicOffice=member.masonicOffice;session.initials=member.initials}$('#degreeBadge').textContent=session.degree==='mestre'&&session.installedMaster?'Mestre Instalado':degreeLabel[session.degree];$('#currentUserName').textContent=session.name;$('#currentUserMeta').textContent=currentUserMetaText();document.querySelector('.user-chip .avatar').textContent=session.initials}
  addAudit(isNew?'Irmão cadastrado':'Cadastro atualizado',`${member.name} · matrícula ${matricula} · ${memberDegreeLabel(member)}`);
  $('#memberProfileDialog').close();$('#profileMatriculaDisplay').required=false;fillMembers();renderMembers();renderAccessManagement();renderFinance();renderDashboard();renderAudit();toast(isNew?'Novo irmão cadastrado com sucesso.':'Ficha do irmão atualizada com sucesso.');
});


$('#duesConfigForm').addEventListener('submit',e=>{
  e.preventDefault();if(!canEditDuesConfig()){toast('Somente o Venerável Mestre, o Tesoureiro e o Administrador podem alterar esta configuração.');return}
  const year=Number($('#duesConfigYear').value),baseValue=Number($('#duesBaseValue').value),dueDay=Number($('#duesDueDay').value),capitationValue=Math.max(0,Number($('#duesCapitationValue').value)||0),damValue=Math.max(0,Number($('#duesDamValue').value)||0),notes=$('#duesConfigNotes').value.trim();
  if(!year||baseValue<=0||dueDay<1||dueDay>28){toast('Revise o ano, o valor-base e o dia de vencimento.');return}
  duesConfig[String(year)]={year,baseValue,dueDay,capitationValue,damValue,glmergsRateMode:'monthly',notes,updatedAt:new Date().toISOString(),updatedBy:session.name};saveDuesConfig();
  addAudit('Configuração anual de mensalidades',`${year} · mensalidade ${money(baseValue)}/mês · capitação ${money(capitationValue)}/mês · DAM ${money(damValue)}/mês · líquido mensal ${money(monthlyNetDuesPerMember(duesConfig[String(year)]))} · vencimento dia ${dueDay}`);
  fillMonthFilter();renderFinance();renderFinanceConfig();renderAnnualBudget();renderDashboard();renderAudit();toast(`Configuração de ${year} salva. As competências serão geradas mês a mês.`);
});

$('#chargeForm').addEventListener('submit' ,e=>{e.preventDefault();if(!canManageTreasury())return;const memberId=+$('#chargeMember').value,month=$('#chargeMonth').value;if(!validateChargeDuplicate()){toast('Esta competência já foi lançada para este irmão.');return}const r={id:Date.now(),memberId,month,value:+$('#chargeValue').value,due:$('#chargeDue').value,status:'aberto',paidAt:null,paidValue:null,paymentMethod:null,notes:$('#chargeNotes').value.trim(),createdAt:new Date().toISOString(),createdBy:session.name,updatedAt:new Date().toISOString(),receipt:null,source:'manual',configYear:null};finance.push(r);saveFinance();addAudit('Mensalidade lançada',`${memberName(memberId)} · ${monthLabel(month)} · ${money(r.value)}`);$('#chargeDialog').close();e.target.reset();$('#chargeValue').value='180';fillMonthFilter();prepareChargeForm();renderFinance();renderDashboard();renderAudit();toast('Mensalidade lançada com sucesso.')});

$('#bulkChargeForm').addEventListener('submit',e=>{e.preventDefault();if(!canManageTreasury())return;const month=$('#bulkMonth').value,year=Number(month.slice(0,4)),cfg=configuredForYear(year);if(!cfg){toast('Configure primeiro os valores mensais deste exercício.');return}const value=Number(cfg.baseValue),due=annualDueDate(year,Number(month.slice(5,7)),cfg?.dueDay||10),notes=$('#bulkNotes').value.trim()||cfg?.notes||'';let created=0,skipped=0,exempted=0;members.filter(m=>m.active).forEach(m=>{if(finance.some(f=>f.memberId===m.id&&f.month===month)){skipped++;return}const isExempt=isAnnualDuesExempt(m.id,year);finance.push({id:Date.now()+m.id,memberId:m.id,month,value,due,status:isExempt?'isento':'aberto',annualExemption:isExempt,adjustReason:isExempt?(annualExemptionRecord(m.id,year)?.reason||'Isenção anual'):'',paidAt:null,paidValue:null,paymentMethod:null,notes,createdAt:new Date().toISOString(),createdBy:session.name,updatedAt:new Date().toISOString(),receipt:null,source:'monthly-batch',configYear:year});created++;if(isExempt)exempted++});saveFinance();const glmergsChanged=syncGlmergsMonthlyProvisions(month,cfg);addAudit('Competência mensal gerada',`${monthLabel(month)} · ${created} criada(s) · ${exempted} isenta(s) · ${skipped} já existente(s) · DAM/Capitação GLMERGS ${glmergsChanged?'provisionados':'já provisionados'}`);$('#bulkChargeDialog').close();fillMonthFilter();renderFinance();renderFinanceConfig();renderAnnualBudget();renderDashboard();renderAudit();toast(`${created} mensalidade(s) gerada(s); ${exempted} isenta(s); DAM e Capitação do mês provisionados para todos os irmãos ativos.`)});

$('#paymentForm').addEventListener('submit',e=>{e.preventDefault();if(!canManageTreasury())return;const r=finance.find(x=>x.id===+$('#paymentChargeId').value);if(!r)return;r.status='pago';r.paidAt=$('#paymentDate').value;r.paidValue=+$('#paymentValue').value;r.paymentMethod=$('#paymentMethod').value;r.notes=[r.notes,$('#paymentNotes').value.trim()].filter(Boolean).join(' | ');r.receipt=nextReceipt(r);r.updatedAt=new Date().toISOString();saveFinance();addAudit('Pagamento registrado',`${memberName(r.memberId)} · ${monthLabel(r.month)} · ${money(r.paidValue)} · ${r.paymentMethod}`);$('#paymentDialog').close();e.target.reset();renderFinance();renderDashboard();renderAudit();toast(`Pagamento registrado. Recibo ${r.receipt}.`)});

$('#documentForm').addEventListener('submit',async e=>{
  e.preventDefault();if(!isAdmin())return;
  const editId=+$('#docEditId').value||null,existing=editId?docs.find(d=>d.id===editId):null,file=$('#docFile').files?.[0]||null;
  if(file&&file.size>LIBRARY_INPUT_MAX){toast('O arquivo deve ter no máximo 50 MB.');return}
  const id=existing?.id||Date.now();
  let storageKey=existing?.storageKey||null,storage=existing?.storage||null,chunkCount=existing?.chunkCount||0,fileName=existing?.fileName||null,fileType=existing?.fileType||null,fileSize=existing?.fileSize||0;
  const saveBtn=$('#saveDocumentBtn'),help=$('#docFileHelp'),previousText=saveBtn.textContent;
  if(file){
    const newKey=`doc-${id}-${Date.now()}`;saveBtn.disabled=true;saveBtn.textContent='Enviando 0%';
    try{
      const result=await uploadLibraryFile(file,newKey,p=>{saveBtn.textContent=`Enviando ${p}%`;help.textContent=`Enviando ${file.name}: ${p}% de ${formatBytes(file.size)}.`});
      if(storageKey)try{await deleteLibraryFile(existing)}catch{}
      storageKey=newKey;storage=result.storage;chunkCount=result.chunkCount;fileName=file.name;fileType=file.type||'application/octet-stream';fileSize=file.size;
    }catch(err){toast(err?.message||'Não foi possível enviar o arquivo ao acervo.');saveBtn.disabled=false;saveBtn.textContent=previousText;help.textContent='PDF, DOC/DOCX, TXT/RTF ou imagem. Limite de 50 MB por arquivo.';return}
  }
  const record={id,title:$('#docTitle').value.trim(),author:$('#docAuthor').value.trim(),degree:$('#docDegree').value,type:$('#docType').value,theme:$('#docTheme').value.trim(),year:+$('#docYear').value,keywords:$('#docKeywords').value.trim(),description:$('#docDescription').value.trim(),createdAt:existing?.createdAt||new Date().toISOString(),createdBy:existing?.createdBy||session.name,updatedAt:new Date().toISOString(),updatedBy:session.name,fileName,fileType,fileSize,storageKey,storage,chunkCount};
  if(existing){Object.assign(existing,record)}else{docs.push(record)}
  try{await saveDocs()}catch(err){toast(err?.message||'Arquivo enviado, mas a ficha do acervo não pôde ser sincronizada.');saveBtn.disabled=false;saveBtn.textContent=previousText;return}
  $('#documentDialog').close();e.target.reset();saveBtn.disabled=false;saveBtn.textContent=previousText;renderLibrary();renderDashboard();toast(existing?'Documento atualizado no acervo.':'Documento adicionado ao acervo.');
});


$('#socialForm').addEventListener('submit',async e=>{e.preventDefault();if(!isAdmin())return;const editId=+$('#socialEditId').value||null;const existing=editId?social.find(p=>p.id===editId):null;const proposedType=$('#socialType').value,proposedDegree=proposedType==='sessao'?$('#socialSessionDegree').value:null;if(existing?.type==='sessao'&&attendanceRecordFor(existing.id)?.finalized&&proposedDegree!==existing.sessionDegree){toast('Reabra a chamada de frequência antes de alterar o grau desta sessão.');return}const files=[...($('#socialPhotos').files||[])];if(files.length>12){toast('Selecione no máximo 12 fotos por publicação.');return}if(files.some(f=>f.size>SOCIAL_INPUT_MAX)){toast('Cada foto deve ter no máximo 10 MB.');return}if(files.some(f=>!['image/jpeg','image/png','image/webp'].includes(f.type))){toast('Use fotos JPG, PNG ou WEBP.');return}const id=existing?.id||Date.now();let images=existing?.images?[...existing.images]:[];if(files.length){let newImages=[];try{newImages=await uploadSocialImages(files);if(!newImages.length)throw new Error('Nenhuma imagem foi gravada.')}catch(err){if(err?.message==='SERVER_REQUIRED')toast('Para gravar as fotos em imagens-social, inicie o portal pelo arquivo iniciar-portal.bat.');else toast(err?.message||'Não foi possível gravar as fotos na pasta imagens-social.');return}for(const im of images){try{await deleteSocialImage(im)}catch{}}images=newImages}const type=$('#socialType').value,eventLike=['sessao','evento'].includes(type);const record={id,type,sessionDegree:type==='sessao'?$('#socialSessionDegree').value:null,title:$('#socialTitle').value.trim(),body:$('#socialBody').value.trim(),publishedAt:$('#socialPublishedAt').value,featured:$('#socialFeatured').checked,eventDate:eventLike?$('#socialEventDate').value:null,eventTime:eventLike?$('#socialEventTime').value:null,eventLocation:eventLike?$('#socialEventLocation').value.trim():'',eventAddress:eventLike?$('#socialEventAddress').value.trim():'',eventNotes:eventLike?$('#socialEventNotes').value.trim():'',images,createdAt:existing?.createdAt||new Date().toISOString(),createdBy:existing?.createdBy||session.name,updatedAt:new Date().toISOString(),updatedBy:session.name};if(existing){Object.assign(existing,record)}else{social.push(record)}try{await saveSocial()}catch(err){toast(err?.message||'Falha ao sincronizar a Área Social.');return}$('#socialDialog').close();e.target.reset();await renderSocial();await renderSocialArchive();renderDashboard();renderAttendance();toast(existing?'Publicação atualizada.':'Publicação adicionada à Área Social.')});

$('#checklistTemplateForm')?.addEventListener('submit',async e=>{e.preventDefault();if(!isAdmin())return;const id=$('#checklistTemplateId').value||`tpl-${Date.now()}`,existing=managementData.templates.find(t=>t.id===id),name=$('#checklistTemplateName').value.trim(),items=$('#checklistTemplateItems').value.split(/\r?\n/).map(x=>x.trim()).filter(Boolean).slice(0,100);if(!name){toast('Informe o nome do modelo.');return}const now=new Date().toISOString(),record={id,name,system:Boolean(existing?.system),items,createdAt:existing?.createdAt||now,createdBy:existing?.createdBy||session.name,updatedAt:now,updatedBy:session.name};if(existing)Object.assign(existing,record);else managementData.templates.push(record);try{await saveManagementData();fillChecklistTemplateDialog(id);renderManagement();toast('Modelo de checklist salvo.')}catch(err){toast(err.message)}});
$('#checklistRunForm')?.addEventListener('submit',async e=>{e.preventDefault();if(!isAdmin())return;const t=managementData.templates.find(x=>x.id===$('#checklistRunTemplate').value),m=members.find(x=>Number(x.id)===Number($('#checklistRunMember').value));if(!t||!m){toast('Selecione o modelo e o irmão.');return}const now=new Date().toISOString(),run={id:Date.now(),templateId:t.id,templateName:t.name,memberId:m.id,memberName:m.name,plannedDate:$('#checklistRunDate').value,responsible:$('#checklistRunResponsible').value.trim(),notes:$('#checklistRunNotes').value.trim(),items:t.items.map((text,idx)=>({id:`${Date.now()}-${idx}`,text,done:false,updatedAt:null,updatedBy:''})),createdAt:now,createdBy:session.name,updatedAt:now,updatedBy:session.name};managementData.runs.push(run);try{await saveManagementData();$('#checklistRunDialog').close();renderManagement();openChecklistRun(run.id);toast('Checklist criado.')}catch(err){managementData.runs=managementData.runs.filter(x=>x.id!==run.id);toast(err.message)}});
$('#checklistAddItemBtn')?.addEventListener('click',()=>{const r=managementData.runs.find(x=>Number(x.id)===Number(checklistDetailId)),text=$('#checklistNewItemText').value.trim();if(!r||!text)return;r.items.push({id:`item-${Date.now()}`,text:text.slice(0,240),done:false,updatedAt:null,updatedBy:''});$('#checklistNewItemText').value='';r.updatedAt=new Date().toISOString();r.updatedBy=session.name;renderChecklistDetailItems()});
$('#saveChecklistDetailBtn')?.addEventListener('click',async()=>{const r=managementData.runs.find(x=>Number(x.id)===Number(checklistDetailId));if(!r)return;r.notes=$('#checklistDetailNotes').value.trim();r.updatedAt=new Date().toISOString();r.updatedBy=session.name;try{await saveManagementData();renderManagement();openChecklistRun(r.id);toast('Checklist atualizado.')}catch(err){toast(err.message)}});
$('#deleteChecklistRunBtn')?.addEventListener('click',async()=>{const r=managementData.runs.find(x=>Number(x.id)===Number(checklistDetailId));if(!r||!confirm(`Excluir o checklist “${r.templateName}” de ${r.memberName}?`))return;managementData.runs=managementData.runs.filter(x=>Number(x.id)!==Number(r.id));try{await saveManagementData();$('#checklistDetailDialog').close();checklistDetailId=null;renderManagement();toast('Checklist excluído.')}catch(err){toast(err.message)}});
$('#supplierForm')?.addEventListener('submit',async e=>{e.preventDefault();if(!isAdmin())return;const id=Number($('#supplierEditId').value)||Date.now(),existing=managementData.suppliers.find(s=>Number(s.id)===id),legalName=$('#supplierLegalName').value.trim();if(!legalName){toast('Informe a razão social.');return}const now=new Date().toISOString(),record={id,legalName,tradeName:$('#supplierTradeName').value.trim(),contactPerson:$('#supplierContactPerson').value.trim(),phone:$('#supplierPhone').value.trim(),email:$('#supplierEmail').value.trim(),category:$('#supplierCategory').value.trim(),status:$('#supplierStatus').value==='inativo'?'inativo':'ativo',notes:$('#supplierNotes').value.trim(),createdAt:existing?.createdAt||now,createdBy:existing?.createdBy||session.name,updatedAt:now,updatedBy:session.name};if(existing)Object.assign(existing,record);else managementData.suppliers.push(record);try{await saveManagementData();$('#supplierDialog').close();renderSuppliers();toast('Fornecedor salvo.')}catch(err){toast(err.message)}});
$('#attendanceGoCall')?.addEventListener('click',()=>{setAttendanceManagerPage('call');renderAttendanceCall()});
$('#attendanceGoIndicators')?.addEventListener('click',()=>{setAttendanceManagerPage('indicators');renderAttendanceSummary()});
$('#attendanceYearFilter')?.addEventListener('change',()=>{if($('#attendanceSummaryYearFilter'))$('#attendanceSummaryYearFilter').value=$('#attendanceYearFilter').value;renderAttendanceSessionList();renderAttendanceSummary()});
$('#attendanceSummaryYearFilter')?.addEventListener('change',()=>{if($('#attendanceYearFilter'))$('#attendanceYearFilter').value=$('#attendanceSummaryYearFilter').value;renderAttendanceSummary()});
$('#attendanceSessionSearch')?.addEventListener('input',renderAttendanceSessionList);
$('#attendanceMemberSearch')?.addEventListener('input',()=>renderAttendanceMemberGrid());
$('#attendanceSummarySearch')?.addEventListener('input',renderAttendanceSummary);
$('#attendanceMarkAll')?.addEventListener('click',()=>{if(attendanceWorkingFinalized)return;const p=social.find(x=>Number(x.id)===Number(attendanceSelectedSessionId)&&x.type==='sessao');if(!p?.sessionDegree)return;attendanceWorkingPresent=new Set(attendanceEligibleMembersFor(p,attendanceRecordFor(p.id)).map(m=>String(m.matricula)));renderAttendanceCall()});
$('#attendanceClearAll')?.addEventListener('click',()=>{if(attendanceWorkingFinalized)return;attendanceWorkingPresent.clear();renderAttendanceCall()});
$('#attendanceSaveDraft')?.addEventListener('click',()=>persistAttendance(false));
$('#attendanceFinalize')?.addEventListener('click',async()=>{if(attendanceWorkingFinalized){if(!confirm('Reabrir esta chamada? A frequência deixará de ser computada até ser finalizada novamente.'))return;await persistAttendance(false)}else{const p=social.find(x=>Number(x.id)===Number(attendanceSelectedSessionId)&&x.type==='sessao'),eligible=attendanceEligibleMembersFor(p,attendanceRecordFor(p?.id));if(!p)return;if(!confirm(`Finalizar a frequência de “${p.title}”? Serão computadas ${attendanceWorkingPresent.size} presença(s) entre ${eligible.length} irmão(s) habilitados.`))return;await persistAttendance(true)}});

document.addEventListener('click',e=>{const b=e.target.closest('[data-action]');if(!b)return;const id=b.dataset.id,action=b.dataset.action;if(action==='open-checklist-run'){e.preventDefault();openChecklistRun(Number(id))}else if(action==='toggle-checklist-item'){e.preventDefault();window.toggleChecklistItem(id)}else if(action==='remove-checklist-item'){e.preventDefault();window.removeChecklistItem(id)}else if(action==='edit-supplier'){e.preventDefault();openSupplier(Number(id))}else if(action==='toggle-supplier'){e.preventDefault();toggleSupplier(Number(id))}});

initializeDefaultDues();loadDuesConfigForm(2026);setFinanceTab('charges');
async function bootstrapPortal(){
  clearSensitiveClientState();
  if(!hostedPortal){renderFinanceAux();return}
  try{
    const response=await fetch('/api/auth-session',{cache:'no-store'});if(!response.ok){renderFinanceAux();return}
    const data=await response.json();session=data.user||null;if(!session){renderFinanceAux();return}
    if(session.mustChangePassword){openPasswordChange(true);return}
    await completeAuthenticatedStart();
  }catch(err){console.warn('Falha ao restaurar sessão segura:',err);renderFinanceAux()}
}
bootstrapPortal();
