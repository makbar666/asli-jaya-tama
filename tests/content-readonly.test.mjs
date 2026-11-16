import test from 'node:test';
import assert from 'node:assert/strict';
import handler from '../api/content.mjs';

test('API konten menolak perubahan tanpa memerlukan koneksi database', async () => {
  for (const method of ['POST', 'DELETE', 'PUT']) {
    const res = { setHeader() {}, status(code) { this.code = code; return this; }, json(data) { this.data = data; return this; } };
    await handler({ method }, res);
    assert.equal(res.code, 405);
  }
});
