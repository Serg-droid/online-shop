# Generated by Django 5.0.6 on 2024-08-04 16:28

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('social_network', '0005_profileimage'),
    ]

    operations = [
        migrations.AddField(
            model_name='publication',
            name='images',
            field=models.ManyToManyField(related_name='publications', to='social_network.profileimage'),
        ),
    ]
