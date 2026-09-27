import datetime

from django.contrib import admin

from .models import Post


@admin.register(Post)
class PostAdmin(admin.ModelAdmin):
    list_display = ("title", "slug", "date", "published", "updated_at")
    list_filter = ("published", "date")
    list_editable = ("published",)
    search_fields = ("title", "slug", "abstract", "body")
    prepopulated_fields = {"slug": ("title",)}
    date_hierarchy = "date"
    ordering = ("-date",)
    fieldsets = (
        (None, {"fields": ("title", "slug", "date", "tags", "published")}),
        ("Content", {"fields": ("abstract", "body")}),
    )

    def get_changeform_initial_data(self, request):
        return {"date": datetime.date.today().isoformat()}
