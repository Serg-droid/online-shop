from rest_framework import serializers
from rest_framework.authentication import get_user_model

from chat.models import ChatMessage


class MessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChatMessage
        fields = ["msg_from", "msg_to", "publicated_at", "text", "image"]


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = get_user_model()
        exclude = ["password"]
        