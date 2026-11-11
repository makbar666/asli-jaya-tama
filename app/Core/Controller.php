<?php
declare(strict_types=1);
namespace App\Core;

abstract class Controller {
    protected function render(string $page, array $data = []): void { View::render($page, $data); }
}
