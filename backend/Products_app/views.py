from django.shortcuts import render
from django.core.exceptions import ObjectDoesNotExist
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import Product
from .serializers import ProductSerializer
from rest_framework.permissions import IsAuthenticated
from .supabase_config import supabase
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
        user = request.user
        print("User is:", user.id)
        data = request.data
        images = request.FILES.getlist('image_url')
        images_urls = []

        for image in images:
            key = f"products/{user.id}/{image.name}"
            res = supabase.storage.from_('marketplace').upload(key, image.read(),{
                "content-type":image.content_type
            })
            url = supabase.storage.from_('marketplace').get_public_url(key)
            images_urls.append(url)


        data['image_url'] = images_urls
        clean_data = {}
        
        for key,value in data.lists():
            if len(value) == 1:
                clean_data[key] = value[0]
            else:
                clean_data[key] = value
        clean_data['vendor_name'] = user.id
        clean_data['image_url'] = images_urls  
        print("Clean data is:", clean_data)      


        serializer = ProductSerializer(data=clean_data)
        if serializer.is_valid():
            serializer.save()
            return Response({"message":"Products Added Successfully"}, status=201)
        return Response({"errors":serializer.errors}, status = status.HTTP_400_BAD_REQUEST)
        

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




            


            