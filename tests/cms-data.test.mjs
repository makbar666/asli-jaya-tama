import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';

test('konten Neon mengubah dan menyembunyikan konten awal tanpa menghapus video sinkron', async () => {
  const baseline = [
    { type: 'photo', slug: 'foto-a', title: 'Foto lama', status: 'published', sort_order: 1 },
    { type: 'photo', slug: 'foto-b', title: 'Foto disembunyikan', status: 'published', sort_order: 2 },
    { type: 'video', slug: 'video-drive-baru', title: 'Video sinkron', status: 'published', sort_order: 3 },
  ];
  const overlays = [
    { type: 'photo', slug: 'foto-a', title: 'Foto diperbarui', status: 'published', sort_order: 1 },
    { type: 'photo', slug: 'foto-b', status: 'hidden' },
  ];
  const context = {
    window: {},
    fetch: async url => ({ ok: true, json: async () => url.includes('fallback') ? baseline : { items: overlays } }),
  };
  runInNewContext(readFileSync('public/assets/js/cms-data.js', 'utf8'), context);
  const items = await context.window.AJTContent.load();
  assert.equal(items.find(item => item.slug === 'foto-a').title, 'Foto diperbarui');
  assert.equal(items.some(item => item.slug === 'foto-b'), false);
  assert.equal(items.some(item => item.slug === 'video-drive-baru'), true);
});
