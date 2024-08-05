from functools import wraps

from social_network.models import Notification


def use_notifications():
    def decorator(view):
        @wraps(view)
        def _wrapped_view(request, *args, **kwargs):
            request.notifications = Notification.objects.filter(to_profile=request.user.social_network_profile)
            return view(request, *args, **kwargs)
        return _wrapped_view
    return decorator