import json
import re
from django.contrib.auth import get_user_model
from django.contrib.auth.decorators import login_required
from django.core.serializers.json import DjangoJSONEncoder
from django.forms import inlineformset_factory, model_to_dict
from django.http import HttpResponseRedirect
from django.shortcuts import redirect, render
from django.urls import reverse

from user.models import UserImage

from .forms import EditProfileForm, SignupForm, UserImageFormSet

# Create your views here.


def sign_up(request):
    if request.method == "POST":
        form = SignupForm(request.POST)
        if (form.is_valid()):
            form.save()
            return redirect("login")
    else:
        form = SignupForm()

    return render(request, "registration/signup.html", {"form": form})


@login_required()
def profile(request):
    user = request.user
    user_json = json.dumps(model_to_dict(
        user), indent=4, cls=DjangoJSONEncoder)
    return render(request, "user/profile.html", {"user_json": user_json, "user": user})


@login_required()
def edit_profile(request):
    user = request.user
    if request.method == "POST":
        form = EditProfileForm(request.POST, instance=user)
        image_formset = UserImageFormSet(request.POST, request.FILES, instance=user)
        if form.is_valid() and image_formset.is_valid():
            form.save(commit=True)
            image_formset.save()
            print(image_formset.data)
            return HttpResponseRedirect(reverse("account_profile"))
        else:
            return render(request, "user/edit_profile.html", { "form":form, "image_formset":image_formset })
    elif request.method == "GET":
        form = EditProfileForm(instance=user)
        image_formset = UserImageFormSet(instance=user)
        return render(request, "user/edit_profile.html", { "form":form, "image_formset":image_formset })
    else:
        raise "What a hell?"
    

