from __future__ import annotations

import json
from typing import Any

from django.conf import settings
from django.contrib.auth import authenticate, login, logout
from django.http import HttpResponse, JsonResponse
from django.middleware.csrf import get_token
from django.utils.text import slugify
from django.views.decorators.csrf import ensure_csrf_cookie
from django.views.decorators.http import require_http_methods

from .models import (
    AppointmentEvent,
    ContactLink,
    Page,
    Project,
    SiteSetting,
    Skill,
    SocialLink,
    Stat,
)


ADMIN_CORS_HEADERS = "Content-Type, X-CSRFToken"
ADMIN_CORS_METHODS = "GET, POST, PUT, PATCH, DELETE, OPTIONS"


def _allowed_admin_origins() -> set[str]:
    origins = getattr(settings, "ADMIN_UI_ORIGINS", [])
    return set(origins or [])


def _apply_admin_cors(response: HttpResponse, request) -> HttpResponse:
    origin = request.headers.get("Origin")
    allowed = _allowed_admin_origins()
    if origin and origin in allowed:
        response["Access-Control-Allow-Origin"] = origin
        response["Access-Control-Allow-Credentials"] = "true"
        response["Access-Control-Allow-Headers"] = ADMIN_CORS_HEADERS
        response["Access-Control-Allow-Methods"] = ADMIN_CORS_METHODS
        response["Vary"] = "Origin"
    return response


def _admin_preflight(request) -> HttpResponse:
    response = HttpResponse(status=204)
    return _apply_admin_cors(response, request)


def _error_response(message: str | list[str], status: int = 400, request=None) -> JsonResponse:
    errors = message if isinstance(message, list) else [message]
    response = JsonResponse({"errors": errors}, status=status)
    return _apply_admin_cors(response, request) if request else response


def _parse_json(request) -> tuple[dict[str, Any] | None, JsonResponse | None]:
    try:
        payload = json.loads(request.body or b"{}")
    except json.JSONDecodeError:
        return None, _error_response("Invalid JSON payload.", status=400, request=request)
    if not isinstance(payload, dict):
        return None, _error_response("JSON body must be an object.", status=400, request=request)
    return payload, None


def _require_admin(request) -> JsonResponse | None:
    if not request.user.is_authenticated:
        return _error_response("Authentication required.", status=401, request=request)
    if not request.user.is_staff:
        return _error_response("Admin access required.", status=403, request=request)
    return None


def _serialize_user(user) -> dict[str, Any]:
    return {
        "id": user.id,
        "username": user.username,
        "email": user.email,
        "isStaff": user.is_staff,
        "isSuperuser": user.is_superuser,
    }


def _serialize_page(page: Page) -> dict[str, Any]:
    return {
        "id": page.id,
        "slug": page.slug,
        "title": page.title,
        "body": page.body,
        "isPublished": page.is_published,
        "createdAt": page.created_at.isoformat(),
        "updatedAt": page.updated_at.isoformat(),
    }


def _serialize_project(project: Project) -> dict[str, Any]:
    return {
        "id": project.id,
        "slug": project.slug,
        "title": project.title,
        "description": project.description,
        "body": project.body,
        "tags": project.tags or [],
        "link": project.link,
        "github": project.github,
        "isFeatured": project.is_featured,
        "category": project.category,
        "isPublished": project.is_published,
        "order": project.order,
        "publishedDate": project.published_date.isoformat() if project.published_date else None,
        "createdAt": project.created_at.isoformat(),
        "updatedAt": project.updated_at.isoformat(),
    }


def _serialize_stat(stat: Stat) -> dict[str, Any]:
    return {
        "id": stat.id,
        "number": stat.number,
        "label": stat.label,
        "icon": stat.icon,
        "order": stat.order,
    }


def _serialize_skill(skill: Skill) -> dict[str, Any]:
    return {
        "id": skill.id,
        "name": skill.name,
        "order": skill.order,
    }


def _serialize_social_link(link: SocialLink) -> dict[str, Any]:
    return {
        "id": link.id,
        "name": link.name,
        "url": link.url,
        "icon": link.icon,
        "order": link.order,
    }


def _serialize_contact_link(link: ContactLink) -> dict[str, Any]:
    return {
        "id": link.id,
        "icon": link.icon,
        "title": link.title,
        "description": link.description,
        "href": link.href,
        "order": link.order,
    }


def _serialize_site_setting(setting: SiteSetting) -> dict[str, Any]:
    return {
        "id": setting.id,
        "key": setting.key,
        "value": setting.value,
    }


