import { getStore } from '../storage.mjs';
import { requireAuth, authError, canAdmin } from './_shared/auth.mjs';

function safeFileName(value = '') {
  let decoded = String(value || '');
  try { decoded = decodeURIComponent(decoded); } catch {}
  const only = decoded.replace(/\\/g, '/').split('/').pop() || '';
  return only.replace(/[^A-Za-z0-9._-]+/g, '-').slice(0, 180);
}

export default async (req) => {
  const auth=await requireAuth(req,{requirePasswordChanged:true});if(!auth.ok)return authError(auth);
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    return new Response('Método não permitido', { status: 405, headers: { allow: 'GET, HEAD' } });
  }

  const url = new URL(req.url);
  const filename = safeFileName(url.searchParams.get('file') || '');
  if (!filename) return new Response('Arquivo inválido', { status: 400 });

  const store = getStore({ name: 'portal-maconico-social-images', consistency: 'strong' });
  const key = `imagens-social/${filename}`;

  const metadataEntry = await store.getMetadata(key, { consistency: 'strong' });
  if (!metadataEntry) return new Response('Imagem não encontrada', { status: 404, headers: { 'cache-control': 'no-store' } });

  const headers = new Headers({
    'content-type': metadataEntry.metadata?.contentType || 'application/octet-stream',
    'cache-control': 'private, no-store',
    'x-content-type-options': 'nosniff',
    'content-disposition': `inline; filename*=UTF-8''${encodeURIComponent(metadataEntry.metadata?.originalName || filename)}`,
  });
  if (metadataEntry.etag) headers.set('etag', metadataEntry.etag);
  if (metadataEntry.metadata?.size) headers.set('content-length', String(metadataEntry.metadata.size));

  if (req.method === 'HEAD') return new Response(null, { status: 200, headers });

  const data = await store.get(key, { type: 'arrayBuffer', consistency: 'strong' });
  if (!data) return new Response('Imagem não encontrada', { status: 404, headers: { 'cache-control': 'no-store' } });
  return new Response(data, { status: 200, headers });
};
