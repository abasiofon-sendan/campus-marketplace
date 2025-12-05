from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from django.db.models import Count, Q, Avg
from datetime import timedelta
from django.utils import timezone
from .models import ProductView, ContentView, SearchQuery
from .serializers import ProductViewSerializer, ContentViewSerializer, SearchQuerySerializer
from Products_app.models import Product
from customers.models import VendorContents, VendorProfiles
from Products_app.serializers import ProductSerializer


class TrackProductView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        product_id = request.data.get('product_id')
        view_duration = request.data.get('view_duration', 0)
        
        try:
            product = Product.objects.get(id=product_id)
            product_view = ProductView.objects.create(
                user=request.user,
                product=product,
                view_duration=view_duration
            )
            serializer = ProductViewSerializer(product_view)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        except Product.DoesNotExist:
            return Response({"error": "Product not found"}, status=status.HTTP_404_NOT_FOUND)


class TrackContentView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        content_id = request.data.get('content_id')
        view_duration = request.data.get('view_duration', 0)
        
        try:
            content = VendorContents.objects.get(id=content_id)
            content_view = ContentView.objects.create(
                user=request.user,
                content=content,
                view_duration=view_duration
            )
            serializer = ContentViewSerializer(content_view)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        except VendorContents.DoesNotExist:
            return Response({"error": "Content not found"}, status=status.HTTP_404_NOT_FOUND)


class RecentVideosWatchedView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        # Get recent video content views
        recent_videos = ContentView.objects.filter(
            user=request.user,
            content__video__isnull=False
        ).select_related('content', 'content__user')[:20]
        
        serializer = ContentViewSerializer(recent_videos, many=True, context={'request': request})
        return Response({
            'recent_videos': serializer.data,
            'count': recent_videos.count()
        }, status=status.HTTP_200_OK)


class SearchSuggestionsView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        user = request.user
        
        # Get vendors from products the user has viewed
        viewed_products = ProductView.objects.filter(user=user).values_list('product__vendor_name', flat=True).distinct()
        
        # Get vendors from contents the user has viewed
        viewed_contents = ContentView.objects.filter(user=user).values_list('content__user', flat=True).distinct()
        
        # Combine and get unique vendor IDs
        vendor_ids = set(list(viewed_products) + list(viewed_contents))
        
        # Get vendor profiles with their details
        suggested_vendors = VendorProfiles.objects.filter(
            user__id__in=vendor_ids,
            user__role='vendor'
        ).select_related('user')[:10]
        
        vendor_data = [{
            'username': profile.user.username,
            'email': profile.user.email,
            'bio': profile.bio,
            'followers_count': profile.followers_count,
            'profile_picture': profile.profile_picture.url if profile.profile_picture else None
        } for profile in suggested_vendors]
        
        # Get products from suggested vendors
        suggested_products = Product.objects.filter(
            vendor_name__id__in=vendor_ids
        )[:10]
        
        product_serializer = ProductSerializer(suggested_products, many=True)
        
        # Get recent search queries
        recent_searches = SearchQuery.objects.filter(user=user)[:10]
        search_serializer = SearchQuerySerializer(recent_searches, many=True)
        
        return Response({
            'suggested_vendors': vendor_data,
            'suggested_products': product_serializer.data,
            'recent_searches': search_serializer.data
        }, status=status.HTTP_200_OK)


class SaveSearchQueryView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        query = request.data.get('query', '').strip()
        
        if not query:
            return Response({"error": "Query cannot be empty"}, status=status.HTTP_400_BAD_REQUEST)
        
        search_query = SearchQuery.objects.create(user=request.user, query=query)
        serializer = SearchQuerySerializer(search_query)
        
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class UserViewHistoryView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        # Get recent product views
        product_views = ProductView.objects.filter(user=request.user).select_related('product')[:20]
        
        # Get recent content views
        content_views = ContentView.objects.filter(user=request.user).select_related('content')[:20]
        
        product_serializer = ProductViewSerializer(product_views, many=True)
        content_serializer = ContentViewSerializer(content_views, many=True, context={'request': request})
        
        return Response({
            'product_views': product_serializer.data,
            'content_views': content_serializer.data
        }, status=status.HTTP_200_OK)
