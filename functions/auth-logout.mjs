import { clearSessionCookie } from './_shared/auth.mjs';
export default async(req)=>new Response(JSON.stringify({ok:true}),{status:200,headers:{'content-type':'application/json; charset=utf-8','cache-control':'no-store','set-cookie':clearSessionCookie(req)}});
