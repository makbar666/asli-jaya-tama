<?php
namespace App\Controllers;
use App\Core\Controller;
final class VideoController extends Controller { public function index(): void { $this->render('videos',['title'=>'Video Review','description'=>'Tonton dokumentasi video hasil pengerjaan CV Asli Jaya Tama melalui galeri video review.','videos'=>config('videos')]); } }
