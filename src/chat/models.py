from django.contrib.auth import get_user_model
from django.db import models
from datetime import datetime
# Create your models here.

User = get_user_model()


class ChatMessage(models.Model):
    msg_from = models.ForeignKey(User, on_delete=models.SET_NULL, related_name="outgoing_messages", null=True)
    msg_to = models.ForeignKey(User, on_delete=models.SET_NULL, related_name="incoming_messages", null=True)
    publicated_at = models.DateTimeField(default=datetime.now, blank=True)
    text = models.TextField()


    def __str__(self) -> str:
        return f"From: {self.msg_from}. To: {self.msg_to}"

