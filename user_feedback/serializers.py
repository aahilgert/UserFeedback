from rest_framework import serializers
from .models import (
    Feedback
)


class FeedbackSerializer(serializers.ModelSerializer):

    class Meta:
        model = Feedback
        fields = [
            "id",
            "rating",
            "text",
            "created_on",
            "author",
            "url",
            "type",
        ]

    def create(self, validated_data):
        return Feedback.objects.create(
            author=validated_data['author'],
            rating=validated_data['rating'],
            text=validated_data['text'],
            url=validated_data['url'],
            type=validated_data['type'],
        )
