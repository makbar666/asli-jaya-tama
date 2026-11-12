"""Add newly uploaded public Google Drive videos to the static website."""

from __future__ import annotations

import argparse
import hashlib
from html.parser import HTMLParser
import json
import os
from pathlib import Path
import re
import subprocess
import sys
from urllib.parse import urlencode
from urllib.request import Request, urlopen

ROOT = Path(__file__).resolve().parents[1]
FOLDER_ID = os.environ.get("DRIVE_FOLDER_ID", "1lIegtho751s1vbYxGzqPKypC8QcPZVa_")
GENERATED = ROOT / "config" / "drive_videos.json"
THUMBNAILS = ROOT / "public" / "assets" / "images" / "thumbnails"
FILE_ID = re.compile(r"^[A-Za-z0-9_-]{10,100}$")
VIDEO_NAME = re.compile(r"\.(mp4|mov|m4v|webm)$", re.IGNORECASE)
GENERIC_NAME = re.compile(r"^Video by cv_aslijayatama(?: \(\d+\))?$", re.IGNORECASE)


def fetch(url: str, *, limit: int = 5_000_000) -> tuple[bytes, str]:
    request = Request(url, headers={"User-Agent": "Mozilla/5.0 (compatible; AJTVideoSync/1.0)"})
    with urlopen(request, timeout=30) as response:
        mime = response.headers.get_content_type()
        data = response.read(limit + 1)
    if len(data) > limit:
        raise RuntimeError("Drive response exceeded size limit")
    return data, mime


class FolderParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self.videos: list[dict[str, str]] = []

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        values = dict(attrs)
        label = values.get("aria-label") or ""
        selection = values.get("ssk") or ""
        match = re.fullmatch(r"5:auSv138:([A-Za-z0-9_-]+)-0-16", selection)
        if not match or not label.endswith(" Video Shared"):
            return
        name = label.removesuffix(" Video Shared")
        if VIDEO_NAME.search(name) and FILE_ID.fullmatch(match.group(1)):
            self.videos.append({"id": match.group(1), "name": name})


def list_public_folder() -> list[dict[str, str]]:
    url = f"https://drive.google.com/drive/folders/{FOLDER_ID}?hl=ID"
    body, mime = fetch(url)
    if mime != "text/html":
        raise RuntimeError("Public Drive folder did not return HTML")
    parser = FolderParser()
    parser.feed(body.decode("utf-8", errors="replace"))
    return list({item["id"]: item for item in parser.videos}.values())


def list_drive_api(key: str) -> list[dict[str, str]]:
    videos: list[dict[str, str]] = []
    token = ""
    while True:
        params = {
            "key": key,
            "q": f"'{FOLDER_ID}' in parents and trashed = false",
            "fields": "nextPageToken,incompleteSearch,files(id,name,mimeType)",
            "pageSize": "1000",
            "supportsAllDrives": "true",
            "includeItemsFromAllDrives": "true",
        }
        if token:
            params["pageToken"] = token
        body, mime = fetch("https://www.googleapis.com/drive/v3/files?" + urlencode(params))
        if mime != "application/json":
            raise RuntimeError("Drive API did not return JSON")
        data = json.loads(body)
        if data.get("incompleteSearch"):
            raise RuntimeError("Drive API returned incomplete results")
        for item in data.get("files", []):
            file_id = item.get("id", "")
            name = item.get("name", "")
            if item.get("mimeType", "").startswith("video/") and FILE_ID.fullmatch(file_id):
                videos.append({"id": file_id, "name": name})
        token = data.get("nextPageToken", "")
        if not token:
            return videos


def current_video_ids(php_bin: str) -> set[str]:
    result = subprocess.run(
        [php_bin, "-r", "echo json_encode(require 'config/videos.php');"],
        cwd=ROOT, capture_output=True, text=True, check=True,
    )
    return {item["drive_file_id"] for item in json.loads(result.stdout)}


def title_from_filename(name: str, number: int) -> str:
    stem = VIDEO_NAME.sub("", name).strip()
    if not stem or GENERIC_NAME.fullmatch(stem):
        return f"Dokumentasi Video {number:02d}"
    return re.sub(r"\s+", " ", stem.replace("_", " "))[:100]


def thumbnail_for(file_id: str) -> tuple[str, bytes]:
    body, mime = fetch("https://drive.google.com/thumbnail?" + urlencode({"id": file_id, "sz": "w800"}), limit=3_000_000)
    extension = {"image/jpeg": "jpg", "image/png": "png", "image/webp": "webp"}.get(mime)
    if not extension:
        raise RuntimeError(f"No image thumbnail for Drive file {file_id}")
    filename = "drive-" + hashlib.sha256(file_id.encode()).hexdigest()[:12] + "." + extension
    return filename, body


def sync(*, dry_run: bool, php_bin: str) -> int:
    if not FILE_ID.fullmatch(FOLDER_ID):
        raise RuntimeError("Invalid Drive folder ID")
    api_key = os.environ.get("GOOGLE_DRIVE_API_KEY", "")
    if api_key:
        try:
            listing = list_drive_api(api_key)
            print(f"Drive API: {len(listing)} video files")
        except Exception:
            print("Drive API unavailable; checking public folder page", file=sys.stderr)
            listing = list_public_folder()
    else:
        listing = list_public_folder()
    if not listing:
        raise RuntimeError("No videos found; keeping existing gallery unchanged")

    existing_ids = current_video_ids(php_bin)
    stored = json.loads(GENERATED.read_text(encoding="utf-8")) if GENERATED.exists() else []
    if not isinstance(stored, list):
        raise RuntimeError("Generated video JSON must be a list")
    new_files = [item for item in listing if item["id"] not in existing_ids]
    print(f"Folder: {len(listing)} videos; new: {len(new_files)}")
    if dry_run or not new_files:
        return len(new_files)

    entries: list[dict[str, object]] = []
    thumbnails: list[tuple[Path, bytes]] = []
    next_number = len(existing_ids) + 1
    for item in new_files:
        filename, content = thumbnail_for(item["id"])
        target = THUMBNAILS / filename
        thumbnails.append((target, content))
        entries.append({
            "slug": "drive-" + hashlib.sha256(item["id"].encode()).hexdigest()[:12],
            "title": title_from_filename(item["name"], next_number),
            "category": "Dokumentasi Proyek",
            "description": "Dokumentasi video CV Asli Jaya Tama.",
            "thumbnail": "/assets/images/thumbnails/" + filename,
            "drive_file_id": item["id"],
            "duration": None,
            "featured": True,
        })
        next_number += 1

    if not dry_run:
        THUMBNAILS.mkdir(parents=True, exist_ok=True)
        for target, content in thumbnails:
            if not target.exists():
                target.write_bytes(content)
        GENERATED.write_text(json.dumps(list(reversed(entries)) + stored, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    return len(entries)


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--dry-run", action="store_true")
    parser.add_argument("--php-bin", default=os.environ.get("PHP_BIN", "php"))
    args = parser.parse_args()
    try:
        sync(dry_run=args.dry_run, php_bin=args.php_bin)
    except Exception as exc:
        print(f"Sync failed: {exc}", file=sys.stderr)
        sys.exit(1)
