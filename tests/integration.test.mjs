import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdir,mkdtemp,readFile,rm } from 'node:fs/promises';
import { resolve,sep } from 'node:path';
import { once } from 'node:events';
const base=resolve('test-output');await mkdir(base,{recursive:true});
const data=await mkdtemp(resolve(base,'portal-maconico-'));
process.env.PORTAL_DATA=data;process.env.PORTAL_LOCAL='1';
const {getStore}=await import('../storage.mjs');
const {hashPassword}=await import('../functions/_shared/auth.mjs');
const {server}=await import('../server.mjs');
const creds=hashPassword('Test-only-password-2026');
await getStore('portal-maconico-auth').setJSON('auth/users.json',[{matricula:'10001',name:'Administrador de teste',memberId:10001,active:true,degree:'mestre',portalAdmin:true,masonicOffice:'Sem cargo',passwordHash:creds.hash,passwordSalt:creds.salt,mustChangePassword:false,sessionVersion:1}]);
server.listen(0,'127.0.0.1');await once(server,'listening');
const origin='http://127.0.0.1:'+server.address().port;
let cookie='';
async function request(path,method='GET',body,headers={}){const r=await fetch(origin+path,{method,headers:{Origin:origin,...(cookie?{Cookie:cookie}:{}),...(body!==undefined&&typeof body!=='string'&&!Buffer.isBuffer(body)?{'Content-Type':'application/json'}:{}),...headers},body:body===undefined?undefined:typeof body==='string'||Buffer.isBuffer(body)?body:JSON.stringify(body)});return r;}

test('Portal Maçônico: authentication, permissions, persistence and file flows',async t=>{
  try{
    await t.test('private endpoints reject anonymous requests and foreign origins',async()=>{
      for(const name of ['auth-session','auth-users','finance-data','finance-file','library-data','library-file','management-data','social-posts','social-image','social-images','attendance-data'])assert.equal((await request('/api/'+name)).status,401,name);
      assert.equal((await request('/api/auth-login','POST',{matricula:'10001',password:'x'},{Origin:'https://evil.test'})).status,403);
    });
    await t.test('admin login; secure session response and user listing',async()=>{
      const r=await request('/api/auth-login','POST',{matricula:'10001',password:'Test-only-password-2026'});assert.equal(r.status,200);cookie=r.headers.get('set-cookie').split(';')[0];assert.match(r.headers.get('set-cookie'),/HttpOnly/);assert.match(r.headers.get('set-cookie'),/SameSite=Strict/);
      assert.equal((await (await request('/api/auth-users')).json()).users.length,1);
    });
    await t.test('finance data survives writes and new store instances',async()=>{
      assert.equal((await request('/api/finance-data','PUT',{data:{finance:[{id:1,memberId:10001,value:123}],ledger:[],bankTransactions:[]}})).status,200);
      const r=await (await request('/api/finance-data')).json();assert.equal(r.data.finance[0].value,123);
      assert.equal((await getStore('portal-maconico-finance-data').get('finance/state.json',{type:'json'})).finance[0].value,123);
    });
    await t.test('social posts and images roundtrip',async()=>{
      assert.equal((await request('/api/social-posts','PUT',{posts:[{id:1,title:'Teste',type:'informacao'}]})).status,200);
      assert.equal((await (await request('/api/social-posts')).json()).posts[0].title,'Teste');
      const upload=await request('/api/social-images','POST',Buffer.from([137,80,78,71]),{'Content-Type':'image/png','x-file-name':'test.png'});assert.equal(upload.status,201);const image=(await upload.json()).files[0];const download=await request(image.url);assert.equal(download.status,200);assert.deepEqual(Buffer.from(await download.arrayBuffer()),Buffer.from([137,80,78,71]));
    });
    await t.test('library document + chunks roundtrip',async()=>{
      const body=Buffer.from('%PDF-test-only');
      const upload=await request('/api/library-file','POST',body,{'x-storage-key':'doc1','x-chunk-index':'0','x-chunk-count':'1','x-file-size':String(body.length),'x-file-name':'test.pdf','x-file-type':'application/pdf'});assert.equal(upload.status,201);
      assert.equal((await request('/api/library-data','PUT',{docs:[{id:1,title:'Documento',degree:'mestre',storageKey:'doc1',fileSize:body.length,chunkCount:1}]})).status,200);
      const download=await request('/api/library-file?key=doc1&chunk=0');assert.equal(download.status,200);assert.equal(await download.text(),'%PDF-test-only');
    });
    await t.test('finance receipt chunk roundtrip',async()=>{
      const body=Buffer.from('receipt-test');
      assert.equal((await request('/api/finance-file','POST',body,{'x-storage-key':'receipt','x-chunk-index':'0','x-chunk-count':'1','x-file-size':String(body.length),'x-file-name':'test.pdf','x-file-type':'application/pdf'})).status,201);
      assert.equal(await (await request('/api/finance-file?key=receipt&chunk=0')).text(),'receipt-test');
    });
    await t.test('management and attendance endpoints',async()=>{
      assert.equal((await request('/api/management-data','PUT',{data:{suppliers:[{id:1,legalName:'Fornecedor de teste'}]}})).status,200);
      assert.equal((await (await request('/api/management-data')).json()).data.suppliers.length,1);
      assert.equal((await request('/api/attendance-data')).status,200);
    });
    await t.test('new user has unique temporary password and mandatory change',async()=>{
      const r=await request('/api/auth-users','POST',{user:{matricula:'10002',name:'Usuário de teste',degree:'aprendiz'}});assert.equal(r.status,201);const user=await r.json();assert.ok(user.temporaryPassword.length>=20);
      assert.ok(!(await getStore('portal-maconico-auth').get('auth/users.json',{type:'json'}))[1].temporaryPassword);
      const adminCookie=cookie;
      const login=await request('/api/auth-login','POST',{matricula:'10002',password:user.temporaryPassword});assert.equal(login.status,200);cookie=login.headers.get('set-cookie').split(';')[0];
      assert.equal((await request('/api/finance-data')).status,428);
      const change=await request('/api/auth-change-password','POST',{password:'New-test-password-2026'});
      assert.equal(change.status,200,await change.clone().text());cookie=change.headers.get('set-cookie').split(';')[0];
      assert.equal((await request('/api/auth-users')).status,403);
      assert.equal((await request('/api/finance-data','PUT',{data:{}})).status,403);
      assert.equal((await request('/api/library-file?key=doc1&chunk=0')).status,403);
      cookie=adminCookie;
    });
    await t.test('AI disabled, no secret source or seed directory in public assets',async()=>{
      assert.equal((await request('/api/ai-reconcile','POST',{})).status,404);
      assert.equal((await request('/functions/_shared/auth.mjs')).status,404);
      const js=await (await request('/app.js')).text();assert.ok(js.includes('const baseMembers=[];'));assert.ok(!js.includes("fetch('/api/ai-reconcile'"));
      const html=await (await request('/')).text();assert.ok(!html.includes('id="aiReconcileBtn"'));
    });
    await t.test('storage keys cannot escape filesystem; object metadata preserved',async()=>{
      const store=getStore('test-store');await store.set('../../escape','safe',{metadata:{type:'test'}});assert.equal(await store.get('../../escape'),'safe');assert.equal((await store.getMetadata('../../escape')).metadata.type,'test');
      await store.delete('../../escape');assert.equal(await store.get('../../escape'),null);
    });
  }finally{
    server.closeAllConnections();await new Promise(r=>server.close(r));
    if(!resolve(data).startsWith(base+sep))throw Error('Unsafe test cleanup');await rm(data,{recursive:true,force:true});
  }
});
