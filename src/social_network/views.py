from django.contrib.auth.decorators import login_required
from django.forms import inlineformset_factory
from django.http import HttpResponse, HttpResponseRedirect, HttpResponseServerError
from django.shortcuts import get_object_or_404, redirect, render
from django.urls import reverse
from django.views.decorators.http import require_GET, require_POST, require_http_methods
from rest_framework.authentication import get_user_model
from rest_framework.authtoken.models import Token

from social_network.decorators import use_notifications
from social_network.forms import CommunityForm
from social_network.models import Community, CommunityMember, CommunityMemberStatus, Friendship, FriendshipRequest, FriendshipRequestStatus, Notification, Profile, ProfileImage, Publication

User = get_user_model()

# Create your views here.


@login_required
def find_users(request):
    friendship_requests = FriendshipRequest.objects.filter(
        to_profile=request.user.social_network_profile, status=FriendshipRequestStatus.ACTIVE)
    users = User.objects.exclude(id=request.user.id)
    return render(request, "social_network/find_users.html", {"users": users, "friendship_requests": friendship_requests})


@login_required()
def user_profile(request, user_id):
    user = get_object_or_404(User, pk=user_id)
    return render(request, "social_network/user_profile.html", {"user": user, "publications": user.social_network_profile.publications.all()})


@login_required()
@use_notifications()
def my_profile(request):
    user = request.user
    print(request.notifications)
    return render(request, "social_network/my_profile.html", {"user": user, "publications": user.social_network_profile.publications.all(), "images": user.social_network_profile.profile_images.all()})


@login_required()
@require_POST
def send_friendship_request(request, user_id):
    user = get_object_or_404(User, pk=user_id)
    try:
        friendship_request = FriendshipRequest.create_friendship_request(
            from_profile=request.user.social_network_profile, to_profile=user.social_network_profile)
        friendship_request.save()
        return redirect("social_network:user_profile", user_id)
    except Exception as e:
        return HttpResponse(e, status=500)


@login_required()
@require_POST
def accept_friendship_request(request, user_id):
    user = get_object_or_404(User, pk=user_id)
    friendship_request = FriendshipRequest.objects.get(
        from_profile=user.social_network_profile, to_profile=request.user.social_network_profile)
    friendship_request.accept()
    return redirect("social_network:user_profile", user_id)


@login_required()
def get_friends_list(request):
    friends = Friendship.get_friends(
        profile=request.user.social_network_profile)
    return render(request, "social_network/friends_list.html", {"friends": friends})


@login_required()
@require_POST
def create_publication(request):
    user = request.user
    text = request.POST.get("publication_text")
    if len(text.strip()) < 1:
        return HttpResponseServerError("publication text must be at least 1 character")
    images = request.POST.getlist("images")
    publication = Publication(text=text, profile=user.social_network_profile)
    publication.save()
    publication.images.set(images)
    notification = Notification(content=f"{user.username} опубликовал новый пост. Спешите увидеть.", url=reverse(
        "social_network:user_profile", args=[user.id]))
    notification.save()
    friends = Friendship.objects.filter(friend_1=user.social_network_profile)
    notification.to_profile.set(
        list(friends.values_list("friend_2", flat=True)))
    return redirect("social_network:my_profile")


@login_required()
@require_GET
def delete_publication(request, publication_id):
    pub = get_object_or_404(Publication, pk=publication_id,
                            profile=request.user.social_network_profile)
    pub.delete()
    return redirect("social_network:my_profile")


@login_required()
@require_http_methods(["GET", "POST"])
def profile_images(request):
    images = request.FILES.getlist("images")
    if request.method == "POST" and images:
        for image in images:
            profile_image = ProfileImage(
                image=image, profile=request.user.social_network_profile)
            profile_image.save()
        return redirect("social_network:profile_images")
    images = ProfileImage.objects.filter(
        profile=request.user.social_network_profile)
    return render(request, "social_network/profile_images.html", {"images": images})


def process_notification(request, notification_id):
    notification = get_object_or_404(
        Notification, pk=notification_id, to_profile=request.user.social_network_profile)
    url = notification.url
    notification.delete()
    return HttpResponseRedirect(url)


@login_required()
def go_to_chat(request, user_id):
    token = Token.objects.get_or_create(user=request.user)
    return HttpResponseRedirect(f"http://localhost:5173/chat/{user_id}/{token[0]}")

@login_required()
def get_communities(request):
    user = request.user
    communities = Community.objects.filter(members=user.social_network_profile)
    return render(request, "social_network/get_communities.html", { "communities" : communities })



@login_required()
@require_http_methods(["GET", "POST"])
def create_community(request):
    CommunityMembersInlineFormSet = inlineformset_factory(Community, CommunityMember, fields=["status", "ban_until", "profile"])
    if (request.method == "GET"):
        form = CommunityForm()
        formset = CommunityMembersInlineFormSet()
        for _form in formset:
            _form.fields["profile"].queryset = Profile.objects.exclude(user=request.user)
            _form.fields["status"].choices = [(CommunityMemberStatus.ADMIN, "Admin"), (CommunityMemberStatus.WRITER, "Writer"), (CommunityMemberStatus.READER, "Reader")]
        return render(request, "social_network/create_community.html", {"form": form, "formset": formset})
    form = CommunityForm(request.POST)
    formset = CommunityMembersInlineFormSet(request.POST)
    if (form.is_valid()):
        community = form.save(commit=False)
        formset = CommunityMembersInlineFormSet(request.POST, instance=community)
        if (formset.is_valid()):
            community.save()
            community.add_owner(request.user)
            formset.save()
    for _form in formset:
        _form.fields["profile"].queryset = Profile.objects.exclude(user=request.user)
        _form.fields["status"].choices = [(CommunityMemberStatus.ADMIN, "Admin"), (CommunityMemberStatus.WRITER, "Writer"), (CommunityMemberStatus.READER, "Reader")]
    return render(request, "social_network/create_community.html", {"form": form, "formset": formset})
