# Generated by Django 5.0.6 on 2024-06-10 18:27

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('product', '0001_initial'),
    ]

    operations = [
        migrations.AddConstraint(
            model_name='productbasket',
            constraint=models.UniqueConstraint(fields=('basket', 'product'), name='productbasket_constraint'),
        ),
    ]
