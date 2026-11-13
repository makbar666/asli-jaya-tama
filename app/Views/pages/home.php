<section class="hero">
  <div class="container hero-grid">
    <div class="hero-copy">
      <span class="eyebrow">CV ASLI JAYA TAMA</span>
      <h1>Furniture dan Elemen Ruang Custom, Dibuat Sesuai Kebutuhan Anda</h1>
      <p>Dari pembahasan desain dan ukuran hingga pilihan bahan dan finishing, kami membantu mewujudkan pengerjaan custom yang sesuai dengan fungsi serta karakter ruang Anda.</p>
      <div class="action-row"><a class="button button-dark" href="/portofolio">Lihat Hasil Pekerjaan <span aria-hidden="true">↗</span></a><a class="button button-outline" href="<?= e(wa_link('Halo, saya ingin diskusi desain dan pilihan bahan untuk pengerjaan custom.')) ?>" target="_blank" rel="noopener">Diskusi Kebutuhan Custom</a></div>
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

<section class="section intro-section"><div class="container intro-grid"><div class="intro-visual media-frame"><?php if ($site['about_image']): ?><img src="<?= e($site['about_image']) ?>" alt="Panel kayu dan partisi interior di area tangga" width="1200" height="1600" loading="lazy" decoding="async"><?php else: ?><div class="media-placeholder media-placeholder-light"><span>DETAIL PENGERJAAN</span><strong>Fungsi. Bahan.<br>Finishing.</strong></div><?php endif; ?></div><div class="intro-copy"><span class="eyebrow">TENTANG KAMI</span><h2>Pengerjaan Custom Berawal dari Kebutuhan Anda</h2><p>CV Asli Jaya Tama mengerjakan furniture dan elemen ruang custom, dengan layanan terkait interior, eksterior, serta rumah dan bangunan sesuai lingkup proyek.</p><p>Setiap pesanan dibahas dari fungsi dan ukuran ruang, lalu desain, pilihan bahan, serta finishing yang diinginkan. Dengan begitu, bentuk dan detail pekerjaan memiliki dasar yang jelas sebelum dikerjakan.</p><a class="text-link" href="/tentang-kami">Kenali cara kami bekerja <span aria-hidden="true">↗</span></a></div></div></section>

<section class="section services-section"><div class="container"><div class="section-heading"><div><span class="eyebrow">DIBUAT SESUAI KEBUTUHAN</span><h2>Fokus Pengerjaan Custom</h2></div><p>Rancangan dan bahan dibicarakan berdasarkan kebutuhan, ukuran, serta karakter tiap ruang.</p></div><div class="service-list"><?php foreach (array_filter($services, fn($service) => !empty($service['featured'])) as $service): ?><a class="service-row" href="/layanan#<?= e($service['slug']) ?>"><span class="service-number"><?= e($service['number']) ?></span><h3><?= e($service['title']) ?></h3><p><?= e($service['summary']) ?></p><span class="arrow" aria-hidden="true">↗</span></a><?php endforeach; ?></div><a class="text-link section-end-link" href="/layanan">Lihat semua layanan <span aria-hidden="true">↗</span></a></div></section>

<section class="section projects-section">
  <div class="container">
    <div class="section-heading">
      <div><span class="eyebrow">DOKUMENTASI KAMI</span><h2>Hasil Pekerjaan Kami</h2></div>
      <a class="text-link" href="/portofolio">Lihat Semua Foto <span aria-hidden="true">↗</span></a>
    </div>
    <?php if ($projects): ?>
      <div class="project-grid portfolio-projects"><?php foreach ($projects as $project) partial('project-card', ['project' => $project]); ?></div>
    <?php endif; ?>
    <?php if ($photos): ?>
      <?php if ($projects): ?><h3 class="portfolio-photos-heading">Dokumentasi Foto</h3><?php endif; ?>
      <div class="photo-grid portfolio-photos"><?php foreach ($photos as $photo) partial('photo-card', ['photo' => $photo]); ?></div>
    <?php elseif (!$projects): ?>
      <div class="empty-inline"><p>Dokumentasi foto pekerjaan akan ditampilkan setelah foto asli ditambahkan.</p></div>
    <?php endif; ?>
  </div>
</section>

<section class="section videos-section"><div class="container"><div class="section-heading"><div><span class="eyebrow">VIDEO REVIEW</span><h2>Lihat Lebih Dekat Hasil Pengerjaan Kami</h2></div><p>Dokumentasi video untuk melihat detail, tampilan, dan hasil akhir pekerjaan CV Asli Jaya Tama.</p></div><?php if ($videos): ?><div class="video-grid"><?php foreach ($videos as $video) partial('video-card',['video'=>$video]); ?></div><?php else: ?><div class="empty-inline"><p>Video dokumentasi akan ditampilkan setelah tautan Google Drive dan thumbnail asli tersedia.</p></div><?php endif; ?><a class="text-link section-end-link" href="/video-review">Lihat Semua Video <span aria-hidden="true">↗</span></a></div></section>

<section class="section process-section"><div class="container"><span class="eyebrow">DARI IDE KE HASIL AKHIR</span><h2>Alur Pengerjaan Custom</h2><p class="process-note">Desain, bahan, dan lingkup pekerjaan dibahas sesuai kebutuhan masing-masing proyek.</p><div class="process-grid"><?php foreach (['Kebutuhan & Ukuran','Diskusi Desain','Pilihan Bahan & Penawaran','Pengerjaan & Pemeriksaan'] as $i=>$step): ?><div class="process-step"><span>0<?= $i+1 ?></span><h3><?= e($step) ?></h3></div><?php endforeach; ?></div></div></section>
<?php partial('whatsapp-cta'); ?>
