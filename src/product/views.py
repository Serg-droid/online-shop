from django.contrib.auth.decorators import login_required
from django.contrib.sessions.models import Session
from django.http import HttpResponse, HttpResponseRedirect
from django.shortcuts import get_object_or_404, render
from django.urls import reverse

from product.models import Basket, Product, ProductBasket, ProductCategory

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
    return render(request, "product/about.html", { "product" : product })


@login_required()
def approve_basket(request):
    print("basket approved")
    return HttpResponse("basket approved")


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
