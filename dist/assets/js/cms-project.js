(() => {
  const root = document.getElementById('cms-project-detail');
  if (!root) return;
  const slug = new URLSearchParams(location.search).get('slug') || '';
  const title = document.getElementById('cms-project-title');
  const summary = document.getElementById('cms-project-summary');
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    title.textContent = 'Proyek tidak ditemukan'; summary.textContent = 'Tautan proyek tidak valid.'; return;
  }
  const el = (tag, className, value) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (value !== undefined) node.textContent = value;
    return node;
  };
  window.AJTContent.load().then(items => {
    const project = items.find(item => item.type === 'project' && item.slug === slug);
    if (!project) {
      title.textContent = 'Proyek tidak ditemukan'; summary.textContent = 'Dokumentasi proyek ini belum tersedia.'; return;
    }
    document.title = `${project.title} | Asli Jaya Interior`;
    title.textContent = project.title;
    summary.textContent = project.category;
    const lead = el('div', 'project-lead media-frame');
    const cover = el('img'); cover.src = project.media_url; cover.alt = project.alt_text || project.title;
    cover.width = 1200; cover.height = 750; lead.append(cover); root.append(lead);
    const facts = el('div', 'project-facts'); facts.append(el('span', '', project.category));
    if (project.location) facts.append(el('span', '', project.location));
    if (project.year) facts.append(el('span', '', String(project.year)));
    root.append(facts);
    if (project.description) {
      const article = el('div', 'project-description');
      article.append(el('h2', '', 'Tentang Pekerjaan'), el('p', 'prose', project.description));
      root.append(article);
    }
    if (Array.isArray(project.gallery) && project.gallery.length) {
      const section = el('section', 'detail-gallery');
      section.append(el('h2', '', 'Galeri Foto'));
      const grid = el('div', 'gallery-grid');
      project.gallery.forEach((src, index) => {
        const button = el('button', 'gallery-item'); button.type = 'button';
        button.dataset.lightboxSrc = src; button.dataset.lightboxAlt = `${project.title}, foto ${index + 1}`;
        button.setAttribute('aria-label', `Perbesar foto ${index + 1}`);
        const img = el('img'); img.src = src; img.alt = button.dataset.lightboxAlt;
        img.width = 800; img.height = 600; img.loading = 'lazy'; button.append(img); grid.append(button);
      });
      section.append(grid); root.append(section);
    }
    if (/^[A-Za-z0-9_-]{10,100}$/.test(project.drive_file_id || '')) {
      const link = el('a', 'text-link', 'Lihat video proyek ↗');
      link.href = `https://drive.google.com/file/d/${project.drive_file_id}/view`;
      link.target = '_blank'; link.rel = 'noopener noreferrer'; root.append(link);
    }
    const contact = el('a', 'button button-dark', 'Diskusikan proyek serupa ↗');
    contact.href = `https://wa.me/6287833033215?text=${encodeURIComponent(`Halo, saya ingin diskusi pekerjaan custom seperti ${project.title}.`)}`;
    contact.target = '_blank'; contact.rel = 'noopener noreferrer';
    contact.style.marginTop = '35px'; root.append(contact);
  }).catch(() => {
    title.textContent = 'Proyek belum dapat dimuat';
    summary.textContent = 'Silakan coba lagi nanti atau buka halaman Portofolio.';
  });
})();
