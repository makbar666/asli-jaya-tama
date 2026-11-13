import { adminConfigured, body, db, digest, fail, readSessionToken, sameOrigin, send, session, sessionCookie, token, verifyPassword } from '../server/cms-lib.mjs';

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      if (!adminConfigured()) return send(res, 503, { error: 'CMS belum dikonfigurasi. Atur kredensial admin di Vercel.' });
      const user = await session(req);
      return send(res, 200, { authenticated: Boolean(user), email: user?.email || null });
    }
    if (!['POST', 'DELETE'].includes(req.method)) return send(res, 405, { error: 'Metode tidak didukung.' });
    if (!sameOrigin(req)) return send(res, 403, { error: 'Asal permintaan tidak valid.' });
    if (!adminConfigured()) return send(res, 503, { error: 'CMS belum dikonfigurasi. Atur kredensial admin di Vercel.' });

    const sql = db();
    if (req.method === 'DELETE') {
      const value = readSessionToken(req);
      if (value) await sql`delete from cms_sessions where token_hash = ${digest(value)}`;
      res.setHeader('Set-Cookie', sessionCookie(req, '', 0));
      return send(res, 200, { ok: true });
    }

    const input = body(req);
    const email = String(input.email || '').trim().toLowerCase();
    const password = String(input.password || '');
    if (email.length > 200 || password.length > 300) return send(res, 400, { error: 'Email atau kata sandi tidak valid.' });

    const ip = String(req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown').split(',')[0].trim();
    const key = digest(`${process.env.CMS_SESSION_SECRET}|${ip}`);
    const attempts = await sql`select attempts, window_end from cms_login_attempts where key = ${key} limit 1`;
    if (attempts[0] && attempts[0].attempts >= 5 && new Date(attempts[0].window_end).getTime() > Date.now()) {
      return send(res, 429, { error: 'Terlalu banyak percobaan. Coba lagi dalam 15 menit.' });
    }

    const correctEmail = email === process.env.CMS_ADMIN_EMAIL.trim().toLowerCase();
    const correctPassword = verifyPassword(password);
    if (!correctEmail || !correctPassword) {
      await sql`insert into cms_login_attempts (key, attempts, window_end)
        values (${key}, 1, now() + interval '15 minutes')
        on conflict (key) do update set
          attempts = case when cms_login_attempts.window_end < now() then 1 else cms_login_attempts.attempts + 1 end,
          window_end = case when cms_login_attempts.window_end < now() then now() + interval '15 minutes' else cms_login_attempts.window_end end`;
      return send(res, 401, { error: 'Email atau kata sandi salah.' });
    }

    await sql`delete from cms_login_attempts where key = ${key}`;
    await sql`delete from cms_sessions where expires_at <= now()`;
    const value = token();
    await sql`insert into cms_sessions (token_hash, email, expires_at)
      values (${digest(value)}, ${email}, now() + interval '12 hours')`;
    res.setHeader('Set-Cookie', sessionCookie(req, value, 12 * 60 * 60));
    return send(res, 200, { ok: true, email });
  } catch (error) {
    return fail(res, error);
  }
}
