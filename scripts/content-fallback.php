<?php
declare(strict_types=1);

function contentFallback(string $root): array {
    $entries = [];
    foreach (require $root . '/config/projects.php' as $index => $project) {
        $entries[] = [
            'type' => 'project', 'slug' => $project['slug'], 'title' => $project['title'],
            'category' => $project['category'], 'description' => $project['description'] ?? '',
            'media_url' => $project['cover'] ?? '', 'alt_text' => $project['title'],
            'gallery' => $project['gallery'] ?? [], 'drive_file_id' => $project['video_id'] ?? null,
            'location' => $project['location'] ?? null, 'year' => $project['year'] ?? null,
            'featured' => (bool)($project['featured'] ?? false), 'status' => 'published', 'sort_order' => $index,
        ];
    }
    foreach (require $root . '/config/photos.php' as $index => $photo) {
        $entries[] = [
            'type' => 'photo', 'slug' => $photo['slug'], 'title' => $photo['title'],
            'category' => $photo['category'], 'description' => '', 'media_url' => $photo['src'],
            'alt_text' => $photo['alt'], 'gallery' => [], 'drive_file_id' => null,
            'image_width' => $photo['width'], 'image_height' => $photo['height'],
            'featured' => true, 'status' => 'published', 'sort_order' => $index,
        ];
    }
    foreach (require $root . '/config/videos.php' as $index => $video) {
        $entries[] = [
            'type' => 'video', 'slug' => $video['slug'], 'title' => $video['title'],
            'category' => $video['category'], 'description' => $video['description'] ?? '',
            'media_url' => $video['thumbnail'] ?? '', 'alt_text' => $video['title'],
            'gallery' => [], 'drive_file_id' => $video['drive_file_id'],
            'duration' => $video['duration'] ?? null,
            'featured' => (bool)($video['featured'] ?? false), 'status' => 'published', 'sort_order' => $index,
        ];
    }
    return $entries;
}