def _serialize_appointment(event: AppointmentEvent) -> dict[str, Any]:
    return {
        "id": event.id,
        "eventId": event.event_id,
        "eventType": event.event_type,
        "occurredAt": event.occurred_at.isoformat(),
        "appointmentId": event.appointment_id,
        "userId": event.user_id,
        "startTime": event.start_time.isoformat(),
        "endTime": event.end_time.isoformat(),
        "durationMinutes": event.duration_minutes,
        "email": event.email,
        "phoneE164": event.phone_e164,
        "notifyEmail": event.notify_email,
        "notifySms": event.notify_sms,
        "kafkaTopic": event.kafka_topic,
        "kafkaPartition": event.kafka_partition,
        "kafkaOffset": event.kafka_offset,
        "receivedAt": event.received_at.isoformat(),
    }


def _unique_slug(model, base_slug: str, instance_id: int | None = None) -> str:
    slug = base_slug
    suffix = 1
    while model.objects.filter(slug=slug).exclude(id=instance_id).exists():
        slug = f"{base_slug}-{suffix}"
        suffix += 1
    return slug


@require_http_methods(["GET", "OPTIONS"])
@ensure_csrf_cookie
def admin_csrf(request):
    if request.method == "OPTIONS":
        return _admin_preflight(request)
    token = get_token(request)
    response = JsonResponse({"csrfToken": token})
    return _apply_admin_cors(response, request)


@require_http_methods(["GET", "OPTIONS"])
def admin_session(request):
    if request.method == "OPTIONS":
        return _admin_preflight(request)
    if not request.user.is_authenticated:
        response = JsonResponse({"authenticated": False})
        return _apply_admin_cors(response, request)
    response = JsonResponse({"authenticated": True, "user": _serialize_user(request.user)})
    return _apply_admin_cors(response, request)


@require_http_methods(["POST", "OPTIONS"])
def admin_login(request):
    if request.method == "OPTIONS":
        return _admin_preflight(request)
    payload, error = _parse_json(request)
    if error:
        return error
    username = payload.get("username", "")
    password = payload.get("password", "")
    user = authenticate(request, username=username, password=password)
    if user is None:
        return _error_response("Invalid username or password.", status=401, request=request)
    if not user.is_staff:
        return _error_response("Admin access required.", status=403, request=request)
    login(request, user)
    response = JsonResponse({"authenticated": True, "user": _serialize_user(user)})
    return _apply_admin_cors(response, request)


@require_http_methods(["POST", "OPTIONS"])
def admin_logout(request):
    if request.method == "OPTIONS":
        return _admin_preflight(request)
    logout(request)
    response = JsonResponse({"ok": True})
    return _apply_admin_cors(response, request)


@require_http_methods(["GET", "POST", "OPTIONS"])
def admin_site_settings(request):
    if request.method == "OPTIONS":
        return _admin_preflight(request)
    auth_error = _require_admin(request)
    if auth_error:
        return auth_error
    if request.method == "GET":
        settings_list = [_serialize_site_setting(setting) for setting in SiteSetting.objects.all()]
        response = JsonResponse({"settings": settings_list})
        return _apply_admin_cors(response, request)

    payload, error = _parse_json(request)
    if error:
        return error

    items: list[dict[str, Any]] = []
    if "settings" in payload and isinstance(payload["settings"], list):
        items = payload["settings"]
    else:
        items = [{"key": key, "value": value} for key, value in payload.items()]

    updated = []
    for item in items:
        key = str(item.get("key", "")).strip()
        if not key:
            continue
        value = str(item.get("value", ""))
        setting, _ = SiteSetting.objects.update_or_create(key=key, defaults={"value": value})
        updated.append(_serialize_site_setting(setting))

    response = JsonResponse({"settings": updated})
    return _apply_admin_cors(response, request)


@require_http_methods(["GET", "POST", "OPTIONS"])
def admin_pages(request):
    if request.method == "OPTIONS":
        return _admin_preflight(request)
    auth_error = _require_admin(request)
    if auth_error:
        return auth_error

    if request.method == "GET":
        pages = [_serialize_page(page) for page in Page.objects.all()]
        response = JsonResponse({"pages": pages})
        return _apply_admin_cors(response, request)

    payload, error = _parse_json(request)
    if error:
        return error

    title = str(payload.get("title", "")).strip()
    if not title:
        return _error_response("title is required.", request=request)
    slug_input = str(payload.get("slug", "")).strip() or slugify(title)
    slug_value = _unique_slug(Page, slug_input)
    page = Page.objects.create(
        title=title,
        slug=slug_value,
        body=payload.get("body", "") or "",
        is_published=bool(payload.get("isPublished", True)),
    )
    response = JsonResponse({"page": _serialize_page(page)})
    return _apply_admin_cors(response, request)


