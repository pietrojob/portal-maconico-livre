import { getStore } from '../storage.mjs';
import { requireAuth, authError, canAdmin } from './_shared/auth.mjs';

const MAX_BODY = 5 * 1024 * 1024;
const ALLOWED = new Map([
  ['image/jpeg', '.jpg'],
  ['image/png', '.png'],
  ['image/webp', '.webp'],
]);

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
  });
}

function safeStem(name = 'foto') {
  const base = name.replace(/\\/g, '/').split('/').pop() || 'foto';
  const stem = base.replace(/\.[^.]+$/, '').normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  return stem.replace(/[^A-Za-z0-9_-]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60) || 'foto';
}

function safeFileName(value = '') {
  let decoded = String(value || '');
  try { decoded = decodeURIComponent(decoded); } catch {}
  const only = decoded.replace(/\\/g, '/').split('/').pop() || '';
  return only.replace(/[^A-Za-z0-9._-]+/g, '-').slice(0, 180);
}

export default async (req) => {
  const auth=await requireAuth(req,{requirePasswordChanged:true});if(!auth.ok)return authError(auth);
  if(['POST','PUT','DELETE'].includes(req.method)&&!canAdmin(auth.user))return new Response(JSON.stringify({error:'Apenas a administração pode alterar a Área Social.'}),{status:403,headers:{'content-type':'application/json; charset=utf-8','cache-control':'no-store'}});
  const store = getStore({ name: 'portal-maconico-social-images', consistency: 'strong' });
  const url = new URL(req.url);

  if (req.method === 'POST') {
    const type = (req.headers.get('content-type') || '').split(';')[0].trim().toLowerCase();
    if (!ALLOWED.has(type)) return json({ error: 'Formato não permitido. Use JPG, PNG ou WEBP.' }, 400);

    const originalName = safeFileName(req.headers.get('x-file-name')) || `foto${ALLOWED.get(type)}`;
    const arrayBuffer = await req.arrayBuffer();
    const size = arrayBuffer.byteLength;
    if (!size) return json({ error: 'Imagem vazia.' }, 400);
    if (size > MAX_BODY) return json({ error: 'A imagem otimizada excedeu o limite de envio do Netlify.' }, 413);

    const ext = ALLOWED.get(type);
    const basename = `${Date.now()}-${crypto.randomUUID().slice(0, 8)}-${safeStem(originalName)}${ext}`;
    const key = `imagens-social/${basename}`;

    await store.set(key, arrayBuffer, {
      metadata: {
        contentType: type,
        originalName,
        size,
        originalSize: Number(req.headers.get('x-original-size') || 0),
        uploadedAt: new Date().toISOString(),
      },
    });

    return json({
      files: [{
        name: originalName,
        fileName: basename,
        path: `/imagens-social/${basename}`,
        url: `/api/social-image?file=${encodeURIComponent(basename)}`,
        size,
        type,
        storage: 'netlify-blobs',
      }],
    }, 201);
  }

  if (req.method === 'DELETE') {
    const requested = safeFileName(url.searchParams.get('file') || '');
    if (!requested) return json({ error: 'Nome de arquivo inválido.' }, 400);
    await store.delete(`imagens-social/${requested}`);
    return json({ ok: true });
  }

  return json({ error: 'Método não permitido.' }, 405);
};
