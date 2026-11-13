(() => {
  const scope = 'https://www.googleapis.com/auth/drive';
  const idPattern = /^[A-Za-z0-9_-]{10,100}$/;
  const videoExtension = /\.(mp4|mov|m4v|webm|mkv|avi|3gp)$/i;
  let tokenValue = '';
  let tokenExpiresAt = 0;

  function validVideo(file) {
    return file instanceof File && file.size > 0 && (file.type.startsWith('video/') || videoExtension.test(file.name));
  }

  function authorize(clientId) {
    if (tokenValue && Date.now() < tokenExpiresAt - 60_000) return Promise.resolve(tokenValue);
    if (!window.google?.accounts?.oauth2) throw new Error('Layanan login Google belum siap. Muat ulang halaman lalu coba lagi.');
    return new Promise((resolve, reject) => {
      const tokenClient = google.accounts.oauth2.initTokenClient({
        client_id: clientId, scope,
        callback: response => {
          if (response.error || !response.access_token) {
            reject(new Error('Akses Google Drive tidak diberikan.'));
            return;
          }
          tokenValue = response.access_token;
          tokenExpiresAt = Date.now() + (Number(response.expires_in) || 3600) * 1000;
          resolve(tokenValue);
        },
        error_callback: () => reject(new Error('Jendela Google ditutup atau gagal dibuka.')),
      });
      tokenClient.requestAccessToken({ prompt: 'select_account' });
    });
  }

  async function googleRequest(url, token, options = {}) {
    const response = await fetch(url, {
      ...options,
      headers: { Authorization: `Bearer ${token}`, ...options.headers },
    });
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data.error?.message || `Google Drive menolak permintaan (${response.status}).`);
    }
    return response;
  }

  function requestRange(sessionUrl, file, token, start, signal, onProgress) {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('PUT', sessionUrl);
      xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      xhr.setRequestHeader('Content-Range', `bytes ${start}-${file.size - 1}/${file.size}`);
      xhr.setRequestHeader('Content-Type', file.type || 'application/octet-stream');
      xhr.upload.onprogress = event => {
        if (event.lengthComputable) onProgress(Math.min(99, Math.round((start + event.loaded) / file.size * 100)));
      };
      xhr.onload = () => {
        if (xhr.status === 200 || xhr.status === 201) {
          try { resolve({ done: true, file: JSON.parse(xhr.responseText) }); }
          catch { reject(new Error('Google Drive tidak mengembalikan ID file.')); }
        } else if (xhr.status === 308) {
          const range = /bytes=0-(\d+)/.exec(xhr.getResponseHeader('Range') || '');
          resolve({ done: false, next: range ? Number(range[1]) + 1 : 0 });
        } else reject(new Error(`Unggahan ditolak Google Drive (${xhr.status}).`));
      };
      xhr.onerror = () => reject(new Error('Koneksi terputus saat mengunggah video.'));
      xhr.onabort = () => reject(new DOMException('Unggahan dibatalkan.', 'AbortError'));
      signal?.addEventListener('abort', () => xhr.abort(), { once: true });
      if (signal?.aborted) xhr.abort();
      else xhr.send(file.slice(start));
    });
  }

  function queryRange(sessionUrl, fileSize, token, signal) {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('PUT', sessionUrl);
      xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      xhr.setRequestHeader('Content-Range', `bytes */${fileSize}`);
      xhr.onload = () => {
        if (xhr.status === 200 || xhr.status === 201) {
          try { resolve({ done: true, file: JSON.parse(xhr.responseText) }); }
          catch { reject(new Error('Google Drive tidak mengembalikan ID file.')); }
        } else if (xhr.status === 308) {
          const range = /bytes=0-(\d+)/.exec(xhr.getResponseHeader('Range') || '');
          resolve({ done: false, next: range ? Number(range[1]) + 1 : 0 });
        } else reject(new Error(`Status unggahan tidak tersedia (${xhr.status}).`));
      };
      xhr.onerror = () => reject(new Error('Tidak dapat memeriksa status unggahan.'));
      xhr.onabort = () => reject(new DOMException('Unggahan dibatalkan.', 'AbortError'));
      signal?.addEventListener('abort', () => xhr.abort(), { once: true });
      if (signal?.aborted) xhr.abort();
      else xhr.send();
    });
  }

  async function upload(file, { token, folderId, signal, onProgress }) {
    if (!validVideo(file)) throw new Error('Pilih file video yang tidak kosong.');
    if (!idPattern.test(folderId)) throw new Error('Folder Google Drive belum dikonfigurasi.');

    const folder = await googleRequest(
      `https://www.googleapis.com/drive/v3/files/${folderId}?fields=id,name,mimeType,capabilities(canAddChildren)&supportsAllDrives=true`,
      token, { signal },
    ).then(response => response.json());
    if (folder.mimeType !== 'application/vnd.google-apps.folder' || !folder.capabilities?.canAddChildren) {
      throw new Error('Akun Google yang dipilih tidak memiliki akses unggah ke folder Drive ini.');
    }

    const started = await googleRequest(
      'https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable&fields=id,name,webViewLink',
      token,
      {
        method: 'POST', signal,
        headers: {
          'Content-Type': 'application/json; charset=UTF-8',
          'X-Upload-Content-Type': file.type || 'application/octet-stream',
          'X-Upload-Content-Length': String(file.size),
        },
        body: JSON.stringify({ name: file.name, mimeType: file.type || 'application/octet-stream', parents: [folderId] }),
      },
    );
    const sessionUrl = started.headers.get('Location');
    const parsedSession = sessionUrl && new URL(sessionUrl);
    if (!parsedSession || parsedSession.protocol !== 'https:' || parsedSession.hostname !== 'www.googleapis.com') {
      throw new Error('Google Drive tidak mengembalikan sesi unggah yang valid.');
    }

    let offset = 0;
    let failures = 0;
    let result;
    while (!result) {
      if (signal?.aborted) throw new DOMException('Unggahan dibatalkan.', 'AbortError');
      try {
        const response = await requestRange(sessionUrl, file, token, offset, signal, onProgress);
        if (response.done) result = response.file;
        else if (response.next > offset) { offset = response.next; failures = 0; }
        else throw new Error('Google Drive belum menerima data video.');
      } catch (error) {
        if (signal?.aborted || error.name === 'AbortError') throw error;
        if (++failures > 3) throw error;
        await new Promise(resolve => setTimeout(resolve, failures * 1000));
        const state = await queryRange(sessionUrl, file.size, token, signal);
        if (state.done) result = state.file;
        else offset = state.next;
      }
    }
    if (!idPattern.test(result.id || '')) throw new Error('Video terunggah, tetapi ID file tidak valid. Periksa Google Drive.');
    onProgress(100);

    let shared = false;
    try {
      const permissions = await googleRequest(
        `https://www.googleapis.com/drive/v3/files/${result.id}/permissions?fields=permissions(type,role)&supportsAllDrives=true`,
        token, { signal },
      ).then(response => response.json());
      shared = (permissions.permissions || []).some(permission => permission.type === 'anyone' && ['reader', 'commenter', 'writer'].includes(permission.role));
      if (!shared) {
        await googleRequest(`https://www.googleapis.com/drive/v3/files/${result.id}/permissions?sendNotificationEmail=false&supportsAllDrives=true`, token, {
          method: 'POST', signal,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: 'anyone', role: 'reader', allowFileDiscovery: false }),
        });
        shared = true;
      }
    } catch {
      // The upload succeeded. Keep its link available so the owner can adjust sharing manually.
    }
    return { id: result.id, shared, url: `https://drive.google.com/file/d/${result.id}/view` };
  }

  window.AJTDriveUpload = { authorize, upload, validVideo };
})();
