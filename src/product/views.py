import json
import uuid
from django.contrib.auth.decorators import login_required
from django.core.exceptions import ValidationError
from django.core.serializers.json import DjangoJSONEncoder
from django.db.models import F
from django.forms import model_to_dict
from django.http import Http404, HttpResponseRedirect
from django.shortcuts import get_object_or_404, redirect, render
from django.urls import reverse
from django.views.decorators.http import require_http_methods
from rest_framework import serializers
from yookassa import Payment

from product.filters import ProductFilter
from product.forms import ProductReviewForm
from product.models import Basket, BasketArchive, BasketStatus, Product, ProductBasket, ProductCategory, ProductImage, ProductReview, ProductReviewLike

# Create your views here.


def index(request):
    basket = _get_basket(request)
    filter = ProductFilter(request.GET, queryset=Product.objects.all())
    return render(request, "product/index.html", {"basket": basket, "filter": filter})


def add_product_to_basket(request, product_id):
    basket = _get_basket(request)
    try:
        product_basket = ProductBasket.objects.get(
            basket=basket, product=product_id)
        product_basket.product_count += 1
    except (ProductBasket.DoesNotExist, KeyError):
        product = get_object_or_404(Product, pk=product_id)
        product_basket = ProductBasket.objects.create(
            basket=basket, product=product, product_count=1)
    product_basket.save()
    redirect_to = request.GET.get("next")
    return HttpResponseRedirect(redirect_to)


def remove_product_from_basket(request, product_id):
    basket = _get_basket(request)
    try:
        product_basket = ProductBasket.objects.get(
            basket=basket, product=product_id)
        product_basket.product_count -= 1
    except (ProductBasket.DoesNotExist, KeyError):
        pass
    if (product_basket.product_count == 0):
        product_basket.delete()
    else:
        product_basket.save()
    redirect_to = request.GET.get("next")
    return HttpResponseRedirect(redirect_to)


def basket(request):
    basket = _get_basket(request)
    productbasketlist = ProductBasket.objects.filter(basket=basket.pk)
    basket_total_count = basket.count_total_price()
    return render(request, "product/basket.html", {"productbasketlist": productbasketlist, "basket_total_count": basket_total_count})


def about_product(request, product_id):
    product = get_object_or_404(Product, pk=product_id)
    if request.user:
        try:
            product_review = ProductReview.objects.get(
                user=request.user, product=product)
        except ProductReview.DoesNotExist:
            product_review = ProductReview(product=product, user=request.user)
        if request.method == "POST":
            product_review_form = ProductReviewForm(
                data=request.POST, instance=product_review)
            if product_review_form.is_valid():
                product_review_form.save()
        else:
            product_review_form = ProductReviewForm(instance=product_review)
    return render(request, "product/about.html", {"product": product, "product_review_form": product_review_form})


@login_required()
def approve_basket(request):
    basket = _get_basket(request)
    basket_total_count = basket.count_total_price()
    payment = Payment.create({
        "amount": {
            "value": basket_total_count,
            "currency": "RUB"
        },
        "confirmation": {
            "type": "redirect",
            "return_url": request.build_absolute_uri(reverse("product:payment_success", args=[basket.pk]))
        },
        "capture": True,
        "description": "Заказ №1"
    }, uuid.uuid4())
    return HttpResponseRedirect(payment.confirmation.confirmation_url)


@login_required()
def payment_success(request, basket_id):
    # return render(request, "product/payment_success.html")

    class ProductImageSerializer(serializers.ModelSerializer):
        image_url = serializers.ImageField(source="image") 

        class Meta:
            model = ProductImage
            fields = ["image_url"]

    class ProductSerializer(serializers.ModelSerializer):
        images = ProductImageSerializer(source="productimage_set", many=True)

        class Meta:
            model = Product
            exclude = []

    class ProductBasketSerializer(serializers.ModelSerializer):
        product_info = ProductSerializer(source="product")

        class Meta:
            model = ProductBasket
            fields = ["product_count", "product_info"]

    class BasketSerializer(serializers.ModelSerializer):
        basket_id = serializers.ReadOnlyField(source="id")
        basket_total_count = serializers.ReadOnlyField(
            source="count_total_price")
        products = ProductBasketSerializer(
            source="productbasket_set", many=True)

        class Meta:
            model = Basket
            fields = ["basket_id", "basket_total_count", "products"]

    basket = _get_basket(request)
    if basket_id != basket.id:
        raise Http404()
    basket_data = {
        "basket_id": basket.pk,
        "basket_total_count": basket.count_total_price(),
        # "products": list(
        #     basket.products.all().annotate(product_count=F("productbasket__product_count"),
        #                                    images=F("productbasket__product__productimage__image")).order_by("id").values()
        # "products": ProductSerializer(basket.products.all(), many=True).data
    }
    basket_data = BasketSerializer(basket).data
    basket_archive = BasketArchive(
        user=request.user, data=json.dumps(basket_data, cls=DjangoJSONEncoder))
    basket_archive.save()


    basket.status = BasketStatus.ARCHIVED
    basket_products = basket.productbasket_set.all()
    for product in basket_products:
        product.archived_price = product.product.price
        product.save()
    basket.save()
    _get_basket(request)
    return HttpResponseRedirect(reverse("product:purchase_history"))
    # return HttpResponse([   (basket.data)["basket_total_count"] for basket in all_baskets])


@login_required()
def purchase_history(request):
    all_baskets = request.user.basket_set.filter(status=BasketStatus.ARCHIVED)
    return render(request, "product/basket_archive.html", {"baskets": all_baskets})


def _get_basket(request):
    print("_get_basket")
    if request.user and request.user.is_authenticated:
        # return Basket.objects.get_or_create(owner=request.user, status=Basket.Status.OPEN)[0]
        print("try get basket from authed user")
        return Basket.objects.get_or_create(owner=request.user, status=BasketStatus.ACTIVE)[0]
    try:
        basket_id = request.session.get("basket_id")
        if (basket_id == None):
            raise KeyError("No basket_id in session")
        basket = Basket.objects.get(pk=basket_id)
    except (KeyError, Basket.DoesNotExist) as e:
        print(e)
        basket = Basket.objects.create()
        basket.save()
        request.session["basket_id"] = basket.pk
        request.session
    return basket


@login_required()
def add_like_on_review(request, review_id):
    try:
        like = ProductReviewLike(user=request.user, review_id=review_id)
        like.validate_constraints()
        like.save()
    except ValidationError:
        ProductReviewLike.objects.get(
            user=request.user, review_id=review_id).delete()
    redirect_to = request.GET.get("next")
    return HttpResponseRedirect(redirect_to)
