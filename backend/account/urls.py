from django.urls import path
from .views import GetUserProfile

urlpatterns = [
    path('user/<int:pk>', GetUserProfile.as_view(), name='getuser')
]