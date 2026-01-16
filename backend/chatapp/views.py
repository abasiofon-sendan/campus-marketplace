from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework import status
from rest_framework.response import Response
from .models import ConversationModel
from rest_framework.permissions import IsAuthenticated
from .serializers import ConversationSerializer
from django.contrib.auth import get_user_model
from django.db.models import Q

User = get_user_model()

# Create your views here.
class CreateConversationView(APIView):
    permission_classes=[IsAuthenticated]
    def post(self, request, pk):
        user = request.user
        if user.id == pk:
            return Response({"message":"Cannot contact yourself"}, status=status.HTTP_401_UNAUTHORIZED)
        try:
            vendor = User.objects.get(id=pk)
        except User.DoesNotExist:
            return Response({"message":"Vendor does not exist"}, status=status.HTTP_404_NOT_FOUND)
        
        if user.id > vendor.id:
            _, created = ConversationModel.objects.get_or_create(buyer=vendor, vendor=user)
        else:
            _, created = ConversationModel.objects.get_or_create(buyer=user, vendor=vendor)

        if created:
            return Response({"message":"Chat created successfully"}, status=status.HTTP_201_CREATED)
        return Response({"message":"Chat already exists"}, status=status.HTTP_200_OK)
