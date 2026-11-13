window.AJTContent = {
  async load() {
    const [staticResponse, cmsResponse] = await Promise.all([
      fetch('/content-fallback.json', { cache: 'no-store' }),
      fetch('/api/content', { cache: 'no-store' }),
    ]);
    if (!staticResponse.ok || !cmsResponse.ok) throw new Error('Konten CMS belum tersedia.');
    const baseline = await staticResponse.json();
    const { items: overlays = [] } = await cmsResponse.json();
    const map = new Map(baseline.map(item => [`${item.type}:${item.slug}`, item]));
    overlays.forEach(item => {
      const key = `${item.type}:${item.slug}`;
      if (item.status === 'hidden') map.delete(key);
      else if (item.status === 'published') map.set(key, { ...map.get(key), ...item });
    });
    return [...map.values()].filter(item => item.status === 'published')
      .sort((a, b) => (a.sort_order ?? 100) - (b.sort_order ?? 100) || a.title.localeCompare(b.title, 'id'));
  },
};
