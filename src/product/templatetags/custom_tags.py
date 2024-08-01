import json

from django import template
from django.db import models

register = template.Library()


@register.filter(name='jsonify')
def jsonify(data):
    if isinstance(data, dict):
        return data
    else:
        return json.loads(data)


@register.filter
def index(indexable, i):
    try:
        if (isinstance(indexable, (models.QuerySet, models.Manager))):
            return indexable.all()[i]
        return indexable[i]
    except Exception as e:
        print(e)
