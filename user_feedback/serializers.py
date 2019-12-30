from rest_framework import serializers
from .models import Feedback, User


class FeedbackSerializer(serializers.ModelSerializer):
    class Meta:
        model = Feedback
        fields = ["id", "rating", "text", "created_on", "author", "url", "type"]

    def create(self, validated_data):
        return Feedback.objects.create(
            author=User.objects.get(pk=self.initial_data["author"]),
            rating=validated_data["rating"],
            text=validated_data["text"],
            url=validated_data["url"],
            type=validated_data["type"],
        )
