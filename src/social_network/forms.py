from django.forms import ModelForm

from social_network.models import Community, CommunityPublication


class CommunityForm(ModelForm):
    class Meta:
        model = Community
        fields = ("title", )

class CommunityPublicationForm(ModelForm):
    class Meta:
        model = CommunityPublication
        fields = ("text", )