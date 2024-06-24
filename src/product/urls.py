from django.urls import path


from . import views


app_name = "product"
urlpatterns = [
    path("", view=views.index, name="index"),
    path("add_product_to_basket/<int:product_id>/", view=views.add_product_to_basket, name="add_product_to_basket"),
    path("remove_product_from_basket/<int:product_id>/", view=views.remove_product_from_basket, name="remove_product_from_basket"),
    path("basket/", view=views.basket, name="basket"),
    path("approve_basket/", views.approve_basket, name="approve_basket"),
    path("payment_success/", views.payment_success, name="payment_success"),
    path("about_product/<int:product_id>/", views.about_product, name="about_product"),

    path("add_like_on_review/<int:review_id>/", view=views.add_like_on_review, name="add_like_on_review")
]

