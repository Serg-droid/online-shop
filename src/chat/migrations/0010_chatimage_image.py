# Generated by Django 5.0.6 on 2024-07-26 21:00

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('chat', '0009_chatimage'),
    ]

    operations = [
        migrations.AddField(
            model_name='chatimage',
            name='image',
            field=models.ImageField(default='', upload_to='chat_media/'),
            preserve_default=False,
        ),
    ]
