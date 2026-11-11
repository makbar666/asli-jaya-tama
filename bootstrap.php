<?php
declare(strict_types=1);

spl_autoload_register(static function (string $class): void {
    $prefix = 'App\\';
    if (!str_starts_with($class, $prefix)) return;
    $path = __DIR__ . '/app/' . str_replace('\\', '/', substr($class, strlen($prefix))) . '.php';
    if (is_file($path)) require $path;
});

function config(string $name): array { return require __DIR__ . '/config/' . $name . '.php'; }
function e(?string $value): string { return htmlspecialchars($value ?? '', ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8'); }
function url(string $path = ''): string { return '/' . ltrim($path, '/'); }
function asset(string $path): string { return url('assets/' . ltrim($path, '/')); }
function wa_link(string $message = ''): string {
    $number = preg_replace('/\D+/', '', (string) config('site')['whatsapp_international']);
    return 'https://wa.me/' . $number . ($message !== '' ? '?text=' . rawurlencode($message) : '');
}
function partial(string $name, array $data = []): void {
    extract($data, EXTR_SKIP);
    require __DIR__ . '/app/Views/components/' . $name . '.php';
}
