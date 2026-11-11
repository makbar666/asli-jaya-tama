<?php
namespace App\Controllers;
use App\Core\Controller;
final class ContactController extends Controller { public function index(): void { $this->render('contact',['title'=>'Kontak','description'=>'Hubungi CV Asli Jaya Tama melalui WhatsApp untuk konsultasi furniture custom, interior, eksterior, dan pekerjaan bangunan.','services'=>config('services')]); } }
