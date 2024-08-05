from django.db.models.signals import post_delete, post_save
from django.dispatch import receiver
from django.core.exceptions import ValidationError

from social_network.models import Friendship


@receiver(post_save, sender=Friendship)
def create_reverse_friendship_relation(sender, instance, created, **kwargs):
    if created:
        sender.objects.get_or_create(friend_1=instance.friend_2,
                                     friend_2=instance.friend_1,
                                     )


@receiver(post_delete, sender=Friendship)
def delete_reverse_friendship_relation(sender, instance, **kwargs):
    try:
        friendship = sender.objects.get(friend_1=instance.friend_2,
                                        friend_2=instance.friend_1,)
        friendship.delete()
    except:
        pass