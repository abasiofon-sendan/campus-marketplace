from django.shortcuts import render
from django.core.exceptions import ObjectDoesNotExist
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import Product
from .serializers import ProductSerializer
from rest_framework.permissions import IsAuthenticated
# Create your views here.

class ProductListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        auth_user = request.user
        try:
            products = Product.objects.get(user=auth_user)
        except Product.DoesNotExist:
            return Response({"message":"product does not exist"})
        serializer = ProductSerializer(products,many=True)
        return Response(serializer.data)
        
    def post(self, request):
        serializer = ProductSerializer(data= request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({"message":"Products Added Successfully"}, status=201)
        return Response({"errors":serializer.errors})
        

class ProductDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self,request,pk):
        auth_user = request.user
        try:
            products = Product.objects.get(pk=pk,user=auth_user)
        except Product.DoesNotExist:
            return Response({"message":"Product not found"})
        serializer = ProductSerializer(products,many=True)
        return Response(serializer.data)
    
    def put(self,request,pk):   
        auth_user = request.user
        try:
            products = Product.objects.get(pk=pk, user = auth_user)
        except Product.DoesNotExist:
            return Response({"message":"Product not found"})
        serializer = ProductSerializer(products,data=request.data)
        if serializer.is_valid():
            serializer.save(user=auth_user)
            return Response({"message":"Updated sucessfully"})
        return Response({"errors":serializer.errors})
    
    def delete(self,request,pk):
        auth_user=request.user
        try:
            product= Product.objects.get(pk=pk,user=request.user)
        except Product.DoesNotExist:
            return Response({"message":"Product not found"})
        product.delete()
        return Response({"message":"Deleted successfully"})




            


            