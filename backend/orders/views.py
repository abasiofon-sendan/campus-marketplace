from django.shortcuts import render
from .models import Order
from .serializers import OrderSerializer
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.db.models import Q

# Create your views here.


class GetAllOrders(APIView):
    def get(self, request):
        user = request.user
        data = Order.objects.filter(
            Q(vendor=user) | Q(buyer=user)
        ).select_related("vendor", "buyer")

        serializer = OrderSerializer(data, many=True)

        return Response(serializer.data, status=status.HTTP_200_OK)

        

