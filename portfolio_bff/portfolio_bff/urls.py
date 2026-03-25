from django.urls import path

from django.conf import settings

from content import admin_api, views as content_views

urlpatterns = [
    path("api/portfolio-content", content_views.portfolio_content, name="portfolio-content"),
    path("api/projects", content_views.projects_list, name="projects-list"),
    path("projects/<slug:project>", content_views.project_detail, name="project-detail"),
    path("api/admin/csrf", admin_api.admin_csrf, name="admin-csrf"),
    path("api/admin/session", admin_api.admin_session, name="admin-session"),
    path("api/admin/login", admin_api.admin_login, name="admin-login"),
    path("api/admin/logout", admin_api.admin_logout, name="admin-logout"),
    path("api/admin/site-settings", admin_api.admin_site_settings, name="admin-site-settings"),
    path("api/admin/pages", admin_api.admin_pages, name="admin-pages"),
    path("api/admin/pages/<int:page_id>", admin_api.admin_page_detail, name="admin-page-detail"),
    path("api/admin/projects", admin_api.admin_projects, name="admin-projects"),
    path("api/admin/projects/<int:project_id>", admin_api.admin_project_detail, name="admin-project-detail"),
    path("api/admin/stats", admin_api.admin_stats, name="admin-stats"),
    path("api/admin/stats/<int:stat_id>", admin_api.admin_stat_detail, name="admin-stat-detail"),
    path("api/admin/skills", admin_api.admin_skills, name="admin-skills"),
    path("api/admin/skills/<int:skill_id>", admin_api.admin_skill_detail, name="admin-skill-detail"),
    path("api/admin/social-links", admin_api.admin_social_links, name="admin-social-links"),
    path("api/admin/social-links/<int:link_id>", admin_api.admin_social_link_detail, name="admin-social-link-detail"),
    path("api/admin/contact-links", admin_api.admin_contact_links, name="admin-contact-links"),
    path(
        "api/admin/contact-links/<int:link_id>",
        admin_api.admin_contact_link_detail,
        name="admin-contact-link-detail",
    ),
    path("api/admin/appointments", admin_api.admin_appointments, name="admin-appointments"),
]


if settings.ENABLE_DJANGO_ADMIN:
    from django.contrib import admin

    urlpatterns = [path("admin/", admin.site.urls)] + urlpatterns
