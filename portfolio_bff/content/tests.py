from django.test import TestCase

from .models import ContactLink, Project, SiteSetting, Skill, SocialLink, Stat


class ContentApiTests(TestCase):
    def setUp(self):
        SiteSetting.objects.create(key="site.name", value="Portfolio")
        SiteSetting.objects.create(key="site.display_name", value="Nick")
        SiteSetting.objects.create(key="site.contact_email", value="hello@example.com")

        self.project = Project.objects.create(
            slug="contact-meeting-scheduler",
            title="Contact/meeting scheduler",
            description="Custom REST API",
            tags=["Django", "Next.js"],
            link="/contact",
            github="#",
            is_published=True,
            order=0,
        )
        Project.objects.create(
            slug="draft-project",
            title="Draft Project",
            description="Not live",
            tags=[],
            link="#",
            github="#",
            is_published=False,
            order=1,
        )

        Stat.objects.create(number="10+", label="Projects Built", icon="rocket", order=0)
        Skill.objects.create(name="Python/Django", order=0)
        SocialLink.objects.create(name="GitHub", url="https://github.com", icon="github", order=0)
        ContactLink.objects.create(
            icon="email",
            title="Email",
            description="hello@example.com",
            href="mailto:hello@example.com",
            order=0,
        )

    def test_portfolio_content_endpoint(self):
        response = self.client.get("/api/portfolio-content")
        self.assertEqual(response.status_code, 200)
        payload = response.json()

        self.assertEqual(payload["site"]["displayName"], "Nick")
        self.assertEqual(len(payload["projects"]), 1)
        self.assertEqual(payload["projects"][0]["slug"], self.project.slug)
        self.assertEqual(payload["stats"][0]["label"], "Projects Built")
        self.assertEqual(payload["skills"][0], "Python/Django")
        self.assertEqual(payload["socialLinks"][0]["name"], "GitHub")
        self.assertEqual(payload["contactLinks"][0]["title"], "Email")

    def test_projects_list_endpoint(self):
        response = self.client.get("/api/projects")
        self.assertEqual(response.status_code, 200)
        payload = response.json()

        self.assertEqual(len(payload["projects"]), 1)
        self.assertEqual(payload["projects"][0]["slug"], self.project.slug)

    def test_project_detail_by_slug(self):
        response = self.client.get(f"/projects/{self.project.slug}")
        self.assertEqual(response.status_code, 200)
        payload = response.json()

        self.assertEqual(payload["slug"], self.project.slug)
        self.assertEqual(payload["title"], self.project.title)

    def test_project_detail_by_id(self):
        response = self.client.get(f"/projects/{self.project.id}")
        self.assertEqual(response.status_code, 200)
        payload = response.json()

        self.assertEqual(payload["slug"], self.project.slug)

    def test_project_detail_not_found(self):
        response = self.client.get("/projects/does-not-exist")
        self.assertEqual(response.status_code, 404)
