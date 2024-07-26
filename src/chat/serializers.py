from rest_framework import serializers
from rest_framework.authentication import get_user_model

from chat.models import ChatMessage
from user.models import Profile


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
        data["online"] = True
        return data