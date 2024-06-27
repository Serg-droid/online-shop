from django import forms

from product.models import ProductReview


class ProductReviewForm(forms.ModelForm):

    class Meta:
        model = ProductReview
        exclude = ["user", "product"]