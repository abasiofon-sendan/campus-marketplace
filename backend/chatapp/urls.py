from django.urls import path
from .views import CreateConversationView

urlpatterns = [
    path('create/<int:pk>', CreateConversationView.as_view(), name="Create conversations")
]