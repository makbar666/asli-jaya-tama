<?php $href = '/portofolio/' . rawurlencode($project['slug']); ?>
<article class="project-card" data-category="<?= e($project['category']) ?>"><a href="<?= e($href) ?>" aria-label="Lihat proyek <?= e($project['title']) ?>">
  <div class="project-image media-frame"><?php if (!empty($project['cover'])): ?><img src="<?= e($project['cover']) ?>" alt="<?= e($project['title']) ?>" width="720" height="540" loading="lazy"><?php else: ?><span>Dokumentasi proyek</span><?php endif; ?></div>
  <div class="project-meta"><span><?= e($project['category']) ?></span><?php if (!empty($project['location'])): ?><span><?= e($project['location']) ?></span><?php endif; ?></div><h3><?= e($project['title']) ?></h3><span class="text-link">Lihat proyek <span aria-hidden="true">↗</span></span>
</a></article>
