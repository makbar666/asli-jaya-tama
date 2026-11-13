<?php
namespace App\Controllers;
use App\Core\Controller;
final class ServiceController extends Controller { public function index(): void { $this->render('services',['title'=>'Layanan Custom','description'=>'Layanan custom CV Asli Jaya Tama mencakup furniture, elemen interior, dan pekerjaan ruang sesuai desain, ukuran, pilihan bahan, serta lingkup proyek.','services'=>config('services')]); } }
