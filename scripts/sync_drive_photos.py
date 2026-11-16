"""Add public photos from the existing Drive folder to the static gallery."""
from __future__ import annotations

import hashlib
from html.parser import HTMLParser
import json
import os
from pathlib import Path
import re
import subprocess
import sys
from tempfile import TemporaryDirectory
from urllib.parse import urlencode

try:
    from .sync_drive_videos import FILE_ID, FOLDER_ID, ROOT, fetch
except ImportError:
    from sync_drive_videos import FILE_ID, FOLDER_ID, ROOT, fetch

GENERATED = ROOT / 'config' / 'drive_photos.json'
PHOTOS = ROOT / 'public' / 'assets' / 'images' / 'drive-photos'
IMAGE_NAME = re.compile(r'\.(?:jpe?g|png|webp)$', re.IGNORECASE)


class PhotoParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.photos = []

    def handle_starttag(self, tag, attrs):
        values = dict(attrs)
        match = re.fullmatch(r'5:auSv138:([A-Za-z0-9_-]+)-0-16', values.get('ssk') or '')
        label = values.get('aria-label') or ''
        name = re.sub(r' (?:Image|Photo|File) Shared$', '', label)
        if match and name != label and IMAGE_NAME.search(name) and FILE_ID.fullmatch(match.group(1)):
            self.photos.append({'id': match.group(1), 'name': name})


def list_photos():
    key = os.environ.get('GOOGLE_DRIVE_API_KEY', '')
    if key:
        try:
            items, page = [], ''
            while True:
                params = {'key': key, 'q': f"'{FOLDER_ID}' in parents and trashed = false", 'fields': 'nextPageToken,incompleteSearch,files(id,name,mimeType)', 'pageSize': '1000', 'supportsAllDrives': 'true', 'includeItemsFromAllDrives': 'true'}
                if page: params['pageToken'] = page
                data, mime = fetch('https://www.googleapis.com/drive/v3/files?' + urlencode(params))
                if mime != 'application/json': raise RuntimeError('Drive API did not return JSON')
                result = json.loads(data)
                if result.get('incompleteSearch'): raise RuntimeError('Drive API returned incomplete results')
                items.extend({'id': x['id'], 'name': x['name']} for x in result.get('files', []) if x.get('mimeType') in ('image/jpeg', 'image/png', 'image/webp') and FILE_ID.fullmatch(x.get('id', '')))
                page = result.get('nextPageToken', '')
                if not page: return items
        except Exception:
            print('Drive API unavailable; checking public folder page', file=sys.stderr)
    data, mime = fetch(f'https://drive.google.com/drive/folders/{FOLDER_ID}?hl=ID')
    if mime != 'text/html': raise RuntimeError('Public Drive folder did not return HTML')
    parser = PhotoParser()
    parser.feed(data.decode('utf-8', errors='replace'))
    return list({x['id']: x for x in parser.photos}.values())


def sync(php_bin='php'):
    if not FILE_ID.fullmatch(FOLDER_ID): raise RuntimeError('Invalid Drive folder ID')
    stored = json.loads(GENERATED.read_text(encoding='utf-8')) if GENERATED.exists() else []
    if not isinstance(stored, list): raise RuntimeError('Invalid generated photo list')
    known = {x.get('drive_file_id') for x in stored}
    new = [x for x in list_photos() if x['id'] not in known]
    print(f'New photos: {len(new)}')
    if not new: return 0
    entries, files = [], []
    with TemporaryDirectory() as temp:
        for item in new:
            content, mime = fetch('https://drive.google.com/thumbnail?' + urlencode({'id': item['id'], 'sz': 'w1600'}), limit=10_000_000)
            extension = {'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp'}.get(mime)
            if not extension: raise RuntimeError('Drive photo preview is not available yet')
            slug = 'drive-photo-' + hashlib.sha256(item['id'].encode()).hexdigest()[:12]
            name = f'{slug}.{extension}'
            path = Path(temp) / name
            path.write_bytes(content)
            result = subprocess.run([php_bin, '-r', '$s=getimagesize($argv[1]); if (!$s) exit(1); echo json_encode([$s[0],$s[1]]);', str(path)], capture_output=True, text=True, check=True)
            width, height = json.loads(result.stdout)
            title = re.sub(r'\s+', ' ', IMAGE_NAME.sub('', item['name']).replace('_', ' ')).strip()[:100] or 'Dokumentasi Proyek'
            entries.append({'slug': slug, 'title': title, 'src': '/assets/images/drive-photos/' + name, 'width': width, 'height': height, 'drive_file_id': item['id']})
            files.append((name, content))
        PHOTOS.mkdir(parents=True, exist_ok=True)
        for name, content in files: (PHOTOS / name).write_bytes(content)
        GENERATED.write_text(json.dumps(list(reversed(entries)) + stored, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    return len(entries)


if __name__ == '__main__':
    try:
        sync(os.environ.get('PHP_BIN', 'php'))
    except Exception as exc:
        print(f'Photo sync failed: {exc}', file=sys.stderr)
        sys.exit(1)
