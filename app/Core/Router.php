<?php
declare(strict_types=1);
namespace App\Core;

final class Router {
    private array $routes = [];
    public function get(string $path, array $handler): void { $this->routes[$path] = $handler; }
    public function dispatch(string $uri): void {
        $path = parse_url($uri, PHP_URL_PATH) ?: '/';
        if (strlen($path) > 180 || preg_match('/[\x00-\x1f]/', $path)) { $this->notFound(); return; }
        $path = rtrim($path, '/') ?: '/';
        if (isset($this->routes[$path])) {
            [$class, $method] = $this->routes[$path];
            (new $class())->$method(); return;
        }
        if (preg_match('~^/portofolio/([a-z0-9]+(?:-[a-z0-9]+)*)$~D', $path, $m)) {
            (new \App\Controllers\PortfolioController())->detail($m[1]); return;
        }
        $this->notFound();
    }
    public function notFound(): void {
        http_response_code(404);
        (new \App\Controllers\HomeController())->notFound();
    }
}
