from django.contrib.auth.models import User
from django.db import models
from django.db.models import UniqueConstraint, F, Sum
from django.core.validators import MinLengthValidator


# Create your models here.
class ProductCategory(models.Model):
    category_name = models.CharField(max_length=200)

    def __str__(self) -> str:
        return self.category_name


class Product(models.Model):
    title = models.CharField(max_length=200, validators=[
                             MinLengthValidator(1)])
    price = models.DecimalField(decimal_places=2, max_digits=12)
    category = models.ForeignKey(
        ProductCategory, on_delete=models.SET_NULL, null=True)

    def __str__(self) -> str:
        return self.title


class ProductBasket(models.Model):
    product_count = models.IntegerField(default=1)
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    basket = models.ForeignKey("Basket", on_delete=models.CASCADE)

    class Meta:
        constraints = [
            UniqueConstraint(fields=["basket", "product"],
                             name="productbasket_constraint", )
        ]

    def __str__(self) -> str:
        return f"Basket: {self.basket.pk}. Product: {self.product.title}"

class Basket(models.Model):
    products = models.ManyToManyField(Product, through=ProductBasket)
    owner = models.OneToOneField(User, on_delete=models.CASCADE, null=True, related_name="basket")

    def count_total_price(self):
        return self.products.annotate(
            product_total_price=F("productbasket__product_count") * F("price")
        ).aggregate(
            Sum("product_total_price")
        )["product_total_price__sum"] or 0

    def __str__(self):
        return str(self.pk)
