# Generated by Django 5.0.6 on 2024-06-22 14:16

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('product', '0014_productreview_product_review__constraint'),
    ]

    operations = [
        migrations.CreateModel(
            name='ProductReviewLike',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
            ],
        ),
        migrations.AddField(
            model_name='productreview',
            name='rating',
            field=models.IntegerField(default=12),
            preserve_default=False,
        ),
    ]
