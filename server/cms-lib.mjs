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

export function fail(res, error) {
  if (error.status === 503) return send(res, 503, { error: error.message });
  console.error('Content API error:', error);
  return send(res, 500, { error: 'Terjadi kesalahan server. Coba lagi nanti.' });
}
