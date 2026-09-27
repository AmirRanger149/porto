from django.db import models


class Post(models.Model):
    """One decrypted log entry. Body is markdown; the frontend renders it."""

    title = models.CharField(max_length=200)
    slug = models.SlugField(max_length=120, unique=True)
    date = models.DateField(db_index=True)
    tags = models.JSONField(default=list, blank=True)
    abstract = models.TextField(blank=True, default="")
    body = models.TextField(help_text="Markdown. Headings, lists and fenced code blocks render in phosphor.")
    published = models.BooleanField(default=True, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-date", "-id"]

    def __str__(self):
        return f"0x{self.pk:02x} {self.title}"
