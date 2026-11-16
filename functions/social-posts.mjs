import { getStore } from '../storage.mjs';
import { requireAuth, authError, canAdmin } from './_shared/auth.mjs';

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
  });
}

export default async (req) => {
  const auth=await requireAuth(req,{requirePasswordChanged:true});if(!auth.ok)return authError(auth);
  if(['POST','PUT','DELETE'].includes(req.method)&&!canAdmin(auth.user))return new Response(JSON.stringify({error:'Apenas a administração pode alterar a Área Social.'}),{status:403,headers:{'content-type':'application/json; charset=utf-8','cache-control':'no-store'}});
  const store = getStore({ name: 'portal-maconico-social-data', consistency: 'strong' });
  const key = 'social/posts.json';

  if (req.method === 'GET') {
    const posts = await store.get(key, { type: 'json', consistency: 'strong' });
    return json({ posts: Array.isArray(posts) ? posts : null });
  }

  if (req.method === 'PUT') {
    let payload;
    try { payload = await req.json(); } catch { return json({ error: 'JSON inválido.' }, 400); }
    if (!Array.isArray(payload?.posts)) return json({ error: 'Estrutura de publicações inválida.' }, 400);
    if (payload.posts.length > 500) return json({ error: 'Quantidade de publicações acima do limite do protótipo.' }, 413);
    await store.setJSON(key, payload.posts, {
      metadata: { updatedAt: new Date().toISOString(), count: payload.posts.length },
    });
    return json({ ok: true, count: payload.posts.length });
  }

  return json({ error: 'Método não permitido.' }, 405);
};
