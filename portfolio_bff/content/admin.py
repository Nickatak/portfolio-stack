from django.contrib import admin

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


@admin.register(Page)
class PageAdmin(admin.ModelAdmin):
    list_display = ("slug", "title", "is_published", "updated_at")
    list_filter = ("is_published",)
    search_fields = ("slug", "title")
    ordering = ("slug",)


@admin.register(SiteSetting)
class SiteSettingAdmin(admin.ModelAdmin):
    list_display = ("key", "updated_at")
    search_fields = ("key",)
    ordering = ("key",)


@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ("title", "slug", "is_published", "order", "updated_at")
    list_filter = ("is_published",)
    search_fields = ("title", "slug")
    ordering = ("order", "id")


@admin.register(Stat)
class StatAdmin(admin.ModelAdmin):
    list_display = ("label", "number", "order")
    ordering = ("order", "id")


@admin.register(Skill)
class SkillAdmin(admin.ModelAdmin):
    list_display = ("name", "order")
    search_fields = ("name",)
    ordering = ("order", "id")


@admin.register(SocialLink)
class SocialLinkAdmin(admin.ModelAdmin):
    list_display = ("name", "url", "order")
    ordering = ("order", "id")


@admin.register(ContactLink)
class ContactLinkAdmin(admin.ModelAdmin):
    list_display = ("title", "href", "order")
    ordering = ("order", "id")


@admin.register(AppointmentEvent)
class AppointmentEventAdmin(admin.ModelAdmin):
    list_display = (
        "event_id",
        "appointment_id",
        "event_type",
        "email",
        "occurred_at",
        "start_time",
        "notify_email",
        "notify_sms",
    )
    search_fields = ("event_id", "appointment_id", "email")
    ordering = ("-occurred_at", "-id")
