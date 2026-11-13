(() => {
  const el = (name, className, value) => {
    const node = document.createElement(name);
    if (className) node.className = className;
    if (value !== undefined) node.textContent = value;
    return node;
  };
  const image = (src, alt, width, height) => {
    const img = el('img');
    img.src = src; img.alt = alt;
    img.width = width || 800; img.height = height || 600;
    img.loading = 'lazy'; img.decoding = 'async';
    return img;
  };
  const photoCard = item => {
    const card = el('article', 'photo-card'); card.dataset.category = item.category;
    const button = el('button', 'photo-trigger'); button.type = 'button';
    button.dataset.lightboxSrc = item.media_url; button.dataset.lightboxAlt = item.alt_text || item.title;
    button.setAttribute('aria-label', `Perbesar foto: ${item.title}`);
    const frame = el('span', 'photo-image'); frame.append(image(item.media_url, item.alt_text || item.title, item.image_width, item.image_height));
    button.append(frame, el('span', 'photo-category', item.category), el('span', 'photo-title', item.title), el('span', 'photo-view', 'Perbesar foto ↗'));
    card.append(button); return card;
  };
  const videoCard = item => {
    const card = el('article', 'video-card'); card.dataset.category = item.category;
    const button = el('button', 'video-trigger'); button.type = 'button';
    button.dataset.videoId = item.drive_file_id || ''; button.dataset.title = item.title;
    button.disabled = !/^[A-Za-z0-9_-]{10,100}$/.test(item.drive_file_id || '');
    button.setAttribute('aria-label', `Putar video ${item.title}`);
    const frame = el('span', 'video-image media-frame'); frame.append(image(item.media_url, '', 720, 450), el('span', 'play-icon', '▶'));
    button.append(frame); card.append(button);
    const info = el('div', 'video-info'); info.append(el('span', 'eyebrow', item.category), el('h3', '', item.title));
    if (item.duration) info.append(el('span', 'duration', item.duration));
    info.append(el('p', '', item.description || '')); card.append(info); return card;
  };
  const projectCard = item => {
    const card = el('article', 'project-card'); card.dataset.category = item.category;
    const link = el('a'); link.href = `/proyek?slug=${encodeURIComponent(item.slug)}`;
    link.setAttribute('aria-label', `Lihat proyek ${item.title}`);
    const frame = el('div', 'project-image media-frame'); frame.append(image(item.media_url, item.alt_text || item.title, 720, 540));
    const meta = el('div', 'project-meta'); meta.append(el('span', '', item.category));
    if (item.location) meta.append(el('span', '', item.location));
    link.append(frame, meta, el('h3', '', item.title), el('span', 'text-link', 'Lihat proyek ↗'));
    card.append(link); return card;
  };
  const setFilters = (bar, items) => {
    if (!bar) return;
    bar.replaceChildren();
    const categories = ['all', ...new Set(items.map(item => item.category))];
    categories.forEach((category, index) => {
      const button = el('button', `filter-button${index === 0 ? ' is-active' : ''}`, index === 0 ? 'Semua' : category);
      button.type = 'button'; button.dataset.filter = category;
      button.setAttribute('aria-pressed', String(index === 0)); bar.append(button);
    });
  };
  const fillGrid = (grid, items, makeCard) => {
    if (!grid) return;
    grid.replaceChildren(...items.map(makeCard));
    grid.hidden = items.length === 0;
    grid.dataset.activeFilter = 'all';
    grid.dispatchEvent(new Event('galleryfilter', { bubbles: true }));
  };

  window.AJTContent.load().then(items => {
    const photos = items.filter(item => item.type === 'photo');
    const videos = items.filter(item => item.type === 'video');
    const projects = items.filter(item => item.type === 'project');
    document.querySelectorAll('.photo-grid').forEach(grid => fillGrid(grid, photos, photoCard));
    setFilters(document.querySelector('[data-filter-target="photos"]'), photos);
    const homeVideos = document.querySelector('.videos-section .video-grid');
    fillGrid(homeVideos, videos.filter(item => item.featured).slice(0, 3), videoCard);
    const allVideos = document.getElementById('videos');
    fillGrid(allVideos, videos, videoCard);
    setFilters(document.querySelector('[data-filter-target="videos"]'), videos);

    const homeSection = document.querySelector('.projects-section .container');
    if (homeSection) {
      let grid = homeSection.querySelector('.project-grid');
      if (!grid && projects.length) {
        grid = el('div', 'project-grid portfolio-projects');
        homeSection.querySelector('.photo-grid')?.before(grid);
      }
      fillGrid(grid, projects.filter(item => item.featured).slice(0, 6), projectCard);
    }

    const portfolioPhotos = document.getElementById('photos');
    if (portfolioPhotos) {
      let bar = document.querySelector('[data-filter-target="projects"]');
      let grid = document.getElementById('projects');
      if (!bar && projects.length) {
        bar = el('div', 'filter-bar'); bar.dataset.filterTarget = 'projects';
        bar.setAttribute('aria-label', 'Filter kategori proyek');
        portfolioPhotos.parentElement.querySelector('.photo-section-intro')?.before(bar);
      }
      if (!grid && projects.length) {
        grid = el('div', 'project-grid portfolio-projects'); grid.id = 'projects';
        bar.after(grid);
      }
      setFilters(bar, projects);
      fillGrid(grid, projects, projectCard);
      if (bar) bar.hidden = projects.length === 0;
    }
    if (!photos.length) {
      document.querySelector('[data-filter-target="photos"]')?.setAttribute('hidden', '');
      const homeSection = document.querySelector('.projects-section .container');
      if (homeSection && !projects.length) homeSection.append(el('p', 'empty-inline', 'Dokumentasi foto sedang disiapkan.'));
    }
  }).catch(() => { /* Static PHP content remains visible when Neon is not configured. */ });
})();
