<!doctype html>
<html lang="id">
<?php require __DIR__ . '/header.php'; ?>
<body>
<a class="skip-link" href="#konten">Lewati ke konten</a>
<?php partial('navbar', ['site'=>$site]); ?>
<main id="konten"><?php require $pageFile; ?></main>
<?php require __DIR__ . '/footer.php'; ?>
<?php partial('video-modal'); ?>
<script src="<?= asset('js/main.js') ?>" defer></script>
<script src="<?= asset('js/navigation.js') ?>" defer></script>
<script src="<?= asset('js/portfolio.js') ?>" defer></script>
<script src="<?= asset('js/video-gallery.js') ?>" defer></script>
<script src="<?= asset('js/motion.js') ?>" defer></script>
<script src="<?= asset('js/theme.js') ?>" defer></script>
</body></html>
