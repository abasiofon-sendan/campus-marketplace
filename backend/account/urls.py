from django.urls import path
from .views import RegisterUser, LoginView

urlpatterns = [
    path('register/', RegisterUser.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
]