@require_http_methods(["GET", "PUT", "PATCH", "DELETE", "OPTIONS"])
def admin_page_detail(request, page_id: int):
    if request.method == "OPTIONS":
        return _admin_preflight(request)
    auth_error = _require_admin(request)
    if auth_error:
        return auth_error

    page = Page.objects.filter(id=page_id).first()
    if page is None:
        return _error_response("Page not found.", status=404, request=request)

    if request.method == "GET":
        response = JsonResponse({"page": _serialize_page(page)})
        return _apply_admin_cors(response, request)
    if request.method == "DELETE":
        page.delete()
        response = JsonResponse({"ok": True})
        return _apply_admin_cors(response, request)

    payload, error = _parse_json(request)
    if error:
        return error

    if "title" in payload:
        page.title = str(payload["title"]).strip()
    if "slug" in payload:
        slug_input = str(payload["slug"]).strip()
        if slug_input:
            page.slug = _unique_slug(Page, slug_input, instance_id=page.id)
    if "body" in payload:
        page.body = payload.get("body", "") or ""
    if "isPublished" in payload:
        page.is_published = bool(payload["isPublished"])

    page.save()
    response = JsonResponse({"page": _serialize_page(page)})
    return _apply_admin_cors(response, request)


@require_http_methods(["GET", "POST", "OPTIONS"])
def admin_projects(request):
    if request.method == "OPTIONS":
        return _admin_preflight(request)
    auth_error = _require_admin(request)
    if auth_error:
        return auth_error

    if request.method == "GET":
        projects = [_serialize_project(project) for project in Project.objects.all()]
        response = JsonResponse({"projects": projects})
        return _apply_admin_cors(response, request)

    payload, error = _parse_json(request)
    if error:
        return error

    title = str(payload.get("title", "")).strip()
    if not title:
        return _error_response("title is required.", request=request)
    slug_input = str(payload.get("slug", "")).strip() or slugify(title)
    slug_value = _unique_slug(Project, slug_input)

    tags = payload.get("tags", []) or []
    if isinstance(tags, str):
        tags = [tag.strip() for tag in tags.split(",") if tag.strip()]

    project = Project.objects.create(
        title=title,
        slug=slug_value,
        description=payload.get("description", "") or "",
        body=payload.get("body", "") or "",
        tags=tags,
        link=payload.get("link", "") or "",
        github=payload.get("github", "") or "",
        is_featured=bool(payload.get("isFeatured", False)),
        category=payload.get("category", "") or "",
        is_published=bool(payload.get("isPublished", True)),
        order=int(payload.get("order") or 0),
    )
    response = JsonResponse({"project": _serialize_project(project)})
    return _apply_admin_cors(response, request)


@require_http_methods(["GET", "PUT", "PATCH", "DELETE", "OPTIONS"])
def admin_project_detail(request, project_id: int):
    if request.method == "OPTIONS":
        return _admin_preflight(request)
    auth_error = _require_admin(request)
    if auth_error:
        return auth_error

    project = Project.objects.filter(id=project_id).first()
    if project is None:
        return _error_response("Project not found.", status=404, request=request)

    if request.method == "GET":
        response = JsonResponse({"project": _serialize_project(project)})
        return _apply_admin_cors(response, request)
    if request.method == "DELETE":
        project.delete()
        response = JsonResponse({"ok": True})
        return _apply_admin_cors(response, request)

    payload, error = _parse_json(request)
    if error:
        return error

    if "title" in payload:
        project.title = str(payload["title"]).strip()
    if "slug" in payload:
        slug_input = str(payload["slug"]).strip()
        if slug_input:
            project.slug = _unique_slug(Project, slug_input, instance_id=project.id)
    if "description" in payload:
        project.description = payload.get("description", "") or ""
    if "body" in payload:
        project.body = payload.get("body", "") or ""
    if "tags" in payload:
        tags = payload.get("tags", []) or []
        if isinstance(tags, str):
            tags = [tag.strip() for tag in tags.split(",") if tag.strip()]
        project.tags = tags
    if "link" in payload:
        project.link = payload.get("link", "") or ""
    if "github" in payload:
        project.github = payload.get("github", "") or ""
    if "isFeatured" in payload:
        project.is_featured = bool(payload["isFeatured"])
    if "category" in payload:
        project.category = payload.get("category", "") or ""
    if "isPublished" in payload:
        project.is_published = bool(payload["isPublished"])
    if "order" in payload:
        project.order = int(payload.get("order") or 0)
    if "publishedDate" in payload:
        project.published_date = payload["publishedDate"] or None

    project.save()
    response = JsonResponse({"project": _serialize_project(project)})
    return _apply_admin_cors(response, request)


