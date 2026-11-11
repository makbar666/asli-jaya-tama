(() => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (reduceMotion.matches) return;

  const selectors = [
    '.section-heading', '.intro-visual', '.intro-copy', '.service-row',
    '.project-card', '.video-card', '.process-step', '.cta-inner > *',
    '.editorial-grid > *', '.service-detail-visual', '.service-detail-copy',
    '.empty-page', '.empty-feature', '.empty-inline', '.contact-details',
    '.contact-form-wrap', '.detail-gallery', '.related-video'
  ];

  if ('IntersectionObserver' in window) {
    const candidates = [...document.querySelectorAll(selectors.join(','))];
    const reveal = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -35px 0px' });

    candidates.forEach(element => {
      if (element.getBoundingClientRect().top < window.innerHeight * .88) return;
      const peers = [...element.parentElement.children].filter(item => item.matches(selectors.join(',')));
      const index = peers.indexOf(element);
      element.style.setProperty('--reveal-delay', `${Math.min(Math.max(index, 0), 5) * 65}ms`);
      element.dataset.motion = '';
      reveal.observe(element);
    });
    document.documentElement.classList.add('motion-ready');
  }

  // Filter yang sudah memperbarui visibilitas kartu memicu animasi singkat.
  document.querySelectorAll('#projects, #videos').forEach(grid => {
    const animateVisible = start => {
      requestAnimationFrame(() => {
        [...grid.querySelectorAll('[data-category]:not([hidden])')].slice(start).forEach((card, index) => {
          card.classList.add('is-visible');
          if (!card.animate) return;
          card.animate(
            [{ opacity: 0, transform: 'translateY(10px)' }, { opacity: 1, transform: 'translateY(0)' }],
            { duration: 360, delay: Math.min(index, 5) * 45, easing: 'cubic-bezier(.22, 1, .36, 1)' }
          );
        });
      });
    };
    grid.addEventListener('galleryfilter', () => animateVisible(0));
    grid.addEventListener('gallerypage', event => animateVisible(event.detail.start));
  });
})();
