from django.urls import path
from .views import RegisterUser, LoginView, UserProfile

urlpatterns = [
    path('register/', RegisterUser.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('profile/', UserProfile.as_view(), name='profile'),
]