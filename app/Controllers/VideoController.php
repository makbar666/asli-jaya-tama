<?php
namespace App\Controllers;
use App\Core\Controller;
final class VideoController extends Controller { public function index(): void { $this->render('videos',['title'=>'Video Review','description'=>'Tonton dokumentasi video furniture dan pengerjaan custom CV Asli Jaya Tama untuk melihat tampilan serta detailnya.','videos'=>config('videos')]); } }
