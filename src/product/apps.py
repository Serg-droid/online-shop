from django.apps import AppConfig
from yookassa import Configuration

class ProductConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'product'

    def ready(self) -> None:
        from . import signals

        Configuration.configure('407541', 'test_XeRG-ksWr2SC5rQa5LqTkQzOwNb8Pcftltd4-8XUH8Y')

        return super().ready()
