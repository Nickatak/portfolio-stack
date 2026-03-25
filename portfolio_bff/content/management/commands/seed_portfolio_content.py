from __future__ import annotations

import json
import os
from pathlib import Path

from django.contrib.auth import get_user_model
from datetime import date

from django.core.management.base import BaseCommand
from django.db import transaction
from django.utils.text import slugify

from content.models import ContactLink, Project, SiteSetting, Skill, SocialLink, Stat

REPO_ROOT = Path(__file__).resolve().parents[3]
DATA_PATH = REPO_ROOT / "content" / "data" / "portfolio-content.json"
OPS_REPO_NAMES = ("ntakemori-deploy", "ntakemori-deployment")
OPS_SEED_FILENAME = "portfolio-content.json"

SITE_NAME_KEY = "site.name"
DISPLAY_NAME_KEY = "site.display_name"
CONTACT_EMAIL_KEY = "site.contact_email"


class Command(BaseCommand):
    help = (
        "Seed portfolio content into the database. Uses content/data/portfolio-content.json, "
        "or an ops override if present."
    )

    def add_arguments(self, parser):
        parser.add_argument(
            "--reset",
            action="store_true",
            help="Delete existing content before seeding.",
        )

    def handle(self, *args, **options):
        data_path = _resolve_seed_path()
        if not data_path.exists():
            raise FileNotFoundError(f"Seed data not found: {data_path}")

        if data_path != DATA_PATH:
            self.stdout.write(self.style.WARNING(f"Using seed override: {data_path}"))

        with data_path.open("r", encoding="utf-8") as handle:
            data = json.load(handle)

        with transaction.atomic():
            if options["reset"]:
                Project.objects.all().delete()
                Stat.objects.all().delete()
                Skill.objects.all().delete()
                SocialLink.objects.all().delete()
                ContactLink.objects.all().delete()

            site = data.get("site", {})
            SiteSetting.objects.update_or_create(key=SITE_NAME_KEY, defaults={"value": site.get("name", "Portfolio")})
            SiteSetting.objects.update_or_create(key=DISPLAY_NAME_KEY, defaults={"value": site.get("displayName", "Your Name")})
            SiteSetting.objects.update_or_create(key=CONTACT_EMAIL_KEY, defaults={"value": site.get("contactEmail", "hello@example.com")})

            for index, project in enumerate(data.get("projects", [])):
                slug = project.get("slug") or slugify(project.get("title", ""))
                Project.objects.update_or_create(
                    slug=slug,
                    defaults={
                        "title": project.get("title", ""),
                        "description": project.get("description", ""),
                        "body": project.get("body", ""),
                        "tags": project.get("tags", []),
                        "link": project.get("link", ""),
                        "github": project.get("github", ""),
                        "is_featured": project.get("isFeatured", False),
                        "category": project.get("category", ""),
                        "published_date": _parse_date(project.get("publishedDate")),
                        "is_published": True,
                        "order": index,
                    },
                )

            for index, stat in enumerate(data.get("stats", [])):
                Stat.objects.update_or_create(
                    label=stat.get("label", ""),
                    defaults={
                        "number": stat.get("number", ""),
                        "icon": stat.get("icon", ""),
                        "order": index,
                    },
                )

            for index, skill_name in enumerate(data.get("skills", [])):
                Skill.objects.update_or_create(
                    name=skill_name,
                    defaults={
                        "order": index,
                    },
                )

            for index, link in enumerate(data.get("socialLinks", [])):
                SocialLink.objects.update_or_create(
                    name=link.get("name", ""),
                    defaults={
                        "url": link.get("url", ""),
                        "icon": link.get("icon", ""),
                        "order": index,
                    },
                )

            for index, link in enumerate(data.get("contactLinks", [])):
                ContactLink.objects.update_or_create(
                    title=link.get("title", ""),
                    defaults={
                        "icon": link.get("icon", ""),
                        "description": link.get("description", ""),
                        "href": link.get("href", ""),
                        "order": index,
                    },
                )

            self._maybe_seed_dev_superuser()

        self.stdout.write(self.style.SUCCESS("Seed data loaded successfully."))

    def _maybe_seed_dev_superuser(self) -> None:
        if _is_production_env():
            return

        username = os.getenv("BFF_DEV_SUPERUSER_USERNAME", "test@ex.com")
        email = os.getenv("BFF_DEV_SUPERUSER_EMAIL", "admin@example.com")
        password = os.getenv("BFF_DEV_SUPERUSER_PASSWORD", "Qweqwe123")

        user_model = get_user_model()
        if user_model.objects.filter(username=username).exists():
            self.stdout.write(self.style.WARNING(f"Dev superuser '{username}' already exists."))
            return

        user_model.objects.create_superuser(username=username, email=email, password=password)
        self.stdout.write(self.style.SUCCESS(f"Created dev superuser '{username}'."))


def _is_production_env() -> bool:
    for key in ("BFF_ENV", "DJANGO_ENV", "ENVIRONMENT", "APP_ENV"):
        value = os.getenv(key)
        if value and value.strip().lower() in {"prod", "production"}:
            return True
    return False


def _parse_date(value: str | None) -> date | None:
    if not value:
        return None
    return date.fromisoformat(value)


def _resolve_seed_path() -> Path:
    env_path = os.getenv("BFF_SEED_DATA_PATH")
    if env_path:
        candidate = Path(env_path).expanduser()
        if candidate.is_file():
            return candidate

    bases = [REPO_ROOT.parent.parent, REPO_ROOT.parent]
    for base in bases:
        for repo_name in OPS_REPO_NAMES:
            candidate = base / repo_name / OPS_SEED_FILENAME
            if candidate.is_file():
                return candidate

    return DATA_PATH
