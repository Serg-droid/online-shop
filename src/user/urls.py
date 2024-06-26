from django.urls import path

from . import views


urlpatterns = [
    path("signup/", views.sign_up, name="signup"),

    path("profile/", views.profile, name="account_profile"),
    path("edit/", views.edit_profile, name="edit_profile")
]
