from django.urls import path
from .views import GetAllConversationsView, CreateConversationView

urlpatterns = [
    path('mychats/', GetAllConversationsView.as_view(), name='my chats'),
    path('create/<int:pk>', CreateConversationView.as_view(), name="Create conversations")
]