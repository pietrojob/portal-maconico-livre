// Implements only the Blob operations used by Portal Maçônico. No external services or credentials.
import { mkdir,readFile,open,rename,unlink,statfs } from 'node:fs/promises';
import { resolve,join } from 'node:path';
import { createHash,randomUUID } from 'node:crypto';
const root=resolve(process.env.PORTAL_DATA||'data');
const hash=x=>createHash('sha256').update(x).digest('hex');
export function getStore(options){
  const name=typeof options==='string'?options:options.name;
  if(!/^[a-z0-9-]{1,80}$/.test(name))throw Error('Invalid store');
  const dir=join(root,name);
  const path=key=>{if(typeof key!=='string'||key.length>500)throw Error('Invalid key');return join(dir,hash(key)+'.json');};
  async function entry(key){try{return JSON.parse(await readFile(path(key),'utf8'));}catch(e){if(e.code==='ENOENT')return null;throw e;}}
  function decode(e,type){if(!e)return null;const bytes=Buffer.from(e.data,'base64');switch(type||'text'){case 'text':return bytes.toString('utf8');case 'json':return JSON.parse(bytes.toString('utf8'));case 'blob':return new Blob([bytes],{type:e.metadata?.contentType||'application/octet-stream'});case 'arrayBuffer':return Uint8Array.from(bytes).buffer;default:throw Error('Unsupported storage type');}}
  async function set(key,value,options={}){
    await mkdir(dir,{recursive:true,mode:0o700});
    const data=value instanceof Blob?Buffer.from(await value.arrayBuffer()):typeof value==='string'?Buffer.from(value):Buffer.from(value);
    if(data.length>8*1024*1024)throw Error('Object exceeds local storage limit');
    const space=await statfs(dir);if(Number(space.bavail)*Number(space.bsize)<data.length*2+100*1024*1024)throw Error('Insufficient storage');
    const record={key,data:data.toString('base64'),metadata:options.metadata||{},etag:hash(data)};
    const temporary=join(dir,'.write-'+randomUUID());const handle=await open(temporary,'wx',0o600);
    try{await handle.writeFile(JSON.stringify(record));await handle.sync();}finally{await handle.close();}
    try{await rename(temporary,path(key));}finally{await unlink(temporary).catch(e=>{if(e.code!=='ENOENT')throw e;});}
  }
  return {get:async(key,options={})=>decode(await entry(key),options.type),set,
    setJSON:(key,value,options)=>set(key,JSON.stringify(value),options),
    getWithMetadata:async(key,options={})=>{const e=await entry(key);return e?{data:decode(e,options.type),metadata:e.metadata,etag:e.etag}:null;},
    getMetadata:async key=>{const e=await entry(key);return e?{metadata:e.metadata,etag:e.etag}:null;},
    delete:async key=>{try{await unlink(path(key));}catch(e){if(e.code!=='ENOENT')throw e;}}
  };
}
