<?php
namespace App\Controllers;
use App\Core\Controller;
final class AboutController extends Controller { public function index(): void { $this->render('about',['title'=>'Tentang Kami','description'=>'Kenali pendekatan CV Asli Jaya Tama dalam pengerjaan custom, mulai dari kebutuhan ruang dan desain hingga pilihan bahan serta finishing.','services'=>config('services'),'projects'=>array_slice(config('projects'),0,2)]); } }
