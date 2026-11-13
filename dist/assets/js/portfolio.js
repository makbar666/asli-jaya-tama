(() => {
  document.querySelectorAll('.filter-bar').forEach(bar => {
    const grid = document.getElementById(bar.dataset.filterTarget);
    if (grid) grid.dataset.activeFilter = 'all';
  });
  document.addEventListener('click', event => {
    const button = event.target.closest('.filter-bar [data-filter]');
    if (!button) return;
    const bar = button.closest('.filter-bar');
    const grid = document.getElementById(bar.dataset.filterTarget);
    if (!grid) return;
    bar.querySelectorAll('[data-filter]').forEach(item => {
      const active = item === button;
      item.classList.toggle('is-active', active);
      item.setAttribute('aria-pressed', String(active));
    });
    grid.dataset.activeFilter = button.dataset.filter;
    grid.dispatchEvent(new Event('galleryfilter', { bubbles: true }));
  });
  document.addEventListener('galleryfilter', event => {
    const grid = event.target;
    if (!grid.matches('#photos, #projects')) return;
    let count = 0;
    grid.querySelectorAll('[data-category]').forEach(card => {
      const show = grid.dataset.activeFilter === 'all' || card.dataset.category === grid.dataset.activeFilter;
      card.hidden = !show;
      if (show) count++;
    });
    const empty = grid.nextElementSibling;
    if (empty?.classList.contains('filter-empty')) empty.hidden = count > 0;
  });

  let previousFocus = null;
  document.addEventListener('click', event => {
    const button = event.target.closest('[data-lightbox-src]');
    if (!button) return;
    previousFocus = button;
    const overlay = document.createElement('div');
    overlay.className = 'lightbox';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-label', 'Foto proyek diperbesar');
    const image = document.createElement('img');
    image.src = button.dataset.lightboxSrc;
    image.alt = button.dataset.lightboxAlt || '';
    const close = document.createElement('button');
    close.type = 'button'; close.setAttribute('aria-label', 'Tutup foto'); close.textContent = '×';
    let closing = false;
    const dismiss = () => {
      if (closing) return;
      closing = true;
      overlay.classList.add('is-closing');
      document.removeEventListener('keydown', onKey);
      window.setTimeout(() => { overlay.remove(); previousFocus?.focus(); }, window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 180);
    };
    const onKey = event => { if (event.key === 'Escape') dismiss(); if (event.key === 'Tab') { event.preventDefault(); close.focus(); } };
    close.addEventListener('click', dismiss);
    overlay.addEventListener('click', event => { if (event.target === overlay) dismiss(); });
    overlay.append(image, close); document.body.append(overlay); close.focus();
    document.addEventListener('keydown', onKey);
  });
})();
