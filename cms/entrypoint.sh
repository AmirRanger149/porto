#!/bin/sh
set -e

echo "» waiting for postgres at ${DB_HOST:-db}:${DB_PORT:-5432}"
i=0
until python - <<'PY'
import os, socket, sys
s = socket.socket()
s.settimeout(2)
try:
    s.connect((os.environ.get("DB_HOST", "db"), int(os.environ.get("DB_PORT", "5432"))))
except Exception:
    sys.exit(1)
finally:
    s.close()
PY
do
  i=$((i + 1))
  if [ "$i" -ge 30 ]; then
    echo "✗ postgres never came up" >&2
    exit 1
  fi
  sleep 2
done

echo "» migrating"
python manage.py migrate --noinput

echo "» verifying schema"
python - <<'PY'
import os
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
import django
django.setup()
from django.db import connection
tables = set(connection.introspection.table_names())
missing = [t for t in ("posts_post",) if t not in tables]
if missing:
    print(f"✗ expected tables missing after migrate: {', '.join(missing)}", flush=True)
    print("  hint: every app's migrations/ directory needs an __init__.py —", flush=True)
    print("  without it Django silently skips that app's migrations.", flush=True)
    raise SystemExit(1)
print("  schema ok: posts_post present")
PY

echo "» seeding markdown content"
python manage.py seed_posts

echo "» ensuring admin user"
python manage.py ensure_admin

echo "» starting gunicorn on :8000"
exec gunicorn config.wsgi:application \
  --bind 0.0.0.0:8000 \
  --workers 2 \
  --access-logfile - \
  --error-logfile -
