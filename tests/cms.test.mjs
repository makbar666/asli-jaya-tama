import test from 'node:test';
import assert from 'node:assert/strict';
import { scryptSync } from 'node:crypto';
import { sameOrigin, sessionCookie, verifyPassword } from '../server/cms-lib.mjs';
import { driveFileId, validateEntry } from '../api/content.mjs';

const photo = {
  type: 'photo', slug: 'lemari-custom', title: 'Lemari Custom', category: 'Furniture Custom',
  media_url: '/assets/images/hero/5.jpeg', alt_text: 'Lemari kayu di area kamar', status: 'published',
  gallery: [], sort_order: 1,
};

test('menerima foto valid dan menolak media berbahaya', () => {
  assert.equal(validateEntry(photo).slug, 'lemari-custom');
  assert.throws(() => validateEntry({ ...photo, media_url: 'javascript:alert(1)' }), /URL gambar/);
  assert.throws(() => validateEntry({ ...photo, media_url: '/assets/../config/site.php' }), /URL gambar/);
  assert.throws(() => validateEntry({ ...photo, slug: '../admin' }), /slug/);
});

test('video menerima tautan file Google Drive dan menolak folder atau domain lain', () => {
  const id = '1PkjflTHTR87KH4i_XQWk3dE_O42YbBST';
  assert.equal(driveFileId(`https://drive.google.com/file/d/${id}/view?usp=sharing`), id);
  assert.equal(driveFileId(`https://drive.google.com/open?id=${id}`), id);
  assert.equal(driveFileId(`https://drive.google.com/drive/folders/${id}`), null);
  assert.equal(driveFileId(`https://drive.google.com.evil.test/file/d/${id}/view`), null);
  assert.throws(() => validateEntry({ ...photo, type: 'video', drive_url: `https://drive.google.com/drive/folders/${id}` }), /Google Drive/);
  assert.equal(validateEntry({ ...photo, type: 'video', drive_url: `https://drive.google.com/file/d/${id}/view` }).drive_file_id, id);
});

test('tombstone dapat menyembunyikan konten awal', () => {
  assert.equal(validateEntry({ type: 'photo', slug: 'lemari-custom', status: 'hidden' }).status, 'hidden');
});

test('verifikasi kata sandi menggunakan hash scrypt', () => {
  const original = process.env.CMS_PASSWORD_HASH;
  const salt = 'test-salt';
  process.env.CMS_PASSWORD_HASH = `scrypt$${salt}$${scryptSync('password-panjang-aman', salt, 64).toString('base64url')}`;
  assert.equal(verifyPassword('password-panjang-aman'), true);
  assert.equal(verifyPassword('password-salah'), false);
  if (original === undefined) delete process.env.CMS_PASSWORD_HASH;
  else process.env.CMS_PASSWORD_HASH = original;
});

test('mutasi hanya dari origin yang sama', () => {
  assert.equal(sameOrigin({ headers: { origin: 'https://contoh.id', host: 'contoh.id' } }), true);
  assert.equal(sameOrigin({ headers: { origin: 'https://jahat.id', host: 'contoh.id' } }), false);
  assert.equal(sameOrigin({ headers: { origin: 'http://contoh.id', host: 'contoh.id' } }), false);
});

test('cookie sesi admin terlindungi pada HTTPS', () => {
  const cookie = sessionCookie({ headers: { host: 'contoh.id', 'x-forwarded-proto': 'https' } }, 'token', 3600);
  assert.match(cookie, /HttpOnly/);
  assert.match(cookie, /SameSite=Strict/);
  assert.match(cookie, /Secure/);
});
