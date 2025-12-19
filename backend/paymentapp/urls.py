from django.urls import path
from .views import *


urlpatterns = [
    path('initiate-payment/', InitializePaymentView.as_view(), name='initiate-payment'),
]