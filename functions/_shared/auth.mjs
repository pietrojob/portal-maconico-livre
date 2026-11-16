import { getStore } from '../../storage.mjs';
import { createHmac, randomBytes, pbkdf2Sync, timingSafeEqual } from 'node:crypto';
import { initialUsers } from './auth-seed.mjs';

const AUTH_STORE = 'portal-maconico-auth';
const USERS_KEY = 'auth/users.json';
const SECRET_KEY = 'auth/session-secret.txt';
const COOKIE_NAME = process.env.PORTAL_LOCAL === '1' ? 'portal_maconico_local' : '__Host-portal_maconico';
const SESSION_SECONDS = 12 * 60 * 60;
const PBKDF2_ITERATIONS = 210000;
const KEY_LENGTH = 32;
const DEGREE_RANK = { aprendiz: 1, companheiro: 2, mestre: 3 };
const FULL_ACCESS = new Set(['Venerável Mestre', 'Secretário', 'Administrador do portal']);
const FINANCE_VIEW = new Set(['Tesoureiro', 'Venerável Mestre', 'Secretário', 'Administrador do portal']);
const FINANCE_MANAGE = new Set(['Tesoureiro', 'Venerável Mestre', 'Administrador do portal']);
const ATTENDANCE_MANAGE = new Set(['Chanceler', 'Secretário', 'Venerável Mestre']);
const PRIVILEGED_MASONIC = new Set(['Venerável Mestre', 'Secretário', 'Tesoureiro']);

function store() { return getStore({ name: AUTH_STORE, consistency: 'strong' }); }
function b64url(input) { return Buffer.from(input).toString('base64url'); }
function fromB64url(input) { return Buffer.from(input, 'base64url').toString('utf8'); }
function safeText(v, max = 240) { return String(v ?? '').trim().slice(0, max); }
function normalizeUser(u) {
  const matricula = safeText(u.matricula, 30);
  const masonicOffice = safeText(u.masonicOffice || 'Sem cargo', 100) || 'Sem cargo';
  const portalAdmin = Boolean(u.portalAdmin);
  return {
    memberId: Number(u.memberId || matricula) || 0,
    matricula,
    name: safeText(u.name, 180),
    phone: safeText(u.phone, 80),
    active: u.active !== false,
    degree: DEGREE_RANK[u.degree] ? u.degree : 'aprendiz',
    initials: safeText(u.initials, 10),
    masonicOffice,
    portalAdmin,
    installedMaster: Boolean(u.installedMaster) && (DEGREE_RANK[u.degree] ? u.degree : 'aprendiz') === 'mestre',
    passwordHash: u.passwordHash || null,
    passwordSalt: u.passwordSalt || null,
    mustChangePassword: u.mustChangePassword !== false,
    sessionVersion: Number(u.sessionVersion) || 1,
    createdAt: u.createdAt || new Date().toISOString(),
    updatedAt: u.updatedAt || new Date().toISOString(),
  };
}
function computeRole(user) {
  if (user.portalAdmin) return 'Administrador do portal';
  if (PRIVILEGED_MASONIC.has(user.masonicOffice)) return user.masonicOffice;
  return 'Irmão';
}
export function publicUser(user) {
  const u = normalizeUser(user);
  return {
    memberId: u.memberId,
    matricula: u.matricula,
    name: u.name,
    degree: u.degree,
    initials: u.initials,
    masonicOffice: u.masonicOffice,
    installedMaster: Boolean(u.installedMaster),
    role: computeRole(u),
    mustChangePassword: Boolean(u.mustChangePassword),
  };
}
export function canAdmin(user) { return FULL_ACCESS.has(computeRole(user)); }
export function canViewFinance(user) { return FINANCE_VIEW.has(computeRole(user)); }
export function canManageFinance(user) { return FINANCE_MANAGE.has(computeRole(user)); }
export function canManageAttendance(user) { const u=normalizeUser(user); return Boolean(u.portalAdmin || ATTENDANCE_MANAGE.has(u.masonicOffice)); }
export function canAccessDegree(user, degree) { return (DEGREE_RANK[user.degree] || 0) >= (DEGREE_RANK[degree] || 999); }

