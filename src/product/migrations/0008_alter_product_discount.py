# Generated by Django 5.0.6 on 2024-06-15 09:16

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('product', '0007_product_discount_product_discount_check'),
    ]

    operations = [
        migrations.AlterField(
            model_name='product',
            name='discount',
            field=models.DecimalField(decimal_places=2, max_digits=3, null=True),
        ),
    ]
