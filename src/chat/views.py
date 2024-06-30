import json
from django.contrib.auth import get_user_model
from django.contrib.auth.decorators import login_required
from django.contrib.auth.models import AnonymousUser
from django.core import serializers
from django.core.serializers.json import DjangoJSONEncoder
from django.db.models import F, Q
from django.forms import model_to_dict
from django.http import Http404, HttpResponse, JsonResponse
from django.shortcuts import get_object_or_404, render
from django.views.decorators.csrf import csrf_exempt
from requests import HTTPError

from rest_framework.authentication import TokenAuthentication
from rest_framework.decorators import api_view, authentication_classes, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.renderers import JSONRenderer

from chat.serializers import MessageSerializer, UserSerializer

from .models import ChatMessage

# Create your views here.

User = get_user_model()


@login_required()
def open_chat(request, user_id):
    messages = ChatMessage.objects.filter(Q(msg_from=request.user, msg_to=user_id) | Q(msg_from=user_id, msg_to=request.user))
    if user_id == request.user.pk:
        raise HTTPError(404)
    
    companion = get_object_or_404(User, pk=user_id)

    message_data = MessageSerializer(messages, many=True)
    companion_data = UserSerializer(companion)
    data = {
        "messages": message_data.data,
        "companion": companion_data.data,
    }    
    # data = JSONRenderer().render({"messages":messages, "companion":companion})
    response = render(request, "chat/index.html", {"messages":messages, "companion":companion, "data":data})
    response.set_cookie(key="secret_key", value=request.user.id)
    return response


@api_view(["GET"])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def get_chat_data(request, companion_id):
    if companion_id == request.user.pk:
        raise Http404
    
    messages = ChatMessage.objects.filter(Q(msg_from=request.user, msg_to=companion_id) | Q(msg_from=companion_id, msg_to=request.user))
    companion = get_object_or_404(User, pk=companion_id)

    message_data = MessageSerializer(messages, many=True)
    companion_data = UserSerializer(companion)
    data = {
        "messages": message_data.data,
        "companion": companion_data.data,
    }    
    return JsonResponse(data)


@api_view(["GET"])
@authentication_classes([TokenAuthentication])
def is_authed(request):
    if (isinstance(request.user, AnonymousUser)):
        return JsonResponse(data={"ok": False})
    return JsonResponse(data={"ok": True, "user_id": request.user.id})


@api_view(["POST"])
@csrf_exempt
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def send_message(request):
    data = json.loads(request.body)
    companion = get_object_or_404(User, pk=data.get("companion_id"))
    message_text = data.get("message")
    message = ChatMessage(msg_from=request.user, msg_to=companion, text=message_text)
    message.save()

    return JsonResponse(model_to_dict(message))    


@api_view(["GET"])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def chat_list(request):
    users = User.objects.exclude(id=request.user.id).values(companion_username=F("username"), companion_id=F("id"))
    return JsonResponse(list(users), safe=False)


def _get_user_from_secret_key(secret_key):
    return User.objects.get(pk=secret_key)


def error_404(request, exception=None):
    return JsonResponse({ "error": 404 })