export async function getUsers() {
  const s = store();
  let users = await s.get(USERS_KEY, { type: 'json', consistency: 'strong' });
  if (!Array.isArray(users) || !users.length) {
    const now = new Date().toISOString();
    users = initialUsers.map(u => normalizeUser({ ...u, sessionVersion: 1, createdAt: now, updatedAt: now }));
    await s.setJSON(USERS_KEY, users, { metadata: { updatedAt: now, count: users.length } });
  }
  return users.map(normalizeUser);
}
export async function saveUsers(users) {
  const normalized = users.map(normalizeUser);
  const now = new Date().toISOString();
  await store().setJSON(USERS_KEY, normalized, { metadata: { updatedAt: now, count: normalized.length } });
  return normalized;
}
export async function getUser(matricula) {
  const users = await getUsers();
  return users.find(u => u.matricula === String(matricula)) || null;
}

async function getSecret() {
  const s = store();
  let secret = await s.get(SECRET_KEY, { type: 'text', consistency: 'strong' });
  if (!secret || secret.length < 40) {
    secret = randomBytes(48).toString('base64url');
    await s.set(SECRET_KEY, secret, { metadata: { createdAt: new Date().toISOString() } });
  }
  return secret;
}
function parseCookies(req) {
  const header = req.headers.get('cookie') || '';
  const out = {};
  for (const part of header.split(';')) {
    const i = part.indexOf('='); if (i < 0) continue;
    out[part.slice(0, i).trim()] = decodeURIComponent(part.slice(i + 1).trim());
  }
  return out;
}
async function signPayload(payload) {
  const secret = await getSecret();
  const body = b64url(JSON.stringify(payload));
  const sig = createHmac('sha256', secret).update(body).digest('base64url');
  return `${body}.${sig}`;
}
async function verifyToken(token) {
  if (!token || !token.includes('.')) return null;
  const [body, sig] = token.split('.', 2);
  const secret = await getSecret();
  const expected = createHmac('sha256', secret).update(body).digest('base64url');
  const a = Buffer.from(sig || ''), b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try {
    const payload = JSON.parse(fromB64url(body));
    if (!payload?.matricula || !payload?.exp || Date.now() >= Number(payload.exp)) return null;
    return payload;
  } catch { return null; }
}
export async function issueSession(user, req) {
  const u = normalizeUser(user);
  const payload = { matricula: u.matricula, v: u.sessionVersion, exp: Date.now() + SESSION_SECONDS * 1000 };
  const token = await signPayload(payload);
  const secure = new URL(req.url).protocol === 'https:';
  return `${COOKIE_NAME}=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${SESSION_SECONDS}${secure ? '; Secure' : ''}`;
}
export function clearSessionCookie(req) {
  const secure = new URL(req.url).protocol === 'https:';
  return `${COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0${secure ? '; Secure' : ''}`;
}
export async function requireAuth(req, opts = {}) {
  const token = parseCookies(req)[COOKIE_NAME];
  const payload = await verifyToken(token);
  if (!payload) return { ok: false, status: 401, error: 'Sessão inválida ou expirada.' };
  const user = await getUser(payload.matricula);
  if (!user || !user.active || Number(user.sessionVersion) !== Number(payload.v)) return { ok: false, status: 401, error: 'Acesso revogado ou sessão expirada.' };
  if (opts.requirePasswordChanged && user.mustChangePassword) return { ok: false, status: 428, error: 'Troca de senha obrigatória.', code: 'PASSWORD_CHANGE_REQUIRED', user };
  if (opts.admin && !canAdmin(user)) return { ok: false, status: 403, error: 'Acesso administrativo necessário.', user };
  if (opts.financeView && !canViewFinance(user)) return { ok: false, status: 403, error: 'Acesso financeiro não autorizado.', user };
  if (opts.financeManage && !canManageFinance(user)) return { ok: false, status: 403, error: 'Permissão de gestão financeira necessária.', user };
  if (opts.attendanceManage && !canManageAttendance(user)) return { ok: false, status: 403, error: 'Permissão de gestão de frequência necessária.', user };
  return { ok: true, user };
}
export function authError(auth) {
  return new Response(JSON.stringify({ error: auth.error, code: auth.code || 'AUTH_ERROR' }), {
    status: auth.status || 401,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
  });
}

