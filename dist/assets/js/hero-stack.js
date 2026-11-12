(() => {
  const stack = document.querySelector('.hero-photo-stack');
  if (!stack) return;
  const cards = [...stack.querySelectorAll('.hero-photo-card')];
  if (cards.length < 2) return;

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const hoverCapable = window.matchMedia('(hover: hover)');
  const positions = ['far-left', 'left', 'center', 'right', 'far-right'];
  let active = Math.min(2, cards.length - 1);
  let timer = null;
  let hovering = false;
  let focused = false;
  let visible = true;
  let keyboardMode = false;

  const show = index => {
    active = (index + cards.length) % cards.length;
    cards.forEach((card, cardIndex) => {
      const half = Math.floor(cards.length / 2);
      const offset = ((cardIndex - active + cards.length + half) % cards.length) - half;
      const position = positions[Math.max(0, Math.min(4, offset + 2))];
      card.dataset.position = position;
      card.setAttribute('aria-pressed', String(cardIndex === active));
    });
  };

  const schedule = () => {
    clearTimeout(timer);
    if (reducedMotion.matches || hovering || focused || !visible || document.hidden) return;
    timer = window.setTimeout(() => {
      show(active + 1);
      schedule();
    }, 5000);
  };

  cards.forEach((card, index) => card.addEventListener('click', () => {
    show(index);
    schedule();
  }));

  document.addEventListener('keydown', event => {
    if (event.key === 'Tab' || event.key.startsWith('Arrow')) keyboardMode = true;
  });
  stack.addEventListener('pointerdown', () => {
    keyboardMode = false;
    focused = false;
    schedule();
  });

  stack.addEventListener('pointerenter', () => {
    if (!hoverCapable.matches) return;
    hovering = true;
    schedule();
  });
  stack.addEventListener('pointerleave', () => {
    hovering = false;
    schedule();
  });
  stack.addEventListener('focusin', () => {
    focused = keyboardMode;
    schedule();
  });
  stack.addEventListener('focusout', () => queueMicrotask(() => {
    focused = keyboardMode && stack.contains(document.activeElement);
    schedule();
  }));
  document.addEventListener('visibilitychange', schedule);
  reducedMotion.addEventListener?.('change', schedule);

  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      schedule();
    }, { threshold: 0.1 }).observe(stack);
  }
  show(active);
  schedule();
})();
