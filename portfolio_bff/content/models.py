from django.db import models


class Page(models.Model):
    slug = models.SlugField(unique=True)
    title = models.CharField(max_length=200)
    body = models.TextField(blank=True)
    is_published = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["slug"]

    def __str__(self) -> str:
        return self.title


class SiteSetting(models.Model):
    key = models.CharField(max_length=100, unique=True)
    value = models.TextField(blank=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["key"]

    def __str__(self) -> str:
        return self.key


class Project(models.Model):
    slug = models.SlugField(unique=True)
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    body = models.TextField(blank=True)
    tags = models.JSONField(default=list, blank=True)
    link = models.CharField(max_length=500, blank=True)
    github = models.CharField(max_length=500, blank=True)
    is_featured = models.BooleanField(default=False)
    category = models.CharField(max_length=50, blank=True)
    is_published = models.BooleanField(default=True)
    order = models.PositiveIntegerField(default=0)
    published_date = models.DateField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["order", "id"]

    def __str__(self) -> str:
        return self.title


class Stat(models.Model):
    number = models.CharField(max_length=50)
    label = models.CharField(max_length=100)
    icon = models.CharField(max_length=10, blank=True)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["order", "id"]

    def __str__(self) -> str:
        return f"{self.label} ({self.number})"


class Skill(models.Model):
    name = models.CharField(max_length=100, unique=True)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["order", "id"]

    def __str__(self) -> str:
        return self.name


class SocialLink(models.Model):
    name = models.CharField(max_length=100)
    url = models.URLField()
    icon = models.CharField(max_length=50, blank=True)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["order", "id"]

    def __str__(self) -> str:
        return self.name


class ContactLink(models.Model):
    icon = models.CharField(max_length=20, blank=True)
    title = models.CharField(max_length=100)
    description = models.CharField(max_length=200, blank=True)
    href = models.CharField(max_length=500)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["order", "id"]

    def __str__(self) -> str:
        return self.title


class AppointmentEvent(models.Model):
    event_id = models.CharField(max_length=100, unique=True)
    event_type = models.CharField(max_length=100)
    occurred_at = models.DateTimeField()
    kafka_topic = models.CharField(max_length=200, blank=True)
    kafka_partition = models.IntegerField(null=True, blank=True)
    kafka_offset = models.BigIntegerField(null=True, blank=True)
    appointment_id = models.CharField(max_length=100)
    user_id = models.CharField(max_length=100, blank=True)
    start_time = models.DateTimeField()
    end_time = models.DateTimeField()
    duration_minutes = models.PositiveIntegerField(default=0)
    email = models.EmailField(blank=True)
    phone_e164 = models.CharField(max_length=30, blank=True)
    notify_email = models.BooleanField(default=False)
    notify_sms = models.BooleanField(default=False)
    payload = models.JSONField()
    received_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-occurred_at", "-id"]

    def __str__(self) -> str:
        return f"{self.event_type} ({self.event_id})"
