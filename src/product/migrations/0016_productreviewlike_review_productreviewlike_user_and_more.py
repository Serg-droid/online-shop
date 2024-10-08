# Generated by Django 5.0.6 on 2024-06-22 19:15

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('product', '0015_productreviewlike_productreview_rating'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.AddField(
            model_name='productreviewlike',
            name='review',
            field=models.ForeignKey(default=1, on_delete=django.db.models.deletion.CASCADE, to='product.productreview'),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='productreviewlike',
            name='user',
            field=models.ForeignKey(default=1, on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL),
            preserve_default=False,
        ),
        migrations.AddConstraint(
            model_name='productreview',
            constraint=models.CheckConstraint(check=models.Q(('rating__gte', 0), ('rating__lte', 10)), name='rating_check', violation_error_message='Provide rating value between 0 and 10'),
        ),
    ]
