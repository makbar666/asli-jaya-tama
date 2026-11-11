<?php
namespace App\Controllers;
use App\Core\Controller;
final class AboutController extends Controller { public function index(): void { $this->render('about',['title'=>'Tentang Kami','description'=>'Kenali CV Asli Jaya Tama dan pendekatannya dalam pekerjaan furniture custom, interior, eksterior, serta rumah dan bangunan.','services'=>config('services'),'projects'=>array_slice(config('projects'),0,2)]); } }
