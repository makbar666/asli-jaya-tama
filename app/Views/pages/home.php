<section class="hero">
  <div class="container hero-grid">
    <div class="hero-copy">
      <span class="eyebrow">CV ASLI JAYA TAMA</span>
      <h1>Solusi Furniture, Interior &amp; Eksterior untuk Kebutuhan Ruang Anda</h1>
      <p>Kami menghadirkan layanan furniture custom, interior, eksterior, serta pekerjaan rumah dan bangunan dengan perhatian pada fungsi, detail, dan kualitas pengerjaan.</p>
      <div class="action-row"><a class="button button-dark" href="/portofolio">Lihat Portofolio <span aria-hidden="true">↗</span></a><a class="button button-outline" href="<?= e(wa_link('Halo, saya ingin konsultasi proyek.')) ?>" target="_blank" rel="noopener">Konsultasi Proyek</a></div>
    </div>
    <?php if (!empty($site['hero_gallery'])): ?>
      <div class="hero-visual hero-photo-stack" role="group" aria-label="Dokumentasi foto pekerjaan CV Asli Jaya Tama">
        <?php foreach ($site['hero_gallery'] as $index => $photo): ?>
          <?php $position = ['far-left', 'left', 'center', 'right', 'far-right'][$index] ?? 'far-right'; ?>
          <button class="hero-photo-card" type="button" data-position="<?= $position ?>" aria-label="Tampilkan foto <?= $index + 1 ?>: <?= e($photo['alt']) ?>" aria-pressed="<?= $index === 2 ? 'true' : 'false' ?>"><img src="<?= e($photo['src']) ?>" alt="" width="<?= (int) $photo['width'] ?>" height="<?= (int) $photo['height'] ?>" <?= $index === 2 ? 'fetchpriority="high"' : 'decoding="async"' ?>></button>
        <?php endforeach; ?>
      </div>
    <?php else: ?>
      <div class="hero-visual media-frame"><?php if ($site['hero_image']): ?><img src="<?= e($site['hero_image']) ?>" alt="Dokumentasi pekerjaan <?= e($site['company']) ?>" width="920" height="740" fetchpriority="high"><?php else: ?><div class="media-placeholder"><span>01 / DOKUMENTASI</span><strong>Ruang untuk karya<br>yang sesungguhnya.</strong><small>Foto proyek asli dapat ditambahkan melalui konfigurasi situs.</small></div><?php endif; ?></div>
    <?php endif; ?>
  </div>
</section>

<section class="section intro-section"><div class="container intro-grid"><div class="intro-visual media-frame"><?php if ($site['about_image']): ?><img src="<?= e($site['about_image']) ?>" alt="Detail hasil pengerjaan <?= e($site['company']) ?>" width="760" height="700" loading="lazy"><?php else: ?><div class="media-placeholder media-placeholder-light"><span>DETAIL PENGERJAAN</span><strong>Fungsi. Material.<br>Finishing.</strong></div><?php endif; ?></div><div class="intro-copy"><span class="eyebrow">TENTANG KAMI</span><h2>Mengenal CV Asli Jaya Tama</h2><p>Asli Jaya Interior menangani kebutuhan furniture custom, pengerjaan interior dan eksterior, serta pekerjaan rumah dan bangunan. Setiap kebutuhan ruang dibicarakan dari fungsi, ukuran, pilihan material, hingga hasil akhir yang diharapkan.</p><p>Kami percaya hasil yang baik berawal dari pemahaman yang jelas terhadap kebutuhan pengguna ruang dan perhatian pada detail pengerjaan.</p><a class="text-link" href="/tentang-kami">Selengkapnya tentang kami <span aria-hidden="true">↗</span></a></div></div></section>

<section class="section services-section"><div class="container"><div class="section-heading"><div><span class="eyebrow">APA YANG KAMI KERJAKAN</span><h2>Layanan Kami</h2></div><p>Layanan yang dapat disesuaikan dengan kebutuhan ruang dan lingkup proyek Anda.</p></div><div class="service-list"><?php foreach ($services as $service): ?><a class="service-row" href="/layanan#<?= e($service['slug']) ?>"><span class="service-number"><?= e($service['number']) ?></span><h3><?= e($service['title']) ?></h3><p><?= e($service['summary']) ?></p><span class="arrow" aria-hidden="true">↗</span></a><?php endforeach; ?></div></div></section>

<section class="section projects-section"><div class="container"><div class="section-heading"><div><span class="eyebrow">DOKUMENTASI KAMI</span><h2>Hasil Pekerjaan Kami</h2></div><a class="text-link" href="/portofolio">Lihat Semua Proyek <span aria-hidden="true">↗</span></a></div><?php if ($projects): ?><div class="project-grid"><?php foreach ($projects as $project) partial('project-card',['project'=>$project]); ?></div><?php else: ?><div class="empty-feature"><div class="empty-feature-art" aria-hidden="true"><span></span><span></span><span></span></div><div><span class="eyebrow">PORTOFOLIO</span><h3>Dokumentasi proyek sedang disiapkan.</h3><p>Foto dan keterangan pekerjaan asli akan tampil di sini setelah ditambahkan ke daftar proyek.</p><a class="text-link" href="/kontak">Diskusikan kebutuhan Anda <span aria-hidden="true">↗</span></a></div></div><?php endif; ?></div></section>

<section class="section videos-section"><div class="container"><div class="section-heading"><div><span class="eyebrow">VIDEO REVIEW</span><h2>Lihat Lebih Dekat Hasil Pengerjaan Kami</h2></div><p>Dokumentasi video untuk melihat detail, tampilan, dan hasil akhir pekerjaan CV Asli Jaya Tama.</p></div><?php if ($videos): ?><div class="video-grid"><?php foreach ($videos as $video) partial('video-card',['video'=>$video]); ?></div><?php else: ?><div class="empty-inline"><p>Video dokumentasi akan ditampilkan setelah tautan Google Drive dan thumbnail asli tersedia.</p></div><?php endif; ?><a class="text-link section-end-link" href="/video-review">Lihat Semua Video <span aria-hidden="true">↗</span></a></div></section>

<section class="section process-section"><div class="container"><span class="eyebrow">DARI KEBUTUHAN KE HASIL AKHIR</span><h2>Alur Pengerjaan</h2><p class="process-note">Gambaran awal proses; tahapan dapat disesuaikan dengan kebutuhan proyek.</p><div class="process-grid"><?php foreach (['Konsultasi Kebutuhan','Diskusi Desain & Penawaran','Proses Pengerjaan','Pemeriksaan & Penyelesaian'] as $i=>$step): ?><div class="process-step"><span>0<?= $i+1 ?></span><h3><?= e($step) ?></h3></div><?php endforeach; ?></div></div></section>
<?php partial('whatsapp-cta'); ?>
