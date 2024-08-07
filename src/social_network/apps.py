from django.apps import AppConfig
from django.db.models import CharField
from django.db.models.functions import Length


class SocialNetworkConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'social_network'

    def ready(self) -> None:
        from . import signals
        return super().ready()
    
