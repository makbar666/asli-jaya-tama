<?php
declare(strict_types=1);

// PHP's built-in server sends every request through this router script.
// Let it serve existing public assets and robots.txt directly.
if (PHP_SAPI === 'cli-server') {
    $path = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH) ?: '/';
    if (preg_match('~^/(?:assets/[A-Za-z0-9_./-]+|robots\.txt|login\.html|admin\.html|proyek\.html)$~D', $path) && !str_contains($path, '..')) {
        $file = __DIR__ . $path;
        if (is_file($file)) return false;
    }
}

require dirname(__DIR__) . '/bootstrap.php';
ini_set('display_errors', '0');

if (parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH) === '/content-fallback.json') {
    require_once dirname(__DIR__) . '/scripts/content-fallback.php';
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode(contentFallback(dirname(__DIR__)), JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE | JSON_THROW_ON_ERROR);
    exit;
}

header('X-Content-Type-Options: nosniff');
header('Referrer-Policy: strict-origin-when-cross-origin');
header('X-Frame-Options: SAMEORIGIN');
header('Permissions-Policy: camera=(), microphone=(), geolocation=()');
header("Content-Security-Policy: default-src 'self'; img-src 'self' data: https:; style-src 'self' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; script-src 'self'; frame-src https://drive.google.com; connect-src 'self'; form-action 'self'; base-uri 'self'; object-src 'none'");

$requestPath = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH);
if ($requestPath === '/sitemap.xml') {
    $base = rtrim((string)(config('site')['production_url'] ?? ''), '/');
    if (!$base || !preg_match('~^https://[a-z0-9.-]+(?::[0-9]+)?$~iD', $base)) { http_response_code(404); exit; }
    header('Content-Type: application/xml; charset=UTF-8');
    $paths = ['/', '/tentang-kami', '/layanan', '/portofolio', '/video-review', '/kontak'];
    foreach (config('projects') as $project) if (preg_match('/^[a-z0-9]+(?:-[a-z0-9]+)*$/D', $project['slug'] ?? '')) $paths[] = '/portofolio/' . $project['slug'];
    echo '<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">';
    foreach ($paths as $path) echo '<url><loc>' . e($base . $path) . '</loc></url>';
    echo '</urlset>'; exit;
}

$router = new \App\Core\Router();
$router->get('/', [\App\Controllers\HomeController::class,'index']);
$router->get('/tentang-kami', [\App\Controllers\AboutController::class,'index']);
$router->get('/layanan', [\App\Controllers\ServiceController::class,'index']);
$router->get('/portofolio', [\App\Controllers\PortfolioController::class,'index']);
$router->get('/proyek', [\App\Controllers\PortfolioController::class,'cmsDetail']);
$router->get('/video-review', [\App\Controllers\VideoController::class,'index']);
$router->get('/kontak', [\App\Controllers\ContactController::class,'index']);
$router->dispatch($_SERVER['REQUEST_URI'] ?? '/');
