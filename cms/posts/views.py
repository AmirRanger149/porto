from django.http import JsonResponse
from rest_framework import viewsets

from .models import Post
from .serializers import PostSerializer


class PostViewSet(viewsets.ReadOnlyModelViewSet):
    """Public, read-only. Writing happens in the Django admin."""

    queryset = Post.objects.filter(published=True)
    serializer_class = PostSerializer
    lookup_field = "slug"


def health(_request):
    return JsonResponse(
        {
            "status": "online",
            "service": "portfolio-cms",
            "posts": Post.objects.filter(published=True).count(),
        }
    )
