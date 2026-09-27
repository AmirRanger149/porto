# syntax=docker/dockerfile:1
# Portfolio CMS — Django + DRF + gunicorn.
# Build context is the repo root (see compose.yaml) so the markdown
# content can be copied in for seeding.
FROM python:3.12-slim

WORKDIR /app
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

COPY cms/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY cms/ .
COPY src/content/posts/ ./content/

RUN DJANGO_SECRET_KEY=build-time python manage.py collectstatic --noinput

EXPOSE 8000
CMD ["sh", "entrypoint.sh"]
