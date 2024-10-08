from django.contrib.auth import get_user_model
from django.db import models

# Create your models here.

User = get_user_model()

class UserImage(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="images")
    image = models.ImageField(upload_to="user_images/")


class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    avatar = models.ImageField(upload_to="user_images/")
    is_online = models.BooleanField(default=False)