@require_http_methods(["GET", "POST", "OPTIONS"])
def admin_stats(request):
    if request.method == "OPTIONS":
        return _admin_preflight(request)
    auth_error = _require_admin(request)
    if auth_error:
        return auth_error

    if request.method == "GET":
        stats = [_serialize_stat(stat) for stat in Stat.objects.all()]
        response = JsonResponse({"stats": stats})
        return _apply_admin_cors(response, request)

    payload, error = _parse_json(request)
    if error:
        return error

    number = str(payload.get("number", "")).strip()
    label = str(payload.get("label", "")).strip()
    if not number or not label:
        return _error_response("number and label are required.", request=request)

    stat = Stat.objects.create(
        number=number,
        label=label,
        icon=payload.get("icon", "") or "",
        order=int(payload.get("order") or 0),
    )
    response = JsonResponse({"stat": _serialize_stat(stat)})
    return _apply_admin_cors(response, request)


@require_http_methods(["GET", "PUT", "PATCH", "DELETE", "OPTIONS"])
def admin_stat_detail(request, stat_id: int):
    if request.method == "OPTIONS":
        return _admin_preflight(request)
    auth_error = _require_admin(request)
    if auth_error:
        return auth_error

    stat = Stat.objects.filter(id=stat_id).first()
    if stat is None:
        return _error_response("Stat not found.", status=404, request=request)

    if request.method == "GET":
        response = JsonResponse({"stat": _serialize_stat(stat)})
        return _apply_admin_cors(response, request)
    if request.method == "DELETE":
        stat.delete()
        response = JsonResponse({"ok": True})
        return _apply_admin_cors(response, request)

    payload, error = _parse_json(request)
    if error:
        return error

    if "number" in payload:
        stat.number = str(payload["number"]).strip()
    if "label" in payload:
        stat.label = str(payload["label"]).strip()
    if "icon" in payload:
        stat.icon = payload.get("icon", "") or ""
    if "order" in payload:
        stat.order = int(payload.get("order") or 0)

    stat.save()
    response = JsonResponse({"stat": _serialize_stat(stat)})
    return _apply_admin_cors(response, request)


@require_http_methods(["GET", "POST", "OPTIONS"])
def admin_skills(request):
    if request.method == "OPTIONS":
        return _admin_preflight(request)
    auth_error = _require_admin(request)
    if auth_error:
        return auth_error

    if request.method == "GET":
        skills = [_serialize_skill(skill) for skill in Skill.objects.all()]
        response = JsonResponse({"skills": skills})
        return _apply_admin_cors(response, request)

    payload, error = _parse_json(request)
    if error:
        return error

    name = str(payload.get("name", "")).strip()
    if not name:
        return _error_response("name is required.", request=request)

    skill = Skill.objects.create(name=name, order=int(payload.get("order") or 0))
    response = JsonResponse({"skill": _serialize_skill(skill)})
    return _apply_admin_cors(response, request)


@require_http_methods(["GET", "PUT", "PATCH", "DELETE", "OPTIONS"])
def admin_skill_detail(request, skill_id: int):
    if request.method == "OPTIONS":
        return _admin_preflight(request)
    auth_error = _require_admin(request)
    if auth_error:
        return auth_error

    skill = Skill.objects.filter(id=skill_id).first()
    if skill is None:
        return _error_response("Skill not found.", status=404, request=request)

    if request.method == "GET":
        response = JsonResponse({"skill": _serialize_skill(skill)})
        return _apply_admin_cors(response, request)
    if request.method == "DELETE":
        skill.delete()
        response = JsonResponse({"ok": True})
        return _apply_admin_cors(response, request)

    payload, error = _parse_json(request)
    if error:
        return error

    if "name" in payload:
        skill.name = str(payload["name"]).strip()
    if "order" in payload:
        skill.order = int(payload.get("order") or 0)

    skill.save()
    response = JsonResponse({"skill": _serialize_skill(skill)})
    return _apply_admin_cors(response, request)


