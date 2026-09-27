from django.urls import path
from rest_framework.routers import DefaultRouter

from .views import PostViewSet, health

router = DefaultRouter()
router.register("posts", PostViewSet, basename="post")

urlpatterns = [path("health/", health)] + router.urls
