import json
import uuid
from django.contrib.auth.decorators import login_required
from django.core.exceptions import ValidationError
from django.core.serializers.json import DjangoJSONEncoder
from django.db.models import F
from django.http import Http404, HttpResponseRedirect
from django.shortcuts import get_object_or_404, render
from django.urls import reverse
from yookassa import Payment

from product.models import Basket, BasketArchive, Product, ProductBasket, ProductCategory, ProductReviewLike

# Create your views here.


def index(request):
    product_category = request.GET.get("product_category")
    if (product_category == None):
        products = Product.objects.all()
    else:
        products = Product.objects.filter(category=product_category)
    basket = _get_basket(request)
    categorylist = ProductCategory.objects.all()
    return render(request, "product/index.html", {"products": products, "basket": basket, "categorylist": categorylist})


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
    return render(request, "product/about.html", {"product": product})


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
    basket = _get_basket(request)
    if basket_id != basket.id:
        raise Http404()
    basket_data = {
        "basket_id": basket.pk,
        "basket_total_count": basket.count_total_price(),
        "products": list(
            basket.products.all().values().annotate(product_count=F("productbasket__product_count"))
        )
    }
    basket_archive = BasketArchive(user=request.user, data=json.dumps(basket_data, cls=DjangoJSONEncoder))
    basket_archive.save()
    basket.delete()
    return HttpResponseRedirect(reverse("product:purchase_history"))
    # return HttpResponse([   (basket.data)["basket_total_count"] for basket in all_baskets])


@login_required()
def purchase_history(request):
    all_baskets = request.user.basketarchive_set.all()
    return render(request, "product/basket_archive.html", { "baskets" : all_baskets })


def _get_basket(request):
    print("_get_basket")
    if request.user and request.user.is_authenticated:
        # return Basket.objects.get_or_create(owner=request.user, status=Basket.Status.OPEN)[0]
        print("try get basket from authed user")
        return Basket.objects.get_or_create(owner=request.user)[0]
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