@require_http_methods(["GET", "POST", "OPTIONS"])
def admin_social_links(request):
    if request.method == "OPTIONS":
        return _admin_preflight(request)
    auth_error = _require_admin(request)
    if auth_error:
        return auth_error

    if request.method == "GET":
        links = [_serialize_social_link(link) for link in SocialLink.objects.all()]
        response = JsonResponse({"socialLinks": links})
        return _apply_admin_cors(response, request)

    payload, error = _parse_json(request)
    if error:
        return error

    name = str(payload.get("name", "")).strip()
    url = str(payload.get("url", "")).strip()
    if not name or not url:
        return _error_response("name and url are required.", request=request)

    link = SocialLink.objects.create(
        name=name,
        url=url,
        icon=payload.get("icon", "") or "",
        order=int(payload.get("order") or 0),
    )
    response = JsonResponse({"socialLink": _serialize_social_link(link)})
    return _apply_admin_cors(response, request)


@require_http_methods(["GET", "PUT", "PATCH", "DELETE", "OPTIONS"])
def admin_social_link_detail(request, link_id: int):
    if request.method == "OPTIONS":
        return _admin_preflight(request)
    auth_error = _require_admin(request)
    if auth_error:
        return auth_error

    link = SocialLink.objects.filter(id=link_id).first()
    if link is None:
        return _error_response("Social link not found.", status=404, request=request)

    if request.method == "GET":
        response = JsonResponse({"socialLink": _serialize_social_link(link)})
        return _apply_admin_cors(response, request)
    if request.method == "DELETE":
        link.delete()
        response = JsonResponse({"ok": True})
        return _apply_admin_cors(response, request)

    payload, error = _parse_json(request)
    if error:
        return error

    if "name" in payload:
        link.name = str(payload["name"]).strip()
    if "url" in payload:
        link.url = str(payload["url"]).strip()
    if "icon" in payload:
        link.icon = payload.get("icon", "") or ""
    if "order" in payload:
        link.order = int(payload.get("order") or 0)

    link.save()
    response = JsonResponse({"socialLink": _serialize_social_link(link)})
    return _apply_admin_cors(response, request)


@require_http_methods(["GET", "POST", "OPTIONS"])
def admin_contact_links(request):
    if request.method == "OPTIONS":
        return _admin_preflight(request)
    auth_error = _require_admin(request)
    if auth_error:
        return auth_error

    if request.method == "GET":
        links = [_serialize_contact_link(link) for link in ContactLink.objects.all()]
        response = JsonResponse({"contactLinks": links})
        return _apply_admin_cors(response, request)

    payload, error = _parse_json(request)
    if error:
        return error

    title = str(payload.get("title", "")).strip()
    href = str(payload.get("href", "")).strip()
    if not title or not href:
        return _error_response("title and href are required.", request=request)

    link = ContactLink.objects.create(
        icon=payload.get("icon", "") or "",
        title=title,
        description=payload.get("description", "") or "",
        href=href,
        order=int(payload.get("order") or 0),
    )
    response = JsonResponse({"contactLink": _serialize_contact_link(link)})
    return _apply_admin_cors(response, request)


@require_http_methods(["GET", "PUT", "PATCH", "DELETE", "OPTIONS"])
def admin_contact_link_detail(request, link_id: int):
    if request.method == "OPTIONS":
        return _admin_preflight(request)
    auth_error = _require_admin(request)
    if auth_error:
        return auth_error

    link = ContactLink.objects.filter(id=link_id).first()
    if link is None:
        return _error_response("Contact link not found.", status=404, request=request)

    if request.method == "GET":
        response = JsonResponse({"contactLink": _serialize_contact_link(link)})
        return _apply_admin_cors(response, request)
    if request.method == "DELETE":
        link.delete()
        response = JsonResponse({"ok": True})
        return _apply_admin_cors(response, request)

    payload, error = _parse_json(request)
    if error:
        return error

    if "icon" in payload:
        link.icon = payload.get("icon", "") or ""
    if "title" in payload:
        link.title = str(payload["title"]).strip()
    if "description" in payload:
        link.description = payload.get("description", "") or ""
    if "href" in payload:
        link.href = str(payload["href"]).strip()
    if "order" in payload:
        link.order = int(payload.get("order") or 0)

    link.save()
    response = JsonResponse({"contactLink": _serialize_contact_link(link)})
    return _apply_admin_cors(response, request)


@require_http_methods(["GET", "OPTIONS"])
def admin_appointments(request):
    if request.method == "OPTIONS":
        return _admin_preflight(request)
    auth_error = _require_admin(request)
    if auth_error:
        return auth_error

    limit = int(request.GET.get("limit", "100") or 100)
    events = AppointmentEvent.objects.all()[:limit]
    response = JsonResponse({"appointments": [_serialize_appointment(event) for event in events]})
    return _apply_admin_cors(response, request)
