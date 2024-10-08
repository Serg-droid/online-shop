# Generated by Django 5.0.6 on 2024-06-24 21:23

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('product', '0017_productreviewlike_review_like__constraint'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='BasketArchive',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('data', models.JSONField(default={})),
            ],
        ),
        migrations.RemoveConstraint(
            model_name='productreviewlike',
            name='review_like__constraint',
        ),
        migrations.AlterField(
            model_name='productreview',
            name='product',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='reviews', to='product.product'),
        ),
        migrations.AlterField(
            model_name='productreviewlike',
            name='review',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='likes', to='product.productreview'),
        ),
        migrations.AddConstraint(
            model_name='productreviewlike',
            constraint=models.UniqueConstraint(fields=('review', 'user'), name='review_like__constraint', violation_error_message='Only 1 like per user on review is allowed'),
        ),
        migrations.AddField(
            model_name='basketarchive',
            name='user',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL),
        ),
    ]
