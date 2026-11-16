<?php
// Dokumentasi foto yang diberikan pemilik. Judul menjelaskan isi foto, tanpa klaim lokasi/tahun.
$manual = [
    ['slug' => 'kitchen-set-abu-abu', 'title' => 'Kitchen set abu-abu', 'category' => 'Kitchen Set', 'src' => '/assets/images/hero/1.jpeg', 'alt' => 'Kitchen set abu-abu dengan meja island', 'width' => 585, 'height' => 1040],
    ['slug' => 'lemari-dan-rak-built-in', 'title' => 'Lemari dan rak built-in', 'category' => 'Furniture Custom', 'src' => '/assets/images/hero/2.jpeg', 'alt' => 'Lemari dan rak built-in berfinishing kayu', 'width' => 720, 'height' => 1280],
    ['slug' => 'kitchen-set-meja-island', 'title' => 'Kitchen set dengan meja island', 'category' => 'Kitchen Set', 'src' => '/assets/images/hero/3.jpeg', 'alt' => 'Kitchen set terang dengan meja island', 'width' => 720, 'height' => 1280],
    ['slug' => 'panel-dan-partisi-kayu', 'title' => 'Panel dan partisi kayu', 'category' => 'Interior Custom', 'src' => '/assets/images/hero/4.jpeg', 'alt' => 'Panel interior dan partisi kayu di area rumah', 'width' => 1200, 'height' => 1600],
    ['slug' => 'lemari-kayu-custom', 'title' => 'Lemari kayu custom', 'category' => 'Furniture Custom', 'src' => '/assets/images/hero/5.jpeg', 'alt' => 'Lemari kayu custom di area kamar', 'width' => 900, 'height' => 1600],
];

$generatedFile = __DIR__ . '/drive_photos.json';
if (!is_file($generatedFile)) return $manual;
$generated = json_decode((string) file_get_contents($generatedFile), true, 512, JSON_THROW_ON_ERROR);
if (!is_array($generated) || !array_is_list($generated)) throw new RuntimeException('Invalid generated photo list.');
$automatic = [];
foreach ($generated as $photo) {
    if (!is_array($photo)) continue;
    if (!preg_match('/^drive-photo-[a-f0-9]{12}$/D', (string) ($photo['slug'] ?? ''))) continue;
    if (!preg_match('~^/assets/images/drive-photos/drive-photo-[a-f0-9]{12}\.(?:jpg|png|webp)$~D', (string) ($photo['src'] ?? ''))) continue;
    $width = (int) ($photo['width'] ?? 0); $height = (int) ($photo['height'] ?? 0);
    if ($width < 1 || $height < 1) continue;
    $automatic[] = ['slug' => $photo['slug'], 'title' => (string) ($photo['title'] ?? 'Dokumentasi Proyek'), 'category' => 'Dokumentasi Proyek', 'src' => $photo['src'], 'alt' => (string) ($photo['title'] ?? 'Dokumentasi Proyek'), 'width' => $width, 'height' => $height];
}
return array_merge($automatic, $manual);
