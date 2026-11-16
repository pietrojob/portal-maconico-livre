import { getStore } from '../storage.mjs';
import { requireAuth, authError, canAdmin, canAccessDegree } from './_shared/auth.mjs';

const MAX_FILE_SIZE = 50 * 1024 * 1024;
const MAX_CHUNK_SIZE = 4.5 * 1024 * 1024;
const MAX_CHUNKS = 16;

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
  });
}

function safeKey(value = '') {
  return String(value).replace(/[^A-Za-z0-9._-]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 180);
}

function safeFileName(value = '') {
  let decoded = value;
  try { decoded = decodeURIComponent(value || ''); } catch {}
  const only = decoded.replace(/\\/g, '/').split('/').pop() || 'arquivo';
  return only.replace(/[\u0000-\u001f\u007f]/g, '').slice(0, 220) || 'arquivo';
}

function partKey(key, index) {
  return `acervo/${key}/part-${String(index).padStart(3, '0')}`;
}

export default async (req) => {
  const auth=await requireAuth(req,{requirePasswordChanged:true});if(!auth.ok)return authError(auth);
  if(['POST','DELETE'].includes(req.method)&&!canAdmin(auth.user))return json({error:'Apenas a administração pode alterar arquivos do acervo.'},403);
  const store = getStore({ name: 'portal-maconico-library-files', consistency: 'strong' });
  const url = new URL(req.url);

  if (req.method === 'POST') {
    const key = safeKey(req.headers.get('x-storage-key') || '');
    const index = Number(req.headers.get('x-chunk-index'));
    const count = Number(req.headers.get('x-chunk-count'));
    const totalSize = Number(req.headers.get('x-file-size'));
    const fileName = safeFileName(req.headers.get('x-file-name') || 'arquivo');
    const fileType = (req.headers.get('x-file-type') || 'application/octet-stream').slice(0, 120);

    if (!key) return json({ error: 'Chave de armazenamento inválida.' }, 400);
    if (!Number.isInteger(index) || !Number.isInteger(count) || index < 0 || count < 1 || index >= count || count > MAX_CHUNKS) {
      return json({ error: 'Informações de fragmentação inválidas.' }, 400);
    }
    if (!Number.isFinite(totalSize) || totalSize < 1 || totalSize > MAX_FILE_SIZE) {
      return json({ error: 'O arquivo deve ter no máximo 50 MB.' }, 413);
    }

    const blob = await req.blob();
    if (!blob.size) return json({ error: 'Parte do arquivo vazia.' }, 400);
    if (blob.size > MAX_CHUNK_SIZE) return json({ error: 'Parte do arquivo acima do limite permitido.' }, 413);

    await store.set(partKey(key, index), blob, {
      metadata: { index, count, totalSize, fileName, fileType, uploadedAt: new Date().toISOString() },
    });

    if (index === count - 1) {
      await store.setJSON(`acervo/${key}/manifest.json`, {
        key, fileName, fileType, totalSize, chunkCount: count, uploadedAt: new Date().toISOString(),
      });
    }

    return json({ ok: true, index, count }, 201);
  }

  if (req.method === 'GET' || req.method === 'HEAD') {
    const key = safeKey(url.searchParams.get('key') || '');
    const docStore=getStore({name:'portal-maconico-library-data',consistency:'strong'});
    const docs=await docStore.get('library/documents.json',{type:'json',consistency:'strong'});
    const doc=Array.isArray(docs)?docs.find(d=>safeKey(d.storageKey||'')===key):null;
    if(!doc)return new Response('Documento não encontrado',{status:404});
    if(!canAdmin(auth.user)&&!canAccessDegree(auth.user,doc.degree))return new Response('Acesso não autorizado',{status:403});
    const index = Number(url.searchParams.get('chunk'));
    if (!key || !Number.isInteger(index) || index < 0 || index >= MAX_CHUNKS) {
      return new Response('Parâmetros inválidos', { status: 400 });
    }
    const entry = await store.getWithMetadata(partKey(key, index), { type: 'blob' });
    if (!entry?.data) return new Response('Parte não encontrada', { status: 404 });
    const headers = new Headers({
      'content-type': 'application/octet-stream',
      'cache-control': 'private, no-store',
      'x-content-type-options': 'nosniff',
      'content-disposition': 'inline',
    });
    if (entry.etag) headers.set('etag', entry.etag);
    return new Response(req.method === 'HEAD' ? null : entry.data, { status: 200, headers });
  }

  if (req.method === 'DELETE') {
    const key = safeKey(url.searchParams.get('key') || '');
    if (!key) return json({ error: 'Chave inválida.' }, 400);
    const manifest = await store.get(`acervo/${key}/manifest.json`, { type: 'json', consistency: 'strong' });
    const count = Math.min(Number(manifest?.chunkCount) || MAX_CHUNKS, MAX_CHUNKS);
    await Promise.all(Array.from({ length: count }, (_, i) => store.delete(partKey(key, i))));
    await store.delete(`acervo/${key}/manifest.json`);
    return json({ ok: true });
  }

  return json({ error: 'Método não permitido.' }, 405);
};
