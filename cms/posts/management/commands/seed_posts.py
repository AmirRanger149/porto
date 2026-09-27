"""
Seed the database from the markdown files in src/content/posts.

Create-only by default, so edits made in the Django admin survive restarts.
Pass --force to overwrite database rows from the markdown source of truth.
"""
import datetime
import os
import re
from pathlib import Path

from django.core.management.base import BaseCommand
from django.utils.dateparse import parse_date

from posts.models import Post

FRONTMATTER = re.compile(r"^---\n(.*?)\n---\n?(.*)$", re.S)


def parse_md(path: Path) -> dict:
    raw = path.read_text(encoding="utf-8")
    m = FRONTMATTER.match(raw)
    meta: dict[str, str] = {}
    body = raw
    if m:
        for line in m.group(1).splitlines():
            idx = line.find(":")
            if idx > 0:
                key = line[:idx].strip()
                val = line[idx + 1 :].strip().strip('"')
                meta[key] = val
        body = m.group(2)

    tags_raw = meta.get("tags", "").strip("[]")
    tags = [t.strip().strip("'\"") for t in tags_raw.split(",") if t.strip()]

    date = parse_date(meta.get("date", "")) or datetime.date.today()

    return {
        "title": meta.get("title", path.stem),
        "date": date,
        "tags": tags,
        "abstract": meta.get("abstract", ""),
        "body": body.strip() + "\n",
    }


class Command(BaseCommand):
    help = "Seed posts from markdown files (CONTENT_DIR, default /app/content)."

    def add_arguments(self, parser):
        parser.add_argument("--dir", default=os.environ.get("CONTENT_DIR", "/app/content"))
        parser.add_argument(
            "--force",
            action="store_true",
            help="Overwrite existing rows from the markdown files.",
        )

    def handle(self, *args, **opts):
        directory = Path(opts["dir"])
        if not directory.is_dir():
            self.stdout.write(self.style.WARNING(f"content dir not found: {directory} — skipping seed"))
            return

        created = updated = 0
        for md in sorted(directory.glob("*.md")):
            data = parse_md(md)
            slug = md.stem
            if opts["force"]:
                _, was_new = Post.objects.update_or_create(slug=slug, defaults=data)
            else:
                _, was_new = Post.objects.get_or_create(slug=slug, defaults=data)
            if was_new:
                created += 1
            else:
                updated += 1
            self.stdout.write(f"  {'+' if was_new else '='} {slug}")

        verb = "created" if not opts["force"] else "synced"
        self.stdout.write(
            self.style.SUCCESS(f"seed complete — {created} {verb}, {updated} already present")
        )
