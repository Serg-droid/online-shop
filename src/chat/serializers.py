from rest_framework import serializers
from rest_framework.authentication import get_user_model

from chat.models import ChatImage, ChatMessage
from user.models import Profile


class ChatImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChatImage
        fields = ["image"]

class MessageSerializer(serializers.ModelSerializer):
    chatimage_set = ChatImageSerializer(many=True)

    class Meta:
        model = ChatMessage
        fields = ["id", "msg_from", "msg_to", "publicated_at", "text", "deleted", "created_at", "chatimage_set"]

    def to_representation(self, instance):
        data = super().to_representation(instance)
        if (instance.deleted):
            data["text"] = None
            data["chatimage_set"] = []
        return data
    

class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = Profile
        fields = "__all__"


class UserSerializer(serializers.ModelSerializer):
    profile = ProfileSerializer()

    class Meta:
        model = get_user_model()
        exclude = ["password"]
        
    def to_representation(self, instance):
        data = super().to_representation(instance)
        return data