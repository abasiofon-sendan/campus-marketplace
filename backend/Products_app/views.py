from django.shortcuts import render
from django.core.exceptions import ObjectDoesNotExist
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import Product,ProductView
from .serializers import ProductSerializer
from rest_framework.permissions import IsAuthenticated
from .supabase_config import supabase
import os
import time
import uuid
from decimal import Decimal
from storage3.exceptions import StorageApiError
from drf_spectacular.utils import extend_schema,OpenApiParameter,OpenApiExample
from drf_spectacular.types import OpenApiTypes
from django.db.models import F
# Create your views here.

class ProductListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    
    @extend_schema(
        summary="List Products",
        description="Retrieve a list of products. Vendors see only their products; buyers see all products.",
        responses={200: ProductSerializer(many=True)},
    )
    def get(self, request):
        auth_user = request.user
        # If the authenticated user is a vendor, return only their products.
        # Buyers (and other roles) see all products.
        user_role = getattr(auth_user, 'role', None)
        if user_role == 'vendor':
            products = Product.objects.filter(vendor_name=auth_user)
        else:
            products = Product.objects.all()
        serializer = ProductSerializer(products, many=True)
        data = serializer.data
        # replace vendor_name id with the username and add vendor_username for each item
        for prod, item in zip(products, data):
            username = prod.vendor_name.username if prod.vendor_name else None
            item['vendor_name'] = username
            item['vendor_username'] = username
        return Response(data)
        


class CreateProductView(APIView):   

    @extend_schema(
        summary="create product",
        description="add product to your product inventory",
        request=ProductSerializer,
        responses={200:dict},
        examples=[
            OpenApiExample(
                "creating product",
                summary="Example of creating of product",
                description="Creating of product",
                value={
                    "product_name":"Bags",
                    "description":"My bags are very cheap and affordable",
                    "price":2000,
                    "quantity":20,
                    "category":"Accessories",
                    "image_url":"img_2312393493/3u4",
                    "rating":4,
                    "view_count":20
                }
            )
            

        ]

    )  
    def post(self, request):
        user = request.user
        print("User is:", user.id)
        data = request.data

        # collect uploaded files (if any)
        images = request.FILES.getlist('image_url') if hasattr(request.FILES, 'getlist') else []
        images_urls = []

        # If frontend provided image URLs in JSON body, prefer them unless files exist
        if not images and isinstance(data.get('image_url', None), (list, tuple)):
            images_urls = list(data.get('image_url', []))

        # upload files to supabase storage (ensure unique keys to avoid 409)
        for image in images:
            # read file bytes once
            file_bytes = image.read()
            base, ext = os.path.splitext(image.name or "file")
            unique_name = f"{base}_{uuid.uuid4().hex}{ext}"
            key = f"products/{user.id}/{unique_name}"
            try:
                supabase.storage.from_('marketplace').upload(
                    key,
                    file_bytes,
                    {"content-type": image.content_type}
                )
            except StorageApiError as e:
                status_code = getattr(e, "statusCode", None)
                msg = str(e)
                if status_code == 409 or "Duplicate" in msg:
                    unique_name = f"{base}_{int(time.time())}_{uuid.uuid4().hex}{ext}"
                    key = f"products/{user.id}/{unique_name}"
                    supabase.storage.from_('marketplace').upload(
                        key,
                        file_bytes,
                        {"content-type": image.content_type}
                    )
                else:
                    raise
            # get public url and append (normalize dict/str responses)
            url = supabase.storage.from_('marketplace').get_public_url(key)
            # normalize possible response shapes
            if isinstance(url, dict):
                possible = url.get('publicURL') or url.get('public_url') or url.get('publicUrl') or url.get('url')
                if possible:
                    images_urls.append(possible)
                else:
                    # fallback to stringify
                    images_urls.append(str(url))
            else:
                images_urls.append(str(url))

        # Build a clean_data dict that works for both QueryDict (form) and JSON (dict)
        clean_data = {}
        if hasattr(data, "lists"):
            iterator = data.lists()
        else:
            iterator = ((k, v if isinstance(v, list) else [v]) for k, v in data.items())

        for key, value in iterator:
            if len(value) == 1:
                clean_data[key] = value[0]
            else:
                clean_data[key] = value

        # ensure vendor and images are set explicitly
        clean_data['vendor_name'] = user.id
        clean_data['image_url'] = images_urls

        # convert numeric types to expected types
        if 'price' in clean_data:
            try:
                clean_data['price'] = Decimal(str(clean_data['price']))
            except Exception:
                pass

        if 'quantity' in clean_data:
            try:
                clean_data['quantity'] = int(clean_data['quantity'])
            except Exception:
                pass

        if 'rating' in clean_data:
            try:
                clean_data['rating'] = int(clean_data['rating'])
            except Exception:
                clean_data['rating'] = 0

        print("Clean data is:", clean_data)

        serializer = ProductSerializer(data=clean_data)
        if serializer.is_valid():
            product = serializer.save()
            resp = ProductSerializer(product).data
            resp['vendor_username'] = user.username
            return Response(resp, status=201)
        return Response({"errors": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)
        

class ProductDetailView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(
            summary="Product Detail",
            description="Retrieve, update, or delete a product by its ID.",
            request=ProductSerializer,
            responses={200: ProductSerializer},
    )

    def get(self,request,pk):
        auth_user = request.user
        try:
            # allow any authenticated user to view product details
            product = Product.objects.get(pk=pk)
        except Product.DoesNotExist:
            return Response({"message": "Product not found"}, status=status.HTTP_404_NOT_FOUND)
        serializer = ProductSerializer(product)
        data = serializer.data
        data['vendor_name'] = product.vendor_name.username if product.vendor_name else None
        if auth_user != product.vendor_name:
            _, created = ProductView.objects.get_or_create(product=product, user=auth_user)
            if created:
                Product.objects.filter(pk=pk).update(view_count=F('view_count') + 1)
        return Response(data)

    
    def put(self,request,pk):   
        auth_user = request.user
        try:
            products = Product.objects.filter(pk=pk, vendor_name = auth_user)
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



class AllProductsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self,request):
        products= Product.objects.all()
        serializer= ProductSerializer(products,many=True)
        return Response(serializer.data)




            


            