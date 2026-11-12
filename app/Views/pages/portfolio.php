<section class="page-intro"><div class="container page-intro-inner"><span class="eyebrow">HASIL PEKERJAAN</span><h1>Portofolio</h1><p>Dokumentasi foto pekerjaan CV Asli Jaya Tama. Pilih kategori untuk melihat detail yang sesuai kebutuhan Anda.</p></div></section>
<section class="section"><div class="container">
  <?php if ($projects): ?>
    <?php $categories = array_values(array_unique(array_map(fn($p) => $p['category'], $projects))); ?>
    <div class="filter-bar" data-filter-target="projects" aria-label="Filter kategori proyek"><button class="filter-button is-active" type="button" data-filter="all" aria-pressed="true">Semua</button><?php foreach ($categories as $category): ?><button class="filter-button" type="button" data-filter="<?= e($category) ?>" aria-pressed="false"><?= e($category) ?></button><?php endforeach; ?></div>
    <div class="project-grid portfolio-projects" id="projects"><?php foreach ($projects as $project) partial('project-card', ['project' => $project]); ?></div>
    <p class="filter-empty" hidden>Tidak ada proyek dalam kategori ini.</p>
  <?php endif; ?>
  <?php if ($photos): ?>
    <?php if ($projects): ?><h2 class="portfolio-photos-heading">Dokumentasi Foto</h2><?php endif; ?>
    <p class="photo-section-intro">Foto pekerjaan yang dapat dilihat lebih dekat. Ketuk foto untuk memperbesar tampilannya.</p>
    <?php $photoCategories = array_values(array_unique(array_map(fn($p) => $p['category'], $photos))); ?>
    <div class="filter-bar" data-filter-target="photos" aria-label="Filter kategori foto"><button class="filter-button is-active" type="button" data-filter="all" aria-pressed="true">Semua</button><?php foreach ($photoCategories as $category): ?><button class="filter-button" type="button" data-filter="<?= e($category) ?>" aria-pressed="false"><?= e($category) ?></button><?php endforeach; ?></div>
    <div class="photo-grid portfolio-photos" id="photos"><?php foreach ($photos as $photo) partial('photo-card', ['photo' => $photo]); ?></div>
    <p class="filter-empty" hidden>Tidak ada foto dalam kategori ini.</p>
  <?php elseif (!$projects): ?>
    <div class="empty-page"><span class="eyebrow">DOKUMENTASI PROYEK</span><h2>Portofolio sedang dipersiapkan.</h2><p>Foto dan informasi pekerjaan akan ditampilkan di sini setelah tersedia.</p><a class="button button-dark" href="<?= e(wa_link('Halo, saya ingin melihat contoh pekerjaan dan konsultasi proyek.')) ?>" target="_blank" rel="noopener">Tanya via WhatsApp <span aria-hidden="true">↗</span></a></div>
  <?php endif; ?>
</div></section>
<?php partial('social-video-cta', ['heading' => 'Lihat Video Pengerjaan Kami', 'copy' => 'Ingin melihat detail pekerjaan dalam video? Kunjungi Instagram atau TikTok resmi kami.']); ?>
<?php partial('whatsapp-cta'); ?>
