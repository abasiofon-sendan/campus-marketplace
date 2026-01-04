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


class GetAllConversationsView(APIView):
    permission_classes=[IsAuthenticated]
    def get(self, request):
        user = request.user

        convo = ConversationModel.objects.filter(
            Q(vendor=user) | Q(buyer=user)
        )

        serializer = ConversationSerializer(convo, many=True)
        data = serializer.data
        print(convo)
        for convo_obj, item in zip(convo, data):
            if convo_obj.vendor == user:
                # current user is the vendor in this conversation -> remove vendor fields
                item.pop('vendor_pfp', None)
                item.pop('vendor_username', None)
            else:
                # current user is the buyer -> remove buyer fields
                item.pop('buyer_pfp', None)
                item.pop('buyer_username', None)

        return Response(data, status=status.HTTP_200_OK)
    


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
        
        _, created = ConversationModel.objects.get_or_create(buyer=user, vendor=vendor)

        if created:
            return Response({"message":"Chat created successfully"}, status=status.HTTP_201_CREATED)
        return Response({"message":"Chat already exists"}, status=status.HTTP_200_OK)
