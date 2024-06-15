from django.urls import path

from . import views


urlpatterns = [
    path("signUp/", views.sign_up, name="signup")
]
