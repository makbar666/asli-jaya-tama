<?php
namespace App\Controllers;
use App\Core\Controller;
final class PortfolioController extends Controller {
    public function index(): void { $this->render('portfolio',['title'=>'Portofolio','description'=>'Lihat dokumentasi hasil pekerjaan furniture, interior, eksterior, dan bangunan CV Asli Jaya Tama.','projects'=>config('projects'),'photos'=>config('photos')]); }
    public function detail(string $slug): void {
        $project = null;
        foreach (config('projects') as $item) if (($item['slug'] ?? '') === $slug) { $project=$item; break; }
        if (!$project) { (new \App\Core\Router())->notFound(); return; }
        $related = array_values(array_filter(config('projects'), fn($p)=>($p['slug']??'')!==$slug && ($p['category']??'')===($project['category']??'')));
        $this->render('project-detail',['title'=>$project['title'],'description'=>(string)($project['description'] ?? $project['title']),'project'=>$project,'related'=>array_slice($related,0,3)]);
    }
}
