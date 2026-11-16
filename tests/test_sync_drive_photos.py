import json
from pathlib import Path
from tempfile import TemporaryDirectory
import unittest
from unittest.mock import patch

from scripts import sync_drive_photos as sync


class PhotoSyncTests(unittest.TestCase):
    def test_parser_accepts_images_but_not_videos(self):
        parser = sync.PhotoParser()
        parser.feed('<div aria-label="Dapur Baru.jpg Image Shared" ssk="5:auSv138:1Abcdefghijklmno-0-16"></div>')
        parser.feed('<div aria-label="Video.mp4 Video Shared" ssk="5:auSv138:1Zbcdefghijklmno-0-16"></div>')
        self.assertEqual(parser.photos, [{'id': '1Abcdefghijklmno', 'name': 'Dapur Baru.jpg'}])

    def test_new_photo_added_once(self):
        with TemporaryDirectory() as temporary:
            root = Path(temporary)
            generated, photos = root / 'photos.json', root / 'images'
            generated.write_text('[]', encoding='utf-8')
            listing = [{'id': '1Abcdefghijklmno', 'name': 'Dapur_Baru.jpg'}]
            with (patch.object(sync, 'GENERATED', generated), patch.object(sync, 'PHOTOS', photos),
                  patch.object(sync, 'list_photos', return_value=listing),
                  patch.object(sync, 'fetch', return_value=(b'jpeg', 'image/jpeg')),
                  patch.object(sync.subprocess, 'run') as php):
                php.return_value.stdout = '[800,600]'
                self.assertEqual(sync.sync(), 1)
                self.assertEqual(sync.sync(), 0)
            entries = json.loads(generated.read_text(encoding='utf-8'))
            self.assertEqual(entries[0]['title'], 'Dapur Baru')
            self.assertEqual((entries[0]['width'], entries[0]['height']), (800, 600))
            self.assertEqual(len(list(photos.iterdir())), 1)


if __name__ == '__main__':
    unittest.main()
