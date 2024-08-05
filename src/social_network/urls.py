from django.urls import path

from . import views

app_name="social_network"
urlpatterns = [
    path("find_users/", view=views.find_users, name="find_users"),
    path("user_profile/<int:user_id>/", view=views.user_profile, name="user_profile"),
    path("send_friendship_request/<int:user_id>/", view=views.send_friendship_request, name="send_friendship_request"),
    path("accept_friendship_request/<int:user_id>/", view=views.accept_friendship_request, name="accept_friendship_request"),
    path("friends_list/", view=views.get_friends_list, name="friends_list"),
    path("my_profile/", view=views.my_profile, name="my_profile"),
    path("create_publication", view=views.create_publication, name="create_publication"),
    path("profile_images/", view=views.profile_images, name="profile_images"),
    path("process_notification/<int:notification_id>/", view=views.process_notification, name="process_notification"),
    path("go_to_chat/<int:user_id>/", view=views.go_to_chat, name="go_to_chat"),
]