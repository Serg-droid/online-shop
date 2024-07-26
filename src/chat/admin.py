from django.contrib import admin

from chat.models import ChatImage, ChatMessage

# Register your models here.

class ChatImageInline(admin.TabularInline):
    model = ChatImage

class ChatMessageAdmin(admin.ModelAdmin):
    inlines = [ChatImageInline, ]

admin.site.register(ChatMessage, ChatMessageAdmin)