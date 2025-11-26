from django.urls import path
from .views import CarItemView

urlpatterns = [
    path('cart-items/', CarItemView.as_view(), name='cart-items'),
    path('cart-items/add', CarItemView.as_view(), name='cart-item-detail'),
]