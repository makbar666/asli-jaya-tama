(() => {
  const button = document.querySelector('.theme-toggle');
  if (!button) return;
  const root = document.documentElement;
  const media = window.matchMedia('(prefers-color-scheme: dark)');
  const key = 'ajt-theme';
  let transitionTimer = null;
  const syncButton = () => button.setAttribute('aria-pressed', String(root.dataset.theme === 'dark'));
  const apply = theme => {
    root.dataset.theme = theme;
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.content = theme === 'dark' ? '#171714' : '#f7f5f0';
    syncButton();
  };
  syncButton();
  button.addEventListener('click', () => {
    clearTimeout(transitionTimer);
    root.classList.add('theme-transition');
    const next = root.dataset.theme === 'dark' ? 'light' : 'dark';
    apply(next);
    try { localStorage.setItem(key, next); } catch (_) {}
    transitionTimer = setTimeout(() => root.classList.remove('theme-transition'), 360);
  });
  media.addEventListener?.('change', event => {
    let saved = null;
    try { saved = localStorage.getItem(key); } catch (_) {}
    if (saved !== 'dark' && saved !== 'light') apply(event.matches ? 'dark' : 'light');
  });
})();
