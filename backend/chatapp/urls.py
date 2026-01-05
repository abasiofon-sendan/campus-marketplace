from django.urls import path
from .views import GetAllConversationsView, CreateConversationView

urlpatterns = [
    path('create/<int:pk>', CreateConversationView.as_view(), name="Create conversations")
]