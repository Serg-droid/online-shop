from .models import FriendshipRequest, Notification, Profile, ProfileImage, Publication
from django.contrib import admin

from social_network.models import Friendship

# Register your models here.

class FriendshipInline_1(admin.TabularInline):
    model = Friendship
    fk_name = "friend_1"


@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    inlines = [FriendshipInline_1]


admin.site.register(FriendshipRequest)
admin.site.register(ProfileImage)
admin.site.register(Publication)
admin.site.register(Notification)

