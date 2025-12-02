from django.shortcuts import render
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import TopCustomers, TopVendors
from .serializers import TopCustomersSerializer, TopVendorsSerializer
from rest_framework import status


class TopCustomersView(APIView):
    def get(self, request):
        top_customers = TopCustomers.objects.all().order_by('-total_purchases')[:10]
        serializer = TopCustomersSerializer(top_customers, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    

class TopVendorsView(APIView):
    def get(self, request):
        top_vendors = TopVendors.objects.all().order_by('-total_sales')[:10]
        serializer = TopVendorsSerializer(top_vendors, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    