from rest_framework import serializers
from rest_framework.authentication import get_user_model

from chat.models import ChatMessage


class MessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChatMessage
        fields = ["id", "msg_from", "msg_to", "publicated_at", "text", "image", "deleted"]

    def to_representation(self, instance):
        data = super().to_representation(instance)
        if (instance.deleted):
            data["text"] = None
            data["image"] = None
        return data


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = get_user_model()
        exclude = ["password"]
        