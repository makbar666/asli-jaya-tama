import { body, db, fail, sameOrigin, send, session } from '../server/cms-lib.mjs';

const TYPES = new Set(['project', 'photo', 'video']);
const STATUSES = new Set(['published', 'draft', 'hidden']);
const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const drivePattern = /^[A-Za-z0-9_-]{10,100}$/;
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function string(value, max = 5000) {
  if (typeof value !== 'string') return '';
  const result = value.trim();
  if (result.length > max) throw Object.assign(new Error('Teks terlalu panjang.'), { status: 400 });
  return result;
}

function validMedia(value) {
  if (!value) return false;
  if (/^\/assets\/[a-zA-Z0-9_./-]+$/.test(value) && !value.includes('..')) return true;
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && !url.username && !url.password;
  } catch { return false; }
}

export function validateEntry(input) {
  const type = string(input.type, 20);
  const slug = string(input.slug, 100);
  const status = string(input.status, 20) || 'draft';
  if (!TYPES.has(type) || !slugPattern.test(slug) || slug.length > 100 || !STATUSES.has(status)) {
    throw Object.assign(new Error('Jenis konten, slug, atau status tidak valid.'), { status: 400 });
  }
  const data = {
    type, slug, status,
    title: string(input.title, 120),
    category: string(input.category, 80),
    description: string(input.description, 5000),
    media_url: string(input.media_url, 2000),
    alt_text: string(input.alt_text, 200),
    gallery: Array.isArray(input.gallery) ? input.gallery : [],
    drive_file_id: string(input.drive_file_id, 100) || null,
    duration: string(input.duration, 30) || null,
    location: string(input.location, 120) || null,
    year: input.year === '' || input.year == null ? null : Number(input.year),
    image_width: input.image_width === '' || input.image_width == null ? null : Number(input.image_width),
    image_height: input.image_height === '' || input.image_height == null ? null : Number(input.image_height),
    featured: input.featured === true,
    sort_order: Number.isInteger(Number(input.sort_order)) ? Number(input.sort_order) : 100,
  };
  if (status !== 'hidden') {
    if (!data.title || data.title.length > 120 || !data.category || data.category.length > 80 || data.description.length > 5000 || !validMedia(data.media_url)) {
      throw Object.assign(new Error('Judul, kategori, deskripsi, atau URL gambar tidak valid.'), { status: 400 });
    }
    if (type === 'video' && !drivePattern.test(data.drive_file_id || '')) {
      throw Object.assign(new Error('ID file Google Drive tidak valid.'), { status: 400 });
    }
    if (type === 'photo' && (!data.alt_text || data.alt_text.length > 200)) {
      throw Object.assign(new Error('Teks alternatif foto wajib diisi.'), { status: 400 });
    }
  }
  if (data.gallery.length > 30 || !data.gallery.every(item => typeof item === 'string' && validMedia(item))) {
    throw Object.assign(new Error('Galeri maksimal 30 URL gambar HTTPS atau path /assets/.'), { status: 400 });
  }
  if (data.year !== null && (!Number.isInteger(data.year) || data.year < 1900 || data.year > 2100)) {
    throw Object.assign(new Error('Tahun tidak valid.'), { status: 400 });
  }
  for (const key of ['image_width', 'image_height']) {
    if (data[key] !== null && (!Number.isInteger(data[key]) || data[key] < 1 || data[key] > 20000)) {
      throw Object.assign(new Error('Dimensi gambar tidak valid.'), { status: 400 });
    }
  }
  if (data.sort_order < 0 || data.sort_order > 100000) {
    throw Object.assign(new Error('Urutan tidak valid.'), { status: 400 });
  }
  return data;
}

export default async function handler(req, res) {
  try {
    const sql = db();
    const params = new URL(req.url || '/api/content', 'https://example.local').searchParams;
    if (req.method === 'GET') {
      if (params.get('admin') === '1') {
        const user = await session(req);
        if (!user) return send(res, 401, { error: 'Silakan masuk kembali.' });
        const items = await sql`select * from cms_entries order by sort_order asc, created_at asc limit 1000`;
        return send(res, 200, { items });
      }
      const published = await sql`select * from cms_entries where status = 'published' order by sort_order asc, created_at asc limit 1000`;
      const hidden = await sql`select type, slug, status from cms_entries where status = 'hidden' limit 1000`;
      return send(res, 200, { items: [...published, ...hidden] });
    }

    if (!['POST', 'DELETE'].includes(req.method)) return send(res, 405, { error: 'Metode tidak didukung.' });
    if (!sameOrigin(req)) return send(res, 403, { error: 'Asal permintaan tidak valid.' });
    const user = await session(req);
    if (!user) return send(res, 401, { error: 'Silakan masuk kembali.' });

    if (req.method === 'DELETE') {
      const id = params.get('id') || '';
      if (!uuidPattern.test(id)) return send(res, 400, { error: 'ID konten tidak valid.' });
      const removed = await sql`delete from cms_entries where id = ${id} returning id`;
      return send(res, removed.length ? 200 : 404, removed.length ? { ok: true } : { error: 'Konten tidak ditemukan.' });
    }

    const input = body(req);
    const entry = validateEntry(input);
    const gallery = JSON.stringify(entry.gallery);
    let saved;
    if (input.id) {
      if (typeof input.id !== 'string' || !uuidPattern.test(input.id)) return send(res, 400, { error: 'ID konten tidak valid.' });
      saved = await sql`update cms_entries set
        type = ${entry.type}, slug = ${entry.slug}, title = ${entry.title}, category = ${entry.category},
        description = ${entry.description}, media_url = ${entry.media_url}, alt_text = ${entry.alt_text},
        gallery = ${gallery}::jsonb, drive_file_id = ${entry.drive_file_id}, duration = ${entry.duration},
        location = ${entry.location}, year = ${entry.year}, image_width = ${entry.image_width},
        image_height = ${entry.image_height}, featured = ${entry.featured}, status = ${entry.status},
        sort_order = ${entry.sort_order}, updated_at = now()
        where id = ${input.id} returning *`;
    } else {
      saved = await sql`insert into cms_entries
        (type, slug, title, category, description, media_url, alt_text, gallery, drive_file_id,
         duration, location, year, image_width, image_height, featured, status, sort_order)
        values (${entry.type}, ${entry.slug}, ${entry.title}, ${entry.category}, ${entry.description},
          ${entry.media_url}, ${entry.alt_text}, ${gallery}::jsonb, ${entry.drive_file_id},
          ${entry.duration}, ${entry.location}, ${entry.year}, ${entry.image_width},
          ${entry.image_height}, ${entry.featured}, ${entry.status}, ${entry.sort_order})
        on conflict (type, slug) do update set
          title = excluded.title, category = excluded.category, description = excluded.description,
          media_url = excluded.media_url, alt_text = excluded.alt_text, gallery = excluded.gallery,
          drive_file_id = excluded.drive_file_id, duration = excluded.duration, location = excluded.location,
          year = excluded.year, image_width = excluded.image_width, image_height = excluded.image_height,
          featured = excluded.featured, status = excluded.status, sort_order = excluded.sort_order,
          updated_at = now()
        returning *`;
    }
    return send(res, saved.length ? 200 : 404, saved.length ? { item: saved[0] } : { error: 'Konten tidak ditemukan.' });
  } catch (error) {
    if (error.code === '23505') return send(res, 409, { error: 'Slug sudah digunakan untuk jenis konten ini.' });
    return fail(res, error);
  }
}
