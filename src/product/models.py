from django.contrib.auth.models import User
from django.db import models
from django.db.models import Q, UniqueConstraint, F
from django.core.validators import MinLengthValidator


# Create your models here.
class ProductImage(models.Model):
    image = models.ImageField(upload_to="images/")
    product = models.ForeignKey("Product", on_delete=models.CASCADE)


class ProductCategory(models.Model):
    category_name = models.CharField(max_length=200)

    def __str__(self) -> str:
        return self.category_name


class Brand(models.Model):
    brand_name = models.CharField(max_length=200)

    def __str__(self) -> str:
        return self.brand_name


class Manufacturer(models.Model):
    title = models.CharField(max_length=200)
    country = models.CharField(max_length=200)

    def __str__(self) -> str:
        return f"{self.title}. {self.country}"


class Product(models.Model):
    title = models.CharField(max_length=200, validators=[
        MinLengthValidator(1)
    ])
    price = models.DecimalField(decimal_places=2, max_digits=12)
    discount = models.DecimalField(
        decimal_places=2, max_digits=3, null=True, blank=True)
    ingredients = models.TextField(max_length=1000, default="", blank=True)
    description = models.TextField(max_length=1000, default="", blank=True)
    category = models.ForeignKey(
        ProductCategory, on_delete=models.SET_NULL, null=True)
    brand = models.ForeignKey(
        Brand, on_delete=models.SET_NULL, null=True, blank=True)
    manufacturer = models.ForeignKey(
        Manufacturer, on_delete=models.SET_NULL, null=True, blank=True)

    def __str__(self) -> str:
        return self.title

    def count_price(self):
        if (self.discount):
            return round(self.price * (1 - self.discount), 2)
        else:
            return self.price

    class Meta:
        constraints = [
            models.CheckConstraint(
                check=Q(discount__gte=0.01) & Q(discount__lte=1),
                name="discount_check"
            )
        ]


class ProductReview(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name="reviews")
    text = models.TextField(max_length=1000)
    rating = models.IntegerField()

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["user", "product"], name="product_review__constraint"),
            models.CheckConstraint(
                check=Q(rating__gte=0) & Q(rating__lte=10),
                name="rating_check",
                violation_error_message="Provide rating value between 0 and 10"
            )
        ]

    def __str__(self) -> str:
        return f"User: {self.user}. Product: {self.product}"


class ProductReviewLike(models.Model):
    review = models.ForeignKey(ProductReview, on_delete=models.CASCADE, related_name="likes")
    user = models.ForeignKey(User, on_delete=models.CASCADE)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=["review", "user"], name="review_like__constraint",
                                    violation_error_message="Only 1 like per user on review is allowed")
        ]

    def __str__(self) -> str:
        return f"User: {self.user} liked review: {self.review}"


class ProductBasket(models.Model):
    product_count = models.IntegerField(default=1)
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    basket = models.ForeignKey("Basket", on_delete=models.CASCADE)

    class Meta:
        constraints = [
            UniqueConstraint(fields=["basket", "product"],
                             name="productbasket_constraint")
        ]

    def __str__(self) -> str:
        return f"Basket: {self.basket.pk}. Product: {self.product.title}"


class Basket(models.Model):
    products = models.ManyToManyField(Product, through=ProductBasket)
    owner = models.OneToOneField(
        User, on_delete=models.CASCADE, null=True, related_name="basket")

    def count_total_price(self):
        price = 0
        products = self.products.all().annotate(
            count_in_basket=F("productbasket__product_count"))
        for product in products:
            price += product.count_price() * product.count_in_basket
        return price

    def __str__(self):
        return str(self.pk)
