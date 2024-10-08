from django.contrib import admin

from product.models import BasketArchive, Brand, Manufacturer, Product, ProductBasket, Basket, ProductCategory, ProductImage, ProductReview, ProductReviewLike
from product.views import basket

# Register your models here.
class ProductBasketInline(admin.TabularInline):
    model = ProductBasket
    extra = 1
class BasketAdmin(admin.ModelAdmin):
    inlines = [ProductBasketInline]

class ProductImageInline(admin.TabularInline):
    model = ProductImage
    extra = 1

class ProductAdmin(admin.ModelAdmin):
    inlines = [ProductImageInline]

class ProductReviewLikesInline(admin.TabularInline):
    model = ProductReviewLike
    extra = 3

class ProductReviewAdmin(admin.ModelAdmin):
    inlines = [ProductReviewLikesInline]

admin.site.register(Product, ProductAdmin)
admin.site.register(ProductBasket)
admin.site.register(Basket, BasketAdmin)
admin.site.register(ProductCategory)
admin.site.register(Manufacturer)
admin.site.register(Brand)
admin.site.register(ProductImage)
admin.site.register(ProductReview, ProductReviewAdmin)

admin.site.register(BasketArchive)