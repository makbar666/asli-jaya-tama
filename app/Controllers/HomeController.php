<?php
namespace App\Controllers;
use App\Core\Controller;
final class HomeController extends Controller {
    public function index(): void { $this->render('home', ['title'=>'Beranda','projects'=>array_slice(array_values(array_filter(config('projects'), fn($p)=>!empty($p['featured']))),0,6),'photos'=>config('photos'),'videos'=>array_slice(array_values(array_filter(config('videos'), fn($v)=>!empty($v['featured']))),0,3),'services'=>config('services')]); }
    public function notFound(): void { $this->render('404', ['title'=>'Halaman tidak ditemukan']); }
}
