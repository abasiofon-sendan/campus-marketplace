from django.urls import path
from .views import *

urlpatterns = [
    path("topup",TopUpWAlletView.as_view(),name="topupwalllet"),
    path("verify-topup/<str:reference>",VerifyTopupView.as_view(),name="verify-topup")

]