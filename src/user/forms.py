from django import forms
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth.models import User

from user.models import UserImage


class SignupForm(UserCreationForm):
    class Meta:
        model = User
        fields = ["username", "password1", "password2"]

UserImageFormSet = forms.inlineformset_factory(parent_model=User, model=UserImage, fields=["image"])

class EditProfileForm(forms.ModelForm):

    class Meta:
        model = User
        fields = ["first_name", "last_name", "username", "email"]