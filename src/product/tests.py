from django.test import TestCase

from product.models import Basket, Product, ProductBasket

# Create your tests here.


def create_product(price, title):
    p = Product.objects.create(price=price, title=title)
    p.full_clean()
    p.save()
    return p


class ModelsTests(TestCase):

    def test_creating_products(self):
        p1 = create_product(23, "1331")
        p2 = create_product(1, "afa")

    def test_creating_basket(self):
        p1 = create_product(1, "meat")
        p2 = create_product(1, "egg")

        b = Basket.objects.create()
        b.products.add(p1, p2, p2)
        b.products.add(p1)
        b.save()
        print(b.products.all())
        pb = ProductBasket.objects.get(basket = b, product = p1)
        pb.product_count = 100
        pb.save()
        print(ProductBasket.objects.get(basket = b, product = p1).product_count)

        
