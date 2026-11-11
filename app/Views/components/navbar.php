<?php $current = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH); ?>
<header class="site-header"><div class="container nav-shell">
  <a class="brand" href="/" aria-label="Beranda <?= e($site['brand']) ?>"><?php if ($site['logo']): ?><img src="<?= e($site['logo']) ?>" alt="Logo <?= e($site['company']) ?>" width="142" height="46"><?php else: ?><span class="brand-mark">AJ</span><span class="brand-text"><strong>ASLI JAYA</strong><small>INTERIOR</small></span><?php endif; ?></a>
  <button class="menu-toggle" type="button" aria-expanded="false" aria-controls="main-nav" aria-label="Buka menu"><span></span><span></span><span></span></button>
  <nav class="main-nav" id="main-nav" aria-label="Navigasi utama">
    <?php foreach (['/'=>'Beranda','/tentang-kami'=>'Tentang Kami','/layanan'=>'Layanan','/portofolio'=>'Portofolio','/video-review'=>'Video Review','/kontak'=>'Kontak'] as $href=>$label): ?><a href="<?= $href ?>" <?= $current === $href ? 'aria-current="page"' : '' ?>><?= $label ?></a><?php endforeach; ?>
    <button class="theme-toggle" type="button" aria-label="Mode gelap" aria-pressed="false" title="Ganti tampilan terang atau gelap"><span class="theme-track" aria-hidden="true"><span class="theme-thumb"></span></span><span>Mode gelap</span></button>
    <a class="nav-cta" href="<?= e(wa_link('Halo, saya ingin konsultasi mengenai proyek furniture atau interior.')) ?>" target="_blank" rel="noopener">Konsultasi WhatsApp <span aria-hidden="true">↗</span></a>
  </nav>
</div></header>
