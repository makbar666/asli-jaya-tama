(() => {
  const main = document.getElementById('admin-main');
  const loading = document.getElementById('admin-loading');
  const list = document.getElementById('content-list');
  const message = document.getElementById('admin-message');
  const editor = document.getElementById('editor-backdrop');
  const editorMessage = document.getElementById('editor-message');
  const form = document.getElementById('content-form');
  const deleteButton = document.getElementById('delete-button');
  const uploadFile = document.getElementById('drive-upload-file');
  const uploadButton = document.getElementById('drive-upload-button');
  const uploadCancel = document.getElementById('drive-upload-cancel');
  const uploadProgress = document.getElementById('drive-upload-progress');
  const uploadStatus = document.getElementById('drive-upload-status');
  const labels = {
    project: ['Proyek', 'Kelola informasi proyek custom dan galeri fotonya.'],
    photo: ['Foto', 'Kelola foto hasil pekerjaan yang tampil di Beranda dan Portofolio.'],
    video: ['Video', 'Kelola dokumentasi video dari Google Drive.'],
  };
  let activeType = 'project';
  let fallback = [];
  let databaseItems = [];
  let editing = null;
  let returnFocus = null;
  let slugTouched = false;
  let driveConfig = null;
  let uploadController = null;

  const keyOf = item => `${item.type}:${item.slug}`;
  const fallbackKeys = new Set();
  const show = (element, text, error = false) => {
    element.textContent = text;
    element.hidden = false;
    element.classList.toggle('is-error', error);
  };
  const api = async (url, options = {}) => {
    const response = await fetch(url, { credentials: 'same-origin', cache: 'no-store', ...options });
    const data = await response.json().catch(() => ({}));
    if (response.status === 401) { location.replace('/login.html'); throw new Error('Sesi berakhir.'); }
    if (!response.ok) throw new Error(data.error || 'Permintaan gagal.');
    return data;
  };
  const merged = () => {
    const map = new Map(fallback.map(item => [keyOf(item), { ...item, source: 'static' }]));
    for (const item of databaseItems) {
      const base = map.get(keyOf(item));
      map.set(keyOf(item), { ...base, ...item, title: item.title || base?.title || '', media_url: item.media_url || base?.media_url || '', source: base ? 'static' : 'database' });
    }
    return [...map.values()].sort((a, b) => (a.sort_order ?? 100) - (b.sort_order ?? 100) || a.title.localeCompare(b.title, 'id'));
  };

  async function load() {
    const [staticResponse, dbResponse] = await Promise.all([
      fetch('/content-fallback.json', { cache: 'no-store' }),
      api('/api/content?admin=1'),
    ]);
    if (!staticResponse.ok) throw new Error('Konten awal situs tidak dapat dimuat.');
    fallback = await staticResponse.json();
    fallbackKeys.clear();
    fallback.forEach(item => fallbackKeys.add(keyOf(item)));
    databaseItems = dbResponse.items || [];
    render();
  }

  async function loadDriveConfig() {
    try {
      driveConfig = await api('/api/drive-config');
      uploadStatus.textContent = driveConfig.enabled
        ? 'Pilih file video, lalu hubungkan akun Google yang dapat mengunggah ke folder proyek.'
        : 'Upload langsung belum aktif. Tambahkan Google OAuth Client ID di Vercel, atau tempel link Drive di atas.';
    } catch {
      uploadStatus.textContent = 'Upload langsung belum tersedia. Anda tetap dapat menempel link Drive di atas.';
    }
    uploadButton.disabled = !driveConfig?.enabled;
  }

  function render() {
    const items = merged().filter(item => item.type === activeType);
    list.replaceChildren();
    if (!items.length) {
      const empty = document.createElement('p');
      empty.className = 'admin-empty';
      empty.textContent = 'Belum ada konten. Pilih “Tambah konten” untuk memulai.';
      list.append(empty);
      return;
    }
    for (const item of items) {
      const row = document.createElement('article'); row.className = 'admin-row';
      if (item.media_url) {
        const img = document.createElement('img'); img.className = 'admin-row-image'; img.src = item.media_url; img.alt = ''; img.loading = 'lazy'; row.append(img);
      } else {
        const box = document.createElement('div'); box.className = 'admin-row-image is-empty'; box.textContent = 'Tanpa foto'; row.append(box);
      }
      const info = document.createElement('div');
      const title = document.createElement('h2'); title.textContent = item.title || item.slug;
      const detail = document.createElement('p'); detail.textContent = `${item.category || 'Tanpa kategori'} · ${item.slug}`;
      const meta = document.createElement('div'); meta.className = 'admin-row-meta';
      const status = document.createElement('span'); status.className = `admin-badge${item.status === 'hidden' ? ' is-hidden' : ''}`;
      status.textContent = { published: 'Tayang', draft: 'Draf', hidden: 'Disembunyikan' }[item.status] || item.status;
      const source = document.createElement('span'); source.className = 'admin-badge'; source.textContent = item.source === 'static' ? 'Konten awal' : 'CMS';
      meta.append(status, source); info.append(title, detail, meta); row.append(info);
      const edit = document.createElement('button'); edit.type = 'button'; edit.textContent = 'Edit ↗'; edit.dataset.key = keyOf(item); row.append(edit);
      list.append(row);
    }
  }

  function fieldsFor(type) {
    for (const holder of form.querySelectorAll('[data-field]')) {
      const field = holder.dataset.field;
      const visible = field === 'description' || (field === 'alt' && type === 'photo') ||
        (field === 'gallery' && type === 'project') ||
        (['drive', 'upload'].includes(field) && type === 'video') ||
        (['location', 'year'].includes(field) && type === 'project') ||
        (['width', 'height'].includes(field) && type === 'photo') ||
        (field === 'order' && type !== 'video');
      holder.hidden = !visible;
    }
    form.elements.alt_text.required = type === 'photo';
    form.elements.drive_url.required = type === 'video';
  }

  function openEditor(item = null) {
    returnFocus = document.activeElement;
    editing = item;
    slugTouched = Boolean(item);
    form.reset();
    uploadProgress.hidden = true;
    uploadProgress.value = 0;
    uploadFile.value = '';
    form.elements.id.value = item?.id || '';
    form.elements.type.value = activeType;
    for (const name of ['title', 'slug', 'category', 'media_url', 'alt_text', 'description', 'location', 'year', 'image_width', 'image_height', 'sort_order', 'status']) {
      if (item?.[name] !== undefined && item[name] !== null) form.elements[name].value = item[name];
    }
    form.elements.drive_url.value = item?.drive_file_id ? `https://drive.google.com/file/d/${item.drive_file_id}/view` : '';
    form.elements.gallery.value = Array.isArray(item?.gallery) ? item.gallery.join('\n') : '';
    form.elements.featured.checked = Boolean(item?.featured);
    if (!item) { form.elements.status.value = 'published'; form.elements.sort_order.value = '100'; }
    form.elements.slug.readOnly = Boolean(item && fallbackKeys.has(keyOf(item)));
    deleteButton.hidden = !item;
    deleteButton.textContent = item && fallbackKeys.has(keyOf(item)) ? (item.status === 'hidden' ? 'Pulihkan' : 'Sembunyikan') : 'Hapus';
    fieldsFor(activeType);
    document.getElementById('editor-title').textContent = `${item ? 'Edit' : 'Tambah'} ${labels[activeType][0].toLowerCase()}`;
    editorMessage.hidden = true;
    editor.hidden = false;
    document.body.style.overflow = 'hidden';
    form.elements.title.focus();
  }

  function closeEditor() {
    if (uploadController) { show(editorMessage, 'Batalkan unggahan sebelum menutup editor.', true); return; }
    editor.hidden = true;
    document.body.style.overflow = '';
    editing = null;
    returnFocus?.focus();
  }

  function formData() {
    return {
      id: form.elements.id.value || undefined,
      type: activeType,
      title: form.elements.title.value.trim(),
      slug: form.elements.slug.value.trim(),
      category: form.elements.category.value.trim(),
      media_url: form.elements.media_url.value.trim(),
      alt_text: form.elements.alt_text.value.trim() || form.elements.title.value.trim(),
      description: form.elements.description.value.trim(),
      gallery: form.elements.gallery.value.split(/\r?\n/).map(url => url.trim()).filter(Boolean),
      drive_url: form.elements.drive_url.value.trim(),
      location: form.elements.location.value.trim(),
      year: form.elements.year.value,
      image_width: form.elements.image_width.value,
      image_height: form.elements.image_height.value,
      featured: form.elements.featured.checked,
      status: form.elements.status.value,
      sort_order: form.elements.sort_order.value,
    };
  }

  document.querySelectorAll('.admin-tab').forEach(tab => tab.addEventListener('click', () => {
    activeType = tab.dataset.type;
    document.querySelectorAll('.admin-tab').forEach(button => {
      const active = button === tab;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-pressed', String(active));
    });
    document.getElementById('section-title').textContent = labels[activeType][0];
    document.getElementById('section-copy').textContent = labels[activeType][1];
    render();
  }));
  document.getElementById('new-button').addEventListener('click', () => openEditor());
  list.addEventListener('click', event => {
    const button = event.target.closest('[data-key]');
    if (button) openEditor(merged().find(item => keyOf(item) === button.dataset.key));
  });
  form.elements.title.addEventListener('input', () => {
    if (!slugTouched) form.elements.slug.value = form.elements.title.value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 100);
  });
  form.elements.slug.addEventListener('input', () => { slugTouched = true; });
  document.getElementById('editor-close').addEventListener('click', closeEditor);
  document.getElementById('cancel-button').addEventListener('click', closeEditor);
  editor.addEventListener('click', event => { if (event.target === editor) closeEditor(); });
  document.addEventListener('keydown', event => { if (event.key === 'Escape' && !editor.hidden) closeEditor(); });

  uploadButton.addEventListener('click', async () => {
    const file = uploadFile.files?.[0];
    if (!window.AJTDriveUpload?.validVideo(file)) {
      show(editorMessage, 'Pilih file video yang tidak kosong terlebih dahulu.', true);
      return;
    }
    if (!driveConfig?.enabled || uploadController) return;
    editorMessage.hidden = true;
    uploadController = new AbortController();
    uploadButton.disabled = true;
    uploadFile.disabled = true;
    uploadCancel.hidden = false;
    uploadProgress.hidden = false;
    uploadProgress.value = 0;
    uploadStatus.textContent = 'Menghubungkan akun Google...';
    try {
      // Start the OAuth popup in the click event, before any awaited network work.
      const tokenPromise = window.AJTDriveUpload.authorize(driveConfig.clientId);
      const token = await tokenPromise;
      uploadStatus.textContent = 'Mengunggah video langsung ke Google Drive...';
      const result = await window.AJTDriveUpload.upload(file, {
        token, folderId: driveConfig.folderId, signal: uploadController.signal,
        onProgress: percent => {
          uploadProgress.value = percent;
          uploadStatus.textContent = `Mengunggah video ke Google Drive: ${percent}%`;
        },
      });
      form.elements.drive_url.value = result.url;
      if (!form.elements.media_url.value.trim()) form.elements.media_url.value = `https://drive.google.com/thumbnail?id=${result.id}&sz=w800`;
      if (!form.elements.title.value.trim()) form.elements.title.value = file.name.replace(/\.[^.]+$/, '').replace(/[_-]+/g, ' ').trim();
      if (!form.elements.category.value.trim()) form.elements.category.value = 'Dokumentasi Proyek';
      if (!editing) {
        const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(result.id));
        const suffix = [...new Uint8Array(digest)].map(byte => byte.toString(16).padStart(2, '0')).join('').slice(0, 12);
        form.elements.slug.value = `drive-${suffix}`;
        form.elements.slug.readOnly = true;
        slugTouched = true;
      }
      if (!result.shared) {
        form.elements.status.value = 'draft';
        uploadStatus.textContent = 'Video tersimpan di Drive. Akses publik belum dapat diatur otomatis; periksa izin berbagi sebelum menayangkan.';
      } else {
        uploadStatus.textContent = 'Video tersimpan di Drive. Periksa data lalu tekan Simpan konten untuk menayangkan.';
      }
      uploadFile.value = '';
    } catch (error) {
      const cancelled = error.name === 'AbortError';
      uploadStatus.textContent = cancelled ? 'Unggahan dibatalkan.' : error.message;
      if (!cancelled) show(editorMessage, error.message, true);
    } finally {
      uploadController = null;
      uploadCancel.hidden = true;
      uploadFile.disabled = false;
      uploadButton.disabled = !driveConfig?.enabled;
    }
  });
  uploadCancel.addEventListener('click', () => uploadController?.abort());

  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (uploadController) { show(editorMessage, 'Tunggu sampai unggahan selesai atau batalkan terlebih dahulu.', true); return; }
    editorMessage.hidden = true;
    const saveButton = form.querySelector('[type="submit"]');
    saveButton.disabled = true;
    try {
      await api('/api/content', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formData()) });
      await load();
      closeEditor();
      show(message, 'Konten berhasil disimpan.');
    } catch (error) { show(editorMessage, error.message, true); }
    finally { saveButton.disabled = false; }
  });

  deleteButton.addEventListener('click', async () => {
    if (!editing) return;
    const isStatic = fallbackKeys.has(keyOf(editing));
    const restoring = isStatic && editing.status === 'hidden';
    if (!restoring && !confirm(isStatic ? 'Sembunyikan konten ini dari situs?' : 'Hapus konten ini secara permanen?')) return;
    deleteButton.disabled = true;
    try {
      if (isStatic) {
        const source = fallback.find(item => keyOf(item) === keyOf(editing));
        await api('/api/content', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...source, id: editing.id || undefined, status: restoring ? 'published' : 'hidden' }) });
      } else {
        await api(`/api/content?id=${encodeURIComponent(editing.id)}`, { method: 'DELETE' });
      }
      await load(); closeEditor(); show(message, restoring ? 'Konten dipulihkan.' : 'Konten diperbarui.');
    } catch (error) { show(editorMessage, error.message, true); }
    finally { deleteButton.disabled = false; }
  });

  document.getElementById('logout-button').addEventListener('click', async () => {
    try { await api('/api/auth', { method: 'DELETE' }); } finally { location.replace('/login.html'); }
  });

  api('/api/auth').then(async data => {
    if (!data.authenticated) { location.replace('/login.html'); return; }
    document.getElementById('admin-email').textContent = data.email;
    await Promise.all([load(), loadDriveConfig()]);
    main.hidden = false;
    loading.hidden = true;
  }).catch(error => { loading.textContent = error.message || 'CMS tidak dapat dimuat.'; });
})();
