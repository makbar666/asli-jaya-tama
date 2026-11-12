import json
from pathlib import Path
from tempfile import TemporaryDirectory
import unittest
from unittest.mock import patch

from scripts import sync_drive_videos as sync


class DriveSyncTests(unittest.TestCase):
    def test_public_folder_parser_reads_video_ids(self):
        parser = sync.FolderParser()
        parser.feed('<div aria-label="Proyek Baru.mp4 Video Shared" ssk="5:auSv138:1Abcdefghijklmno-0-16"></div>')
        parser.feed('<div aria-label="Catatan.txt File Shared" ssk="5:auSv138:1Zbcdefghijklmno-0-16"></div>')
        self.assertEqual(parser.videos, [{"id": "1Abcdefghijklmno", "name": "Proyek Baru.mp4"}])

    def test_new_video_is_added_without_replacing_existing(self):
        with TemporaryDirectory() as temporary:
            root = Path(temporary)
            generated = root / "drive_videos.json"
            generated.write_text("[]\n", encoding="utf-8")
            thumbnails = root / "thumbnails"
            listing = [
                {"id": "1ExistingVideoId", "name": "Video by cv_aslijayatama.mp4"},
                {"id": "1NewVideoFileId", "name": "Video by cv_aslijayatama (8).mp4"},
            ]
            with (
                patch.object(sync, "GENERATED", generated),
                patch.object(sync, "THUMBNAILS", thumbnails),
                patch.object(sync, "list_public_folder", return_value=listing),
                patch.object(sync, "current_video_ids", return_value={"1ExistingVideoId"}),
                patch.object(sync, "thumbnail_for", return_value=("drive-test.jpg", b"jpeg")),
                patch.dict(sync.os.environ, {"GOOGLE_DRIVE_API_KEY": ""}),
            ):
                self.assertEqual(sync.sync(dry_run=False, php_bin="php"), 1)
            entries = json.loads(generated.read_text(encoding="utf-8"))
            self.assertEqual(len(entries), 1)
            self.assertEqual(entries[0]["drive_file_id"], "1NewVideoFileId")
            self.assertEqual(entries[0]["title"], "Dokumentasi Video 02")
            self.assertTrue((thumbnails / "drive-test.jpg").is_file())


if __name__ == "__main__":
    unittest.main()
