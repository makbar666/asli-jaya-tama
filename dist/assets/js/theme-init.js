(() => {
  const key = 'ajt-theme';
  let saved = null;
  try { saved = localStorage.getItem(key); } catch (_) {}
  const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)')?.matches ?? false;
  const theme = saved === 'dark' || saved === 'light' ? saved : (prefersDark ? 'dark' : 'light');
  document.documentElement.dataset.theme = theme;
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.content = theme === 'dark' ? '#171714' : '#f7f5f0';
})();
