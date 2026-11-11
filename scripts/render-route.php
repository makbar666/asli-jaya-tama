<?php
declare(strict_types=1);

$route = $argv[1] ?? '/';
if ($route === '__404__') {
    $_SERVER['REQUEST_URI'] = '/404';
    require dirname(__DIR__) . '/bootstrap.php';
    \App\Core\View::render('404', ['title' => 'Halaman tidak ditemukan']);
    exit;
}

if (!preg_match('~^/(?:[a-z0-9-]+(?:/[a-z0-9-]+)?)?$~D', $route) && $route !== '/sitemap.xml') {
    fwrite(STDERR, "Rute build tidak valid: {$route}\n");
    exit(1);
}

$_SERVER['REQUEST_URI'] = $route;
ob_start();
require dirname(__DIR__) . '/public/index.php';
$content = ob_get_clean();
if (http_response_code() >= 400) {
    fwrite(STDERR, "Rute tidak tersedia: {$route}\n");
    exit(1);
}
echo $content;
