from django.urls import include, path
from rest_framework.routers import DefaultRouter

from rest_framework.authtoken.views import obtain_auth_token

from . import views


router = DefaultRouter()

handler404 = views.error_404

app_name = "chat"
urlpatterns = [
    path("open_chat/<int:user_id>", views.open_chat, name="open_chat"),
    path("send_message/", views.send_message, name="send_message"),
    path("alter_message/", views.alter_message, name="alter_message"),
    path("delete_message/", views.delete_message, name="delete_message"),
    path("list/", views.chat_list),

    path('api-token-auth/', obtain_auth_token),
    path("is_authed/", views.is_authed),
    path("<int:companion_id>/", views.get_chat_data),
    path("api/", include(router.urls)),
]
