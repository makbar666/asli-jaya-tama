<?php
namespace App\Controllers;
use App\Core\Controller;
final class ContactController extends Controller { public function index(): void { $this->render('contact',['title'=>'Kontak','description'=>'Diskusikan desain, ukuran, bahan, dan finishing untuk pengerjaan custom bersama CV Asli Jaya Tama melalui WhatsApp.','services'=>config('services')]); } }
