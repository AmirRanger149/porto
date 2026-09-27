from rest_framework import serializers

from .models import Post


class PostSerializer(serializers.ModelSerializer):
    read_min = serializers.SerializerMethodField()

    class Meta:
        model = Post
        fields = ["slug", "title", "date", "tags", "abstract", "body", "read_min", "updated_at"]

    def get_read_min(self, obj: Post) -> int:
        words = len(obj.body.split())
        return max(1, round(words / 200))
