from django.urls import path
from .views import *

urlpatterns = [
    path('create-product', ProductListCreateView.as_view(), name='create-product'),
    path('<int:pk>', ProductDetailView.as_view(), name ='product-detail')
]