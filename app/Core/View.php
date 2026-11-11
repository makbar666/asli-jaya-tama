<?php
declare(strict_types=1);
namespace App\Core;

final class View {
    public static function render(string $page, array $data = []): void {
        if ($page !== '404' && !preg_match('/^[a-z-]+$/', $page)) throw new \InvalidArgumentException('Invalid view');
        extract($data, EXTR_SKIP);
        $site = config('site');
        $pageFile = __DIR__ . '/../Views/pages/' . $page . '.php';
        if (!is_file($pageFile)) throw new \RuntimeException('View unavailable');
        require __DIR__ . '/../Views/layouts/main.php';
    }
}
