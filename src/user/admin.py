from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from rest_framework.authentication import get_user_model

from user.models import Profile, UserImage

# Register your models here.

User = get_user_model()

class ProfileInline(admin.StackedInline):
    model = Profile

class CustomUserAdmin(UserAdmin):
    inlines = UserAdmin.inlines + (ProfileInline, )

admin.site.register(UserImage)

admin.site.unregister(User)
admin.site.register(User, CustomUserAdmin)
