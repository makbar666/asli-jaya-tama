<?php $socialSite = config('site'); ?>
<section class="social-video-section" aria-labelledby="social-video-title">
  <div class="container social-video-inner">
    <div>
      <span class="eyebrow">DOKUMENTASI LAINNYA</span>
      <h2 id="social-video-title"><?= e($heading ?? 'Lihat Video Pengerjaan Kami') ?></h2>
      <p><?= e($copy ?? 'Temukan dokumentasi pekerjaan lainnya melalui akun media sosial CV Asli Jaya Tama.') ?></p>
    </div>
    <div class="social-video-links">
      <a class="button button-outline" href="<?= e($socialSite['instagram_url']) ?>" target="_blank" rel="noopener noreferrer">Lihat di Instagram <span aria-hidden="true">↗</span></a>
      <?php if (!empty($socialSite['tiktok_url'])): ?><a class="button button-outline" href="<?= e($socialSite['tiktok_url']) ?>" target="_blank" rel="noopener noreferrer">Lihat di TikTok <span aria-hidden="true">↗</span></a><?php endif; ?>
    </div>
  </div>
</section>
