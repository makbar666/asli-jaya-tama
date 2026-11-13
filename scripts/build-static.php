<?php
declare(strict_types=1);

// Render the PHP source locally into a Vercel-ready static dist/ directory.
$root = realpath(dirname(__DIR__));
if ($root === false) throw new RuntimeException('Project root not found.');
$destination = $root . DIRECTORY_SEPARATOR . 'dist';
$temporary = $root . DIRECTORY_SEPARATOR . '.dist-tmp-' . bin2hex(random_bytes(5));
if (!mkdir($temporary, 0755)) throw new RuntimeException('Cannot create temporary build directory.');

function copyDirectory(string $source, string $target): void {
    if (!is_dir($target) && !mkdir($target, 0755, true)) throw new RuntimeException("Cannot create {$target}");
    foreach (new DirectoryIterator($source) as $entry) {
        if ($entry->isDot() || $entry->getFilename() === '.gitkeep') continue;
        if ($entry->isLink()) throw new RuntimeException('Symlinked assets are not supported.');
        $to = $target . DIRECTORY_SEPARATOR . $entry->getFilename();
        if ($entry->isDir()) copyDirectory($entry->getPathname(), $to);
        elseif (!copy($entry->getPathname(), $to)) throw new RuntimeException("Cannot copy {$to}");
    }
}

function renderRoute(string $root, string $route): string {
    $command = [PHP_BINARY, $root . DIRECTORY_SEPARATOR . 'scripts' . DIRECTORY_SEPARATOR . 'render-route.php', $route];
    $process = proc_open($command, [1 => ['pipe', 'w'], 2 => ['pipe', 'w']], $pipes, $root);
    if (!is_resource($process)) throw new RuntimeException("Cannot render {$route}");
    $html = stream_get_contents($pipes[1]); fclose($pipes[1]);
    $error = stream_get_contents($pipes[2]); fclose($pipes[2]);
    if (proc_close($process) !== 0) throw new RuntimeException("Build failed for {$route}: {$error}");
    return $html;
}

function removeDirectory(string $path, string $root): void {
    $resolved = realpath($path);
    if ($resolved === false || dirname($resolved) !== $root || is_link($path)) throw new RuntimeException('Unsafe build directory cleanup.');
    $items = new RecursiveIteratorIterator(
        new RecursiveDirectoryIterator($resolved, FilesystemIterator::SKIP_DOTS),
        RecursiveIteratorIterator::CHILD_FIRST
    );
    foreach ($items as $item) {
        if ($item->isDir() && !$item->isLink()) rmdir($item->getPathname());
        else unlink($item->getPathname());
    }
    rmdir($resolved);
}

// A previous interrupted build may leave a temporary directory behind.
foreach (glob($root . DIRECTORY_SEPARATOR . '.dist-tmp-*', GLOB_ONLYDIR) ?: [] as $stale) {
    if ($stale !== $temporary) removeDirectory($stale, $root);
}

$routes = [
    '/' => 'index.html',
    '/tentang-kami' => 'tentang-kami.html',
    '/layanan' => 'layanan.html',
    '/portofolio' => 'portofolio.html',
    '/proyek' => 'proyek.html',
    '/video-review' => 'video-review.html',
    '/kontak' => 'kontak.html',
    '__404__' => '404.html',
];

$projects = require $root . DIRECTORY_SEPARATOR . 'config' . DIRECTORY_SEPARATOR . 'projects.php';
foreach ($projects as $project) {
    $slug = $project['slug'] ?? '';
    if (!is_string($slug) || !preg_match('/^[a-z0-9]+(?:-[a-z0-9]+)*$/D', $slug)) {
        throw new RuntimeException('Project slug must contain lowercase letters, numbers, and hyphens only.');
    }
    $route = '/portofolio/' . $slug;
    if (isset($routes[$route])) throw new RuntimeException("Duplicate project slug: {$slug}");
    $routes[$route] = 'portofolio/' . $slug . '.html';
}

copyDirectory($root . DIRECTORY_SEPARATOR . 'public' . DIRECTORY_SEPARATOR . 'assets', $temporary . DIRECTORY_SEPARATOR . 'assets');
copy($root . DIRECTORY_SEPARATOR . 'public' . DIRECTORY_SEPARATOR . 'robots.txt', $temporary . DIRECTORY_SEPARATOR . 'robots.txt');
require_once $root . DIRECTORY_SEPARATOR . 'scripts' . DIRECTORY_SEPARATOR . 'content-fallback.php';
file_put_contents($temporary . DIRECTORY_SEPARATOR . 'content-fallback.json', json_encode(contentFallback($root), JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE | JSON_THROW_ON_ERROR));
foreach (['login.html', 'admin.html', 'proyek.html'] as $staticPage) {
    if (is_file($root . DIRECTORY_SEPARATOR . 'public' . DIRECTORY_SEPARATOR . $staticPage)) {
        copy($root . DIRECTORY_SEPARATOR . 'public' . DIRECTORY_SEPARATOR . $staticPage, $temporary . DIRECTORY_SEPARATOR . $staticPage);
    }
}

foreach ($routes as $route => $file) {
    $target = $temporary . DIRECTORY_SEPARATOR . str_replace('/', DIRECTORY_SEPARATOR, $file);
    $parent = dirname($target);
    if (!is_dir($parent) && !mkdir($parent, 0755, true)) throw new RuntimeException("Cannot create {$parent}");
    if (file_put_contents($target, renderRoute($root, $route)) === false) throw new RuntimeException("Cannot write {$target}");
}

$site = require $root . DIRECTORY_SEPARATOR . 'config' . DIRECTORY_SEPARATOR . 'site.php';
if (!empty($site['production_url'])) {
    file_put_contents($temporary . DIRECTORY_SEPARATOR . 'sitemap.xml', renderRoute($root, '/sitemap.xml'));
}

if (file_exists($destination)) removeDirectory($destination, $root);
if (!rename($temporary, $destination)) throw new RuntimeException('Cannot finalize dist directory.');
echo 'Static build complete: ' . count($routes) . ' HTML pages in dist/' . PHP_EOL;
