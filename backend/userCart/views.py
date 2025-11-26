from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import CartItem
from .serializers import CartItemSerializer
from Products_app.models import Product

class CarItemView(APIView):
    def get(self,request):
        cart_items=CartItem.objects.filter(user=request.user)
        serializer=CartItemSerializer(cart_items,many=True)
        return Response(serializer.data,status=status.HTTP_200_OK)
    
    def post(self,request):
        # user =request.user
        # req= request.data.get("product")
        # print(req)

        # data ={
        #     "user":user.id,
        #     "product":req
        # }

        serializer=CartItemSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response(serializer.data,status=status.HTTP_201_CREATED)
        return Response(serializer.errors,status=status.HTTP_400_BAD_REQUEST)
    
    def delete(self,request,pk):
        try:
            cart_item=CartItem.objects.get(pk=pk,user=request.user)
            cart_item.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except CartItem.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)
        
        
