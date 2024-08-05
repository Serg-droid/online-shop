from django.apps import AppConfig


class SocialNetworkConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'social_network'

    def ready(self) -> None:
        from . import signals
        return super().ready()
