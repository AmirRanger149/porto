"""Create the superuser from ADMIN_USER / ADMIN_PASSWORD env (idempotent)."""
import os

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand


class Command(BaseCommand):
    help = "Ensure the admin superuser exists (env: ADMIN_USER, ADMIN_PASSWORD)."

    def handle(self, *args, **opts):
        user_model = get_user_model()
        username = os.environ.get("ADMIN_USER", "admin")
        password = os.environ.get("ADMIN_PASSWORD", "phosphor")

        if user_model.objects.filter(username=username).exists():
            self.stdout.write(f"superuser '{username}' already exists")
            return

        user_model.objects.create_superuser(username, f"{username}@nakamura.dev", password)
        self.stdout.write(self.style.SUCCESS(f"superuser '{username}' created"))
