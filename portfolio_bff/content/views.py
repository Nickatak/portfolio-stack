from __future__ import annotations

import math
import re

from django.db.models import Q
from django.http import Http404, JsonResponse
from django.utils.text import slugify
from django.views.decorators.http import require_GET

from .models import ContactLink, Project, SiteSetting, Skill, SocialLink, Stat

WORDS_PER_MINUTE = 200


def _reading_time_minutes(html: str) -> int | None:
    if not html:
        return None
    text = re.sub(r"<[^>]+>", " ", html)
    word_count = len(text.split())
    return max(1, math.ceil(word_count / WORDS_PER_MINUTE))


SITE_NAME_KEY = "site.name"
DISPLAY_NAME_KEY = "site.display_name"
CONTACT_EMAIL_KEY = "site.contact_email"


def _get_site_settings():
    settings = {item.key: item.value for item in SiteSetting.objects.all()}
    return {
        "name": settings.get(SITE_NAME_KEY, "Portfolio"),
        "displayName": settings.get(DISPLAY_NAME_KEY, "Your Name"),
        "contactEmail": settings.get(CONTACT_EMAIL_KEY, "hello@example.com"),
    }


def _serialize_project(project: Project, *, include_body: bool = False) -> dict:
    data = {
        "id": project.id,
        "slug": project.slug,
        "title": project.title,
        "description": project.description,
        "tags": project.tags or [],
        "link": project.link,
        "github": project.github,
        "isFeatured": project.is_featured,
        "category": project.category,
        "hasBody": bool(project.body),
        "readingTime": _reading_time_minutes(project.body),
        "publishedDate": project.published_date.isoformat() if project.published_date else None,
    }
    if include_body:
        data["body"] = project.body
    return data


@require_GET
def portfolio_content(request):
    return JsonResponse(
        {
            "site": _get_site_settings(),
            "projects": [_serialize_project(p) for p in Project.objects.filter(is_published=True)],
            "stats": [
                {"number": stat.number, "label": stat.label, "icon": stat.icon}
                for stat in Stat.objects.all()
            ],
            "skills": [skill.name for skill in Skill.objects.all()],
            "socialLinks": [
                {"name": link.name, "url": link.url, "icon": link.icon}
                for link in SocialLink.objects.all()
            ],
            "contactLinks": [
                {
                    "icon": link.icon,
                    "title": link.title,
                    "description": link.description,
                    "href": link.href,
                }
                for link in ContactLink.objects.all()
            ],
        }
    )


@require_GET
def projects_list(request):
    return JsonResponse({"projects": [_serialize_project(p) for p in Project.objects.filter(is_published=True)]})


@require_GET
def project_detail(request, project: str):
    slug = slugify(project)
    project_query = Project.objects.filter(is_published=True).filter(Q(slug=slug))
    if project.isdigit():
        project_query = project_query | Project.objects.filter(is_published=True, id=int(project))

    project_obj = project_query.first()

    if project_obj is None:
        raise Http404("Project not found")

    return JsonResponse(_serialize_project(project_obj, include_body=True))
