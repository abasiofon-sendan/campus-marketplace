from django.urls import path
from .views import *

urlpatterns = [
    path('', AllProductsView.as_view(), name='list-products'),
    path("my_products/", ProductListCreateView.as_view(), name="user-products"),
    path('create', ProductListCreateView.as_view(), name='create-product'),
    path('<int:pk>', ProductDetailView.as_view(), name ='product-detail')
]