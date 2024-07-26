from django.db.models.signals import post_save
from django.dispatch import receiver
from rest_framework.authentication import get_user_model

from user.models import Profile

User = get_user_model()

@receiver(post_save, sender=User)
def update_profile_signal(sender, instance, created, **kwargs):
    if created:
        Profile.objects.create(user=instance)
    instance.profile.save()