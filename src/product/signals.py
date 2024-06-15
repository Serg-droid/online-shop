# from django.db.models.signals import pre_delete
from django.contrib.auth import user_logged_in
from django.contrib.sessions.models import Session
from django.db.models.signals import pre_delete
from django.dispatch import receiver
from django.utils import timezone

from .models import Basket

@receiver(pre_delete, sender=Session)
def session_deleted(instance, **kwargs):
    if (instance.expire_date < timezone.now()):
        basket_id = instance.get_decoded().get("basket_id", None)
        if basket_id:
            # Basket.objects.filter(id=basket_id, owner__isnull=True).delete()
            Basket.objects.filter(id=basket_id).delete()


@receiver(user_logged_in)
def logged_in(request, user, **kwargs):
    basket_id = request.session.get("basket_id", None)
    print("logged_in signal")
    if basket_id:
        basket = Basket.objects.get(pk=basket_id)
        Basket.objects.filter(owner=user).delete()
        basket.owner = user
        basket.save()
        del request.session["basket_id"]