(() => {
  const form = document.getElementById('inquiry-form');
  if (!form) return;
  const error = document.getElementById('form-error');
  form.addEventListener('submit', event => {
    event.preventDefault();
    const name = form.elements.nama.value.trim();
    const phone = form.elements.nomor.value.trim();
    const service = form.elements.layanan.value;
    const details = form.elements.kebutuhan.value.trim();
    const fail = (message, element) => { error.textContent = message; error.hidden = false; element.focus(); };
    if (name.length < 2 || name.length > 80) return fail('Masukkan nama 2–80 karakter.', form.elements.nama);
    if (!/^\+?[0-9\s()-]{9,20}$/.test(phone) || phone.replace(/\D/g, '').length < 9) return fail('Masukkan nomor WhatsApp yang valid.', form.elements.nomor);
    if (![...form.elements.layanan.options].some(option => option.value === service && service)) return fail('Pilih jenis layanan.', form.elements.layanan);
    if (details.length < 10 || details.length > 1500) return fail('Jelaskan kebutuhan proyek dalam 10–1500 karakter.', form.elements.kebutuhan);
    error.hidden = true;
    const message = `Halo CV Asli Jaya Tama, saya ingin konsultasi proyek.\n\nNama: ${name}\nNomor WhatsApp: ${phone}\nJenis layanan: ${service}\nKebutuhan proyek: ${details}`;
    const destination = `https://wa.me/6287833033215?text=${encodeURIComponent(message)}`;
    const opened = window.open(destination, '_blank', 'noopener,noreferrer');
    if (!opened) window.location.href = destination;
  });
})();
