<?php
// Video bersumber dari folder Google Drive CV Asli Jaya Tama yang diberikan pemilik.
// Judul menjelaskan tampilan yang terlihat; lokasi, tahun, dan durasi belum diklaim.
$manual = [
    [
        'slug' => 'kabinet-merah-area-dapur',
        'title' => 'Kabinet Merah dan Area Dapur',
        'category' => 'Custom Furniture',
        'description' => 'Dokumentasi visual kabinet merah dan area dapur.',
        'thumbnail' => '/assets/images/thumbnails/video-01.jpg',
        'drive_file_id' => '1PkjflTHTR87KH4i_XQWk3dE_O42YbBST',
        'duration' => null,
        'featured' => true,
    ],
    [
        'slug' => 'lemari-area-kamar',
        'title' => 'Lemari dan Area Kamar',
        'category' => 'Custom Furniture',
        'description' => 'Tampilan lemari built-in dan bagian ruang kamar.',
        'thumbnail' => '/assets/images/thumbnails/video-02.jpg',
        'drive_file_id' => '1WZfKpeDHSpg4x_QBrz_-ZIqKyOSU5TZh',
        'duration' => null,
        'featured' => true,
    ],
    [
        'slug' => 'bangku-penyimpanan',
        'title' => 'Bangku dengan Penyimpanan',
        'category' => 'Custom Furniture',
        'description' => 'Detail furniture bangku dan ruang penyimpanannya.',
        'thumbnail' => '/assets/images/thumbnails/video-03.jpg',
        'drive_file_id' => '1QjwYRnF2g0cjOpblYzwxp2DyW5YyPSMY',
        'duration' => null,
        'featured' => false,
    ],
    [
        'slug' => 'interior-kamar-tidur',
        'title' => 'Interior Kamar Tidur',
        'category' => 'Interior',
        'description' => 'Dokumentasi elemen furniture di area kamar tidur.',
        'thumbnail' => '/assets/images/thumbnails/video-04.jpg',
        'drive_file_id' => '1pyHP5-PkeTLUV9hVdq8k3r-AKkOHfAur',
        'duration' => null,
        'featured' => false,
    ],
    [
        'slug' => 'kabinet-tv-dan-penyimpanan',
        'title' => 'Kabinet TV dan Penyimpanan',
        'category' => 'Custom Furniture',
        'description' => 'Tampilan kabinet TV dengan elemen penyimpanan.',
        'thumbnail' => '/assets/images/thumbnails/video-05.jpg',
        'drive_file_id' => '1HdrqcuCmm_5FYCjc66nNyiKqM5Wln_B2',
        'duration' => null,
        'featured' => true,
    ],
    [
        'slug' => 'tampilan-interior-kamar',
        'title' => 'Tampilan Interior Kamar',
        'category' => 'Interior',
        'description' => 'Tampilan lemari dan meja rias dalam ruang kamar.',
        'thumbnail' => '/assets/images/thumbnails/video-06.jpg',
        'drive_file_id' => '1K3c6NPEqtXCJfunqHgLeLBRQJ9nrF1bO',
        'duration' => null,
        'featured' => false,
    ],
    [
        'slug' => 'panel-interior-pencahayaan',
        'title' => 'Panel Interior dan Pencahayaan',
        'category' => 'Interior',
        'description' => 'Dokumentasi panel ruang dengan pencahayaan terpasang.',
        'thumbnail' => '/assets/images/thumbnails/video-07.jpg',
        'drive_file_id' => '1YpZGUjLGw3LULZHpN5Cd4vfhAiQTfnkQ',
        'duration' => null,
        'featured' => false,
    ],
    [
        'slug' => 'area-depan-rumah',
        'title' => 'Area Depan Rumah',
        'category' => 'Home & Building',
        'description' => 'Dokumentasi tampilan area depan rumah.',
        'thumbnail' => '/assets/images/thumbnails/video-08.jpg',
        'drive_file_id' => '1B5DCUwzmgxm-BAGuGW_-YDhFFQv5b9mg',
        'duration' => null,
        'featured' => false,
    ],
];

$generatedFile = __DIR__ . '/drive_videos.json';
if (!is_file($generatedFile)) return $manual;

$generated = json_decode((string) file_get_contents($generatedFile), true, 512, JSON_THROW_ON_ERROR);
if (!is_array($generated) || !array_is_list($generated)) {
    throw new RuntimeException('Invalid generated video list.');
}

$known = [];
foreach ($manual as $video) $known[$video['drive_file_id']] = true;
$automatic = [];
foreach ($generated as $video) {
    if (!is_array($video)) continue;
    $id = $video['drive_file_id'] ?? '';
    $slug = $video['slug'] ?? '';
    $thumbnail = $video['thumbnail'] ?? '';
    if (!is_string($id) || !preg_match('/^[A-Za-z0-9_-]{10,100}$/D', $id)) continue;
    if (!is_string($slug) || !preg_match('/^[a-z0-9]+(?:-[a-z0-9]+)*$/D', $slug)) continue;
    if (!is_string($thumbnail) || !preg_match('~^/assets/images/thumbnails/[a-z0-9-]+\.(?:jpg|png|webp)$~D', $thumbnail)) continue;
    if (isset($known[$id])) continue; // manually curated entries take precedence
    $known[$id] = true;
    $automatic[] = [
        'slug' => $slug,
        'title' => (string) ($video['title'] ?? 'Dokumentasi Proyek'),
        'category' => (string) ($video['category'] ?? 'Dokumentasi Proyek'),
        'description' => (string) ($video['description'] ?? 'Dokumentasi video CV Asli Jaya Tama.'),
        'thumbnail' => $thumbnail,
        'drive_file_id' => $id,
        'duration' => null,
        'featured' => (bool) ($video['featured'] ?? true),
    ];
}

return array_merge($automatic, $manual);
