from django.contrib import admin

from product.models import Product, ProductBasket, Basket, ProductCategory

# Register your models here.
admin.site.register(Product)
admin.site.register(ProductBasket)
admin.site.register(Basket)
admin.site.register(ProductCategory)