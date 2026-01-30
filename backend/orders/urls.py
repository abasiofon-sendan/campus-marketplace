from django.urls import path
from .views import GetAllOrders, ValidateOrderQRCodeView

urlpatterns = [
    path('my_orders/', GetAllOrders.as_view(), name='my orders'),
    path('validate_order_qr/', ValidateOrderQRCodeView.as_view(), name='validate order qr'),
]