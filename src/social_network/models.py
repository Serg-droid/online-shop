from django.db import models
from django.db.models import Q, F, CheckConstraint, TextField
from django.db.models.functions import Length
from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework.authentication import get_user_model
from django.core.exceptions import ValidationError
from rest_framework.fields import MinLengthValidator

# Create your models here.

TextField.register_lookup(Length)

User = get_user_model()

class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="social_network_profile")
    friends = models.ManyToManyField(to="self", through="Friendship", symmetrical=True)

    def __str__(self) -> str:
        return self.user.username
    

class Publication(models.Model):
    profile = models.ForeignKey(Profile, on_delete=models.CASCADE, related_name="publications")
    text = models.TextField(validators=[
        MinLengthValidator(1, "the field must contain at least 10 character")
    ])
    images = models.ManyToManyField("ProfileImage", related_name="publications")

    class Meta:
        constraints = [
            CheckConstraint(check=Q(text__length__gte=1), name="text_min_length")
        ]
    

class FriendshipRequestStatus(models.TextChoices):
    ACTIVE = "ACTIVE"
    ACCEPTED = "ACCEPTED"
    REJECTED = "REJECTED"
    

class FriendshipRequest(models.Model):

    from_profile = models.ForeignKey(Profile, on_delete=models.CASCADE, related_name="from_profile")
    to_profile = models.ForeignKey(Profile, on_delete=models.CASCADE, related_name="to_profile")
    status = models.CharField(choices=FriendshipRequestStatus, max_length=20, default=FriendshipRequestStatus.ACTIVE)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=["from_profile", "to_profile"], name="friendshiprequest_unique_constraint"),
            models.CheckConstraint(check=~Q(from_profile=F("to_profile")), name="friendshiprequest_themselves_constraint")
        ]

    def create_friendship_request(from_profile, to_profile):
        if (Friendship.are_friends(from_profile, to_profile)):
            raise ValidationError(f"{from_profile} and {to_profile} are already friends.")
        return FriendshipRequest.objects.get_or_create(from_profile=from_profile, to_profile=to_profile)[0]

    def accept(self):
        self.status = FriendshipRequestStatus.ACCEPTED
        self.save()
        Friendship.objects.get_or_create(friend_1=self.from_profile, friend_2=self.to_profile)


class Friendship(models.Model):
    friend_1 = models.ForeignKey(Profile, on_delete=models.CASCADE, related_name="friend_1")
    friend_2 = models.ForeignKey(Profile, on_delete=models.CASCADE, related_name="friend_2")

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=["friend_1", "friend_2"], name="friendship_unique_constraint"),
            models.CheckConstraint(check=~Q(friend_1=F("friend_2")), name="friendship_themselves_constraint")
        ]

    def are_friends(profile_1, profile_2):
        return Friendship.objects.filter(friend_1=profile_1, friend_2=profile_2).exists()

    def get_friends(profile):
        return Friendship.objects.filter(friend_1=profile)
    

class ProfileImage(models.Model):
    profile = models.ForeignKey(Profile, on_delete=models.CASCADE, related_name="profile_images")
    image = models.ImageField(upload_to="profile_images/")
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self) -> str:
        return f"{self.profile}'s image"


class Notification(models.Model):
    to_profile = models.ManyToManyField(Profile, related_name="notifications")
    content = models.TextField(max_length=200)
    url = models.URLField(max_length=200)




class CommunityMemberStatus(models.TextChoices):
    OWNER = "OWNER"
    ADMIN = "ADMIN"
    READER = "READER"
    WRITER = "WRITER"


class CommunityMember(models.Model):
    profile = models.ForeignKey(Profile, on_delete=models.CASCADE)
    community = models.ForeignKey("Community", on_delete=models.CASCADE)
    status = models.CharField(choices=CommunityMemberStatus, max_length=50, default=CommunityMemberStatus.WRITER)
    ban_until = models.DateTimeField(null=True, blank=True)


    class Meta:
        constraints = [
            models.UniqueConstraint(fields=["community", "profile"], name="communitymember_unique_constraint"),
            models.UniqueConstraint(fields=["community"], condition=Q(status=CommunityMemberStatus.OWNER), name="communitymember_owner_unique_constraint"),
        ]

    def save(self):
        if (self.ban_until and self.ban_until <= timezone.now()):
            raise ValidationError("ban_until must be greater than timezone.now()")
        return super().save()



class Community(models.Model):
    title = models.CharField(max_length=200)
    members = models.ManyToManyField(Profile, through=CommunityMember)

    # def create_community(title, members, owner):
    #     community = Community(title=title)
    #     community.save()
    #     for m in members:
    #         user = get_object_or_404(Profile, pk=m)
    #         community_member = CommunityMember(profile=user, community=community)
    #         if (owner.social_network_profile == community_member.profile):
    #             community_member.status = CommunityMemberStatus.OWNER
    #         community_member.save()


    def add_owner(self, user):
        community_member = CommunityMember(profile=user.social_network_profile, status=CommunityMemberStatus.OWNER, community=self)
        community_member.save()