export function hashPassword(password, salt = randomBytes(16).toString('base64url')) {
  const hash = pbkdf2Sync(String(password), salt, PBKDF2_ITERATIONS, KEY_LENGTH, 'sha256').toString('base64url');
  return { salt, hash };
}
export function verifyPassword(password, user) {
  if (!user.passwordHash || !user.passwordSalt) return false;
  const { hash } = hashPassword(password, user.passwordSalt);
  const a = Buffer.from(hash), b = Buffer.from(user.passwordHash);
  return a.length === b.length && timingSafeEqual(a, b);
}
export function validateNewPassword(password) {
  const p = String(password || '');
  if (p.length < 12 || p.length > 200) return 'Use de 12 a 200 caracteres para a nova senha.';
  if (!/[A-Za-zÀ-ÿ]/.test(p) || !/\d/.test(p)) return 'Use pelo menos uma letra e um número.';
  if (p.toLowerCase() === 'admin') return 'Escolha uma senha diferente da senha de demonstração.';
  return null;
}
export async function updateUser(matricula, patch, actor = '') {
  const users = await getUsers();
  const idx = users.findIndex(u => u.matricula === String(matricula));
  if (idx < 0) return null;
  const current = users[idx];
  const next = normalizeUser({
    ...current,
    ...(patch.name !== undefined ? { name: safeText(patch.name, 180) } : {}),
    ...(patch.phone !== undefined ? { phone: safeText(patch.phone, 80) } : {}),
    ...(patch.active !== undefined ? { active: Boolean(patch.active) } : {}),
    ...(patch.degree !== undefined && DEGREE_RANK[patch.degree] ? { degree: patch.degree } : {}),
    ...(patch.installedMaster !== undefined ? { installedMaster: Boolean(patch.installedMaster) } : {}),
    ...(patch.masonicOffice !== undefined ? { masonicOffice: safeText(patch.masonicOffice, 100) || 'Sem cargo' } : {}),
    ...(patch.portalAdmin !== undefined ? { portalAdmin: Boolean(patch.portalAdmin) } : {}),
    updatedAt: new Date().toISOString(),
  });
  users[idx] = next;
  await saveUsers(users);
  return next;
}
export async function createUser(input) {
  const users = await getUsers();
  const matricula = safeText(input.matricula, 30);
  if (!/^\d{2,12}$/.test(matricula)) throw new Error('Matrícula inválida.');
  if (users.some(u => u.matricula === matricula)) throw new Error('Já existe usuário com esta matrícula.');
  const now = new Date().toISOString();
  const user = normalizeUser({
    memberId: Number(input.memberId || matricula), matricula, name: input.name, phone: input.phone || '', active: input.active !== false,
    degree: input.degree || 'aprendiz', installedMaster: Boolean(input.installedMaster), initials: input.initials || '', masonicOffice: input.masonicOffice || 'Sem cargo', portalAdmin: Boolean(input.portalAdmin),
    passwordHash: null, passwordSalt: null, mustChangePassword: true, sessionVersion: 1, createdAt: now, updatedAt: now,
  });
  const temporaryPassword=randomBytes(18).toString('base64url');
  const credentials=hashPassword(temporaryPassword);
  user.passwordHash=credentials.hash; user.passwordSalt=credentials.salt;
  users.push(user); await saveUsers(users); return {...user, temporaryPassword};
}
export async function setPassword(matricula, password) {
  const users = await getUsers();
  const idx = users.findIndex(u => u.matricula === String(matricula));
  if (idx < 0) return null;
  const { salt, hash } = hashPassword(password);
  users[idx] = normalizeUser({ ...users[idx], passwordSalt: salt, passwordHash: hash, mustChangePassword: false, sessionVersion: Number(users[idx].sessionVersion || 1) + 1, updatedAt: new Date().toISOString() });
  await saveUsers(users); return users[idx];
}
export async function resetPassword(matricula) {
  const users = await getUsers();
  const idx = users.findIndex(u => u.matricula === String(matricula)); if (idx < 0) return null;
  const temporaryPassword=randomBytes(18).toString('base64url');
  const credentials=hashPassword(temporaryPassword);
  users[idx] = normalizeUser({ ...users[idx], passwordHash: credentials.hash, passwordSalt: credentials.salt, mustChangePassword: true, sessionVersion: Number(users[idx].sessionVersion || 1) + 1, updatedAt: new Date().toISOString() });
  await saveUsers(users); return {...users[idx], temporaryPassword};
}
