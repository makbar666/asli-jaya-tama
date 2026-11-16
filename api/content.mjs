import { db, fail, send } from '../server/cms-lib.mjs';

// Preserve existing published CMS entries and hidden overrides as read-only data.
export default async function handler(req, res) {
  try {
    if (req.method !== 'GET') return send(res, 405, { error: 'Metode tidak didukung.' });
    const sql = db();
    const published = await sql`select * from cms_entries where status = 'published' order by sort_order asc, created_at asc limit 1000`;
    const hidden = await sql`select type, slug, status from cms_entries where status = 'hidden' limit 1000`;
    return send(res, 200, { items: [...published, ...hidden] });
  } catch (error) { return fail(res, error); }
}
