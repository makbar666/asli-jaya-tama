(() => {
  const modal = document.getElementById('video-modal');
  const player = document.getElementById('video-player');
  const title = document.getElementById('video-modal-title');
  const external = document.getElementById('video-external');
  let trigger = null;
  let closeTimer = null;
  let openFrame = null;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const validId = id => /^[A-Za-z0-9_-]{10,100}$/.test(id || '');
  const close = () => {
    if (modal.hidden) return;
    clearTimeout(closeTimer);
    cancelAnimationFrame(openFrame);
    player.replaceChildren(); // removes iframe and stops playback
    modal.classList.remove('is-open');
    document.body.style.overflow = '';
    const returnFocus = trigger;
    closeTimer = setTimeout(() => {
      modal.hidden = true;
      returnFocus?.focus();
    }, reduceMotion.matches ? 0 : 220);
  };
  document.addEventListener('click', event => {
    const button = event.target.closest('.video-trigger');
    if (!button || button.disabled) return;
    const id = button.dataset.videoId;
    if (!validId(id)) return;
    clearTimeout(closeTimer);
    cancelAnimationFrame(openFrame);
    trigger = button;
    title.textContent = button.dataset.title || 'Video proyek';
    external.href = `https://drive.google.com/file/d/${id}/view`;
    const iframe = document.createElement('iframe');
    iframe.src = `https://drive.google.com/file/d/${id}/preview`;
    iframe.title = title.textContent;
    iframe.allow = 'autoplay; fullscreen';
    iframe.allowFullscreen = true;
    iframe.referrerPolicy = 'strict-origin-when-cross-origin';
    player.replaceChildren(iframe);
    modal.hidden = false;
    openFrame = requestAnimationFrame(() => modal.classList.add('is-open'));
    document.body.style.overflow = 'hidden';
    modal.querySelector('.modal-close').focus();
  });
  modal.querySelectorAll('[data-close-video]').forEach(button => button.addEventListener('click', close));
  document.addEventListener('keydown', event => {
    if (modal.hidden) return;
    if (event.key === 'Escape') close();
    if (event.key === 'Tab') {
      const focusable = [...modal.querySelectorAll('button,a,iframe')].filter(item => !item.disabled);
      const first = focusable[0], last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }
  });

  const grid = document.getElementById('videos');
  const more = document.getElementById('load-more-videos');
  if (!grid || !more) return;
  const size = Math.max(1, Number(grid.dataset.pageSize) || 9);
  let visible = size;
  const update = () => {
    const matching = [...grid.querySelectorAll('[data-category]')].filter(card => grid.dataset.activeFilter === 'all' || card.dataset.category === grid.dataset.activeFilter);
    grid.querySelectorAll('[data-category]').forEach(card => card.hidden = true);
    matching.forEach((card, index) => card.hidden = index >= visible);
    more.hidden = matching.length <= visible;
    const empty = grid.parentElement.querySelector('.filter-empty');
    if (empty) empty.hidden = matching.length > 0;
  };
  grid.addEventListener('galleryfilter', () => { visible = size; update(); });
  more.addEventListener('click', () => {
    const previous = visible;
    visible += size;
    update();
    grid.dispatchEvent(new CustomEvent('gallerypage', { detail: { start: previous } }));
  });
  update();
})();
