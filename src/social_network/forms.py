from django.forms import ModelForm

from social_network.models import Community


class CommunityForm(ModelForm):
    class Meta:
        model = Community
        fields = ("title", )