<?php
$pageTitle = ($title ?? 'Beranda') . ' | ' . $site['brand'];
$description = $description ?? $site['seo_description'];
$base = rtrim((string)($site['production_url'] ?? ''), '/');
$path = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH) ?: '/';
$canonical = $base ? $base . $path : null;
$ogImage = $site['hero_image'] ?? null;
?>
<head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title><?= e($pageTitle) ?></title>
<meta name="description" content="<?= e($description) ?>">
<?php if ($canonical): ?><link rel="canonical" href="<?= e($canonical) ?>"><?php endif; ?>
<meta property="og:type" content="website"><meta property="og:locale" content="id_ID">
<meta property="og:title" content="<?= e($pageTitle) ?>"><meta property="og:description" content="<?= e($description) ?>">
<?php if ($canonical): ?><meta property="og:url" content="<?= e($canonical) ?>"><?php endif; ?>
<?php if ($ogImage && $base): ?><meta property="og:image" content="<?= e($base . $ogImage) ?>"><?php endif; ?>
<meta name="theme-color" content="#f7f5f0">
<?php if ($site['logo']): ?><link rel="icon" type="image/png" href="<?= e($site['logo']) ?>"><?php endif; ?>
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Libre+Baskerville:wght@400;700&display=swap" rel="stylesheet">
<?php foreach (['variables','base','layout','components','responsive','motion','branding','videos','hero-stack','photos','process','intro-photo','social-video','service-photo'] as $css): ?><link rel="stylesheet" href="<?= asset('css/'.$css.'.css') ?>"><?php endforeach; ?>
<?php if ($base): ?><script type="application/ld+json"><?= json_encode(['@context'=>'https://schema.org','@type'=>'HomeAndConstructionBusiness','name'=>$site['company'],'url'=>$base,'telephone'=>'+'.$site['whatsapp_international'],'sameAs'=>array_values(array_filter([$site['instagram_url'],$site['tiktok_url'] ?? null,$site['official_url']]))], JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE | JSON_HEX_TAG | JSON_HEX_AMP) ?></script><?php endif; ?>
</head>
