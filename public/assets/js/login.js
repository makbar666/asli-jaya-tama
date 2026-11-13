(() => {
  const form = document.getElementById('login-form');
  const message = document.getElementById('login-message');
  const button = form.querySelector('button[type="submit"]');
  const show = (text, error = true) => {
    message.textContent = text;
    message.hidden = false;
    message.classList.toggle('is-error', error);
  };

  fetch('/api/auth', { credentials: 'same-origin', cache: 'no-store' })
    .then(response => response.ok ? response.json() : null)
    .then(data => { if (data?.authenticated) location.replace('/admin.html'); })
    .catch(() => {});

  form.addEventListener('submit', async event => {
    event.preventDefault();
    message.hidden = true;
    button.disabled = true;
    try {
      const response = await fetch('/api/auth', {
        method: 'POST', credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.elements.email.value.trim(), password: form.elements.password.value }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Tidak dapat masuk.');
      location.replace('/admin.html');
    } catch (error) {
      show(error.message || 'Koneksi gagal. Coba lagi.');
      button.disabled = false;
    }
  });
})();
