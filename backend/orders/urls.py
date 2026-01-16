from django.urls import path
from .views import GetAllOrders

urlpatterns = [
    path('my_orders/', GetAllOrders.as_view(), name='my orders')
]