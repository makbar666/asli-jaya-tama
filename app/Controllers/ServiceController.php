<?php
namespace App\Controllers;
use App\Core\Controller;
final class ServiceController extends Controller { public function index(): void { $this->render('services',['title'=>'Layanan','description'=>'Layanan CV Asli Jaya Tama meliputi furniture custom, interior, eksterior, serta pekerjaan rumah dan bangunan.','services'=>config('services')]); } }
