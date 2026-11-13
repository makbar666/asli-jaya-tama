<section class="page-intro"><div class="container page-intro-inner"><span class="eyebrow">MULAI DARI KEBUTUHAN ANDA</span><h1>Kontak</h1><p>Ceritakan rencana pengerjaan custom Anda, termasuk desain, ukuran, atau bahan yang sudah dipertimbangkan.</p></div></section>

<section class="section"><div class="container contact-grid">
  <div class="contact-details">
    <span class="eyebrow">HUBUNGI KAMI</span>
    <h2>Mari diskusikan pekerjaan custom Anda.</h2>
    <p>Belum menentukan desain atau bahan? Ceritakan dulu fungsi dan ukuran ruangnya. Kami dapat dihubungi melalui WhatsApp untuk diskusi awal.</p>
    <dl>
      <div><dt>Perusahaan</dt><dd><?= e($site['company']) ?></dd></div>
      <div><dt>WhatsApp</dt><dd><a href="<?= e(wa_link()) ?>" target="_blank" rel="noopener"><?= e($site['whatsapp_display']) ?> ↗</a></dd></div>
      <div><dt>Instagram</dt><dd><a href="<?= e($site['instagram_url']) ?>" target="_blank" rel="noopener"><?= e($site['instagram_handle']) ?> ↗</a></dd></div>
      <div><dt>Tautan resmi</dt><dd><a href="<?= e($site['official_url']) ?>" target="_blank" rel="noopener">lynk.id/ajt_official ↗</a></dd></div>
    </dl>
  </div>

  <div class="contact-form-wrap">
    <h2>Ceritakan Kebutuhan Custom Anda</h2>
    <p>Formulir ini menyusun pesan lalu membuka WhatsApp. Informasi tidak disimpan di situs.</p>
    <form id="inquiry-form" novalidate>
      <label for="nama">Nama <span>*</span></label>
      <input id="nama" name="nama" type="text" autocomplete="name" maxlength="80" required>

      <label for="nomor">Nomor WhatsApp <span>*</span></label>
      <input id="nomor" name="nomor" type="tel" autocomplete="tel" inputmode="tel" maxlength="20" required>

      <label for="layanan">Jenis pengerjaan <span>*</span></label>
      <select id="layanan" name="layanan" required><option value="">Pilih jenis pengerjaan</option><?php foreach ($services as $service): ?><option value="<?= e($service['title']) ?>"><?= e($service['title']) ?></option><?php endforeach; ?></select>

      <label for="kebutuhan">Kebutuhan, ukuran, atau referensi desain <span>*</span></label>
      <textarea id="kebutuhan" name="kebutuhan" rows="5" maxlength="1500" placeholder="Contoh: lemari custom untuk kamar, ukuran perkiraan 2 x 2,5 meter" required></textarea>

      <label for="bahan">Pilihan bahan atau finishing (opsional)</label>
      <input id="bahan" name="bahan" type="text" maxlength="200" placeholder="Boleh dikosongkan jika ingin diskusi dulu">

      <p class="form-error" id="form-error" role="alert" hidden></p>
      <button class="button button-dark" type="submit">Diskusi via WhatsApp <span aria-hidden="true">↗</span></button>
      <p class="privacy-note">Informasi yang Anda isi hanya digunakan untuk menyusun pesan di perangkat Anda dan tidak disimpan di situs ini.</p>
    </form>
  </div>
</div></section>
