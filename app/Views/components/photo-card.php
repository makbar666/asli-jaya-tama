<article class="photo-card" data-category="<?= e($photo['category']) ?>">
  <button class="photo-trigger" type="button" data-lightbox-src="<?= e($photo['src']) ?>" data-lightbox-alt="<?= e($photo['alt']) ?>" aria-label="Perbesar foto: <?= e($photo['title']) ?>">
    <span class="photo-image"><img src="<?= e($photo['src']) ?>" alt="<?= e($photo['alt']) ?>" width="<?= (int) $photo['width'] ?>" height="<?= (int) $photo['height'] ?>" loading="lazy" decoding="async"></span>
    <span class="photo-category"><?= e($photo['category']) ?></span>
    <span class="photo-title"><?= e($photo['title']) ?></span>
    <span class="photo-view">Perbesar foto <span aria-hidden="true">↗</span></span>
  </button>
</article>
