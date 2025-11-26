from django.urls import path
from .views import *


urlpatterns = [
    path('initiate-payment/<int:car_id>/', InitializePaymentView.as_view(), name='initiate-payment'),
    path('verify-payment/<str:reference>/', VerifyPaymentView.as_view(), name='verify-payment'),
]