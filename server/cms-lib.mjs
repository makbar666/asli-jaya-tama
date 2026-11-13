import { createHash, randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';
import { neon } from '@neondatabase/serverless';

let database;
export function db() {
  if (!process.env.DATABASE_URL) {
    const error = new Error('DATABASE_URL belum diatur.');
    error.status = 503;
    throw error;
  }
  return database ??= neon(process.env.DATABASE_URL);
}

export function send(res, status, data) {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  return res.status(status).json(data);
}

export function sameOrigin(req) {
  const origin = req.headers.origin;
  const host = req.headers['x-forwarded-host'] || req.headers.host;
  if (!origin || !host) return false;
  const proto = req.headers['x-forwarded-proto'] || (String(host).startsWith('localhost') ? 'http' : 'https');
  try {
    const parsed = new URL(origin);
    return parsed.host === host && parsed.protocol === `${proto}:`;
  } catch { return false; }
}

export function body(req) {
  const data = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
  if (!data || typeof data !== 'object' || Array.isArray(data) || JSON.stringify(data).length > 25000) {
    const error = new Error('Data permintaan tidak valid.');
    error.status = 400;
    throw error;
  }
  return data;
}

export const digest = value => createHash('sha256').update(value).digest('hex');
export const token = () => randomBytes(32).toString('base64url');

export function verifyPassword(password) {
  const encoded = process.env.CMS_PASSWORD_HASH || '';
  const match = /^scrypt\$([A-Za-z0-9_-]+)\$([A-Za-z0-9_-]+)$/.exec(encoded);
  if (!match) return false;
  const expected = Buffer.from(match[2], 'base64url');
  if (expected.length !== 64) return false;
  const received = scryptSync(password, match[1], 64);
  return timingSafeEqual(expected, received);
}

export function adminConfigured() {
  return Boolean(process.env.CMS_ADMIN_EMAIL && process.env.CMS_PASSWORD_HASH && (process.env.CMS_SESSION_SECRET || '').length >= 32);
}

export function sessionCookie(req, value, maxAge) {
  const proto = req.headers['x-forwarded-proto'] || (req.headers.host?.startsWith('localhost') ? 'http' : 'https');
  return `ajt_cms=${value}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${maxAge}${proto === 'https' ? '; Secure' : ''}`;
}

export function readSessionToken(req) {
  const cookie = req.headers.cookie || '';
  return /(?:^|;\s*)ajt_cms=([A-Za-z0-9_-]{43})/.exec(cookie)?.[1] || null;
}

export async function session(req) {
  const value = readSessionToken(req);
  if (!value) return null;
  const rows = await db()`select email from cms_sessions where token_hash = ${digest(value)} and expires_at > now() limit 1`;
  return rows[0] || null;
}

export function fail(res, error) {
  if (error.status === 400 || error.status === 401 || error.status === 403 || error.status === 405 || error.status === 429 || error.status === 503) {
    return send(res, error.status, { error: error.message });
  }
  console.error('CMS API error:', error);
  return send(res, 500, { error: 'Terjadi kesalahan server. Coba lagi nanti.' });
}
