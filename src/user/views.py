from django.http import HttpResponse
from django.shortcuts import redirect, render

from .forms import SignupForm

# Create your views here.


def sign_up(request):
    if request.method == "POST":
        form = SignupForm(request.POST)
        if (form.is_valid()):
            form.save()
            return redirect("login")
    else:
        form = SignupForm()

    return render(request, "registration/signup.html", { "form" : form })
