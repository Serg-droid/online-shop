# Generated by Django 5.0.6 on 2024-07-25 18:32

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('chat', '0006_chatmessage_deleted'),
    ]

    operations = [
        migrations.AlterField(
            model_name='chatmessage',
            name='deleted',
            field=models.BooleanField(default=False),
        ),
    ]
