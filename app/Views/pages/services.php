<section class="page-intro"><div class="container page-intro-inner"><span class="eyebrow">PENGERJAAN SESUAI KEBUTUHAN</span><h1>Layanan Custom</h1><p>Diskusikan fungsi, ukuran, desain, bahan, dan finishing yang Anda inginkan. Lingkup pekerjaan ditentukan bersama sesuai kebutuhan proyek.</p></div></section>

<?php foreach ($services as $index => $service): ?>
  <section class="section service-detail <?= $index % 2 ? 'soft-section' : '' ?>" id="<?= e($service['slug']) ?>">
    <div class="container service-detail-grid">
      <div class="service-detail-visual media-frame">
        <?php if ($service['image']): ?>
          <img src="<?= e($service['image']) ?>" alt="Contoh pekerjaan <?= e($service['title']) ?>" width="<?= (int)($service['image_width'] ?? 760) ?>" height="<?= (int)($service['image_height'] ?? 600) ?>" loading="lazy" decoding="async">
        <?php else: ?>
          <div class="media-placeholder"><span><?= e($service['number']) ?> / <?= e(strtoupper($service['title'])) ?></span><strong>Dokumentasi<br>layanan</strong><small>Foto pekerjaan asli dapat ditambahkan melalui konfigurasi layanan.</small></div>
        <?php endif; ?>
      </div>
      <div class="service-detail-copy">
        <span class="eyebrow">LAYANAN <?= e($service['number']) ?></span>
        <h2><?= e($service['title']) ?></h2>
        <p><?= e($service['description']) ?></p>
        <h3>Contoh pekerjaan</h3>
        <ul class="rule-list"><?php foreach ($service['examples'] as $example): ?><li><?= e($example) ?></li><?php endforeach; ?></ul>
        <a class="button button-dark" href="<?= e(wa_link('Halo CV Asli Jaya Tama, saya ingin diskusi desain dan pilihan bahan untuk '.$service['title'].'.')) ?>" target="_blank" rel="noopener">Diskusi <?= e($service['title']) ?> <span aria-hidden="true">↗</span></a>
      </div>
    </div>
  </section>
<?php endforeach; ?>

<?php partial('whatsapp-cta'); ?>
