from django.urls import path, include
from .views import TopCustomersView, TopVendorsView

urlpatterns = [
    path('top-customers/', TopCustomersView.as_view(), name='top-customers'),
    path('top-vendors/', TopVendorsView.as_view(), name='top-vendors'),
]