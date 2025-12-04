from rest_framework.exceptions import ValidationError
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from account.models import CustomUserModel
from .models import TopCustomers, TopVendors, VendorProfiles, VendorContents, Follow, ContentLike, ContentReview
from .serializers import TopCustomersSerializer, TopVendorsSerializer, VendorContentSerializer, VendorProfilesSerializer, FollowSerializer, ContentLikeSerializer, ContentReviewSerializer
from rest_framework import status
from rest_framework.pagination import PageNumberPagination


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


class UpdateProfileView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        if request.user.role != 'vendor':
            return Response(
                {"error": "Only vendors can create profiles"}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        try:
            if VendorProfiles.objects.filter(user=request.user).exists():
                return Response(
                    {"error": "Profile already exists. Use edit endpoint to update."}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            data = request.data.copy()
            data['user'] = request.user.id
            
            serializer = VendorProfilesSerializer(data=data)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        

class EditProfileView(APIView):
    permission_classes = [IsAuthenticated]
    
    def put(self, request, pk):
        if request.user.role != 'vendor':
            return Response(
                {"error": "Only vendors can edit profiles"}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        try:
            profile = VendorProfiles.objects.get(pk=pk)
            
            if profile.user != request.user:
                return Response(
                    {"error": "You can only edit your own profile"}, 
                    status=status.HTTP_403_FORBIDDEN
                )
            
            serializer = VendorProfilesSerializer(profile, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data, status=status.HTTP_200_OK)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except VendorProfiles.DoesNotExist:
            return Response({"error": "Profile not found"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class DeleteProfileView(APIView):
    permission_classes = [IsAuthenticated]
    
    def delete(self, request, pk):
        if request.user.role != 'vendor':
            return Response(
                {"error": "Only vendors can delete profiles"}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        try:
            profile = VendorProfiles.objects.get(pk=pk)
            
            if profile.user != request.user:
                return Response(
                    {"error": "You can only delete your own profile"}, 
                    status=status.HTTP_403_FORBIDDEN
                )
            
            user = CustomUserModel.objects.get(id=profile.user.id)
            user.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except VendorProfiles.DoesNotExist:
            return Response({"error": "Profile not found"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class UserDeleteProfile(APIView):
    permission_classes = [IsAuthenticated]
    
    def delete(self, request):
        try:
            user = request.user
            user.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class UploadContentView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        if request.user.role != 'vendor':
            return Response(
                {"error": "Only vendors can upload content"}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        try:
            data = request.data.copy()
            data['user'] = request.user.id
            
            serializer = VendorContentSerializer(data=data)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class GetVendorProfileAndContents(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request, pk):
        try:
            profile = VendorProfiles.objects.get(user__id=pk)
            
            if profile.user.role != 'vendor':
                return Response(
                    {"error": "This user is not a vendor"}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            contents = profile.user.videos.all().order_by('-uploaded_at')
            
            # Check if current user is following this vendor
            is_following = Follow.objects.filter(follower=request.user, vendor=profile.user).exists()
            
            # Configure pagination
            paginator = PageNumberPagination()
            paginator.page_size = 10
            paginated_contents = paginator.paginate_queryset(contents, request)
            
            profile_serializer = VendorProfilesSerializer(profile)
            contents_serializer = VendorContentSerializer(
                paginated_contents, 
                many=True, 
                context={'request': request}
            )
            
            return Response({
                "profile": profile_serializer.data,
                "is_following": is_following,
                "followers_count": profile.followers_count,
                "contents": contents_serializer.data,
                "contents_count": contents.count(),
                "next": paginator.get_next_link(),
                "previous": paginator.get_previous_link()
            }, status=status.HTTP_200_OK)
        except VendorProfiles.DoesNotExist:
            return Response({"error": "Vendor profile not found"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class FollowVendorView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request, vendor_id):
        try:
            vendor = CustomUserModel.objects.get(id=vendor_id, role='vendor')
            
            if request.user == vendor:
                return Response(
                    {"error": "You cannot follow yourself"}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Check if already following
            if Follow.objects.filter(follower=request.user, vendor=vendor).exists():
                return Response(
                    {"error": "You are already following this vendor"}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            follow = Follow.objects.create(follower=request.user, vendor=vendor)
            serializer = FollowSerializer(follow)
            
            # Get updated follower count
            vendor_profile = VendorProfiles.objects.get(user=vendor)
            
            return Response({
                **serializer.data,
                "vendor_followers_count": vendor_profile.followers_count,
                "message": "Successfully followed vendor"
            }, status=status.HTTP_201_CREATED)
        
        except CustomUserModel.DoesNotExist:
            return Response({"error": "Vendor not found"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def delete(self, request, vendor_id):
        try:
            vendor = CustomUserModel.objects.get(id=vendor_id, role='vendor')
            follow = Follow.objects.get(follower=request.user, vendor=vendor)
            follow.delete()
            
            # Get updated follower count
            vendor_profile = VendorProfiles.objects.get(user=vendor)
            
            return Response({
                "message": "Successfully unfollowed",
                "vendor_followers_count": vendor_profile.followers_count
            }, status=status.HTTP_200_OK)
        
        except CustomUserModel.DoesNotExist:
            return Response({"error": "Vendor not found"}, status=status.HTTP_404_NOT_FOUND)
        except Follow.DoesNotExist:
            return Response({"error": "You are not following this vendor"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class LikeContentView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request, content_id):
        try:
            content = VendorContents.objects.get(id=content_id)
            
            # Check if already liked
            if ContentLike.objects.filter(user=request.user, content=content).exists():
                return Response(
                    {"error": "You have already liked this content"}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            like = ContentLike.objects.create(user=request.user, content=content)
            serializer = ContentLikeSerializer(like)
            
            return Response({
                **serializer.data,
                "message": "Successfully liked content"
            }, status=status.HTTP_201_CREATED)
        
        except VendorContents.DoesNotExist:
            return Response({"error": "Content not found"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def delete(self, request, content_id):
        try:
            content = VendorContents.objects.get(id=content_id)
            like = ContentLike.objects.get(user=request.user, content=content)
            like.delete()
            
            # Get updated likes count after deletion
            updated_likes_count = content.likes_count
            
            return Response({
                "message": "Successfully unliked",
                "content_likes_count": updated_likes_count
            }, status=status.HTTP_200_OK)
        
        except VendorContents.DoesNotExist:
            return Response({"error": "Content not found"}, status=status.HTTP_404_NOT_FOUND)
        except ContentLike.DoesNotExist:
            return Response({"error": "You have not liked this content"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class ReviewContentView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request, content_id):
        if request.user.role != 'buyer':
            return Response(
                {"error": "Only buyers can review content"}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        try:
            content = VendorContents.objects.get(id=content_id)
            
            # Check if already reviewed
            if ContentReview.objects.filter(user=request.user, content=content).exists():
                return Response(
                    {"error": "You have already reviewed this content"}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            serializer = ContentReviewSerializer(data=request.data)
            if serializer.is_valid():
                serializer.save(user=request.user, content=content)
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        except VendorContents.DoesNotExist:
            return Response({"error": "Content not found"}, status=status.HTTP_404_NOT_FOUND)
        except ValidationError as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def put(self, request, content_id):
        if request.user.role != 'buyer':
            return Response(
                {"error": "Only buyers can review content"}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        try:
            content = VendorContents.objects.get(id=content_id)
            review = ContentReview.objects.get(user=request.user, content=content)
            
            serializer = ContentReviewSerializer(review, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data, status=status.HTTP_200_OK)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        except VendorContents.DoesNotExist:
            return Response({"error": "Content not found"}, status=status.HTTP_404_NOT_FOUND)
        except ContentReview.DoesNotExist:
            return Response({"error": "Review not found"}, status=status.HTTP_404_NOT_FOUND)
        except ValidationError as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def delete(self, request, content_id):
        try:
            content = VendorContents.objects.get(id=content_id)
            review = ContentReview.objects.get(user=request.user, content=content)
            review.delete()
            return Response({"message": "Review deleted successfully"}, status=status.HTTP_204_NO_CONTENT)
        
        except VendorContents.DoesNotExist:
            return Response({"error": "Content not found"}, status=status.HTTP_404_NOT_FOUND)
        except ContentReview.DoesNotExist:
            return Response({"error": "Review not found"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class GetContentReviewsView(APIView):
    def get(self, request, content_id):
        try:
            content = VendorContents.objects.get(id=content_id)
            reviews = content.content_reviews.all()
            
            # Configure pagination
            paginator = PageNumberPagination()
            paginator.page_size = 10
            paginated_reviews = paginator.paginate_queryset(reviews, request)
            
            serializer = ContentReviewSerializer(paginated_reviews, many=True)
            
            return Response({
                "reviews": serializer.data,
                "total_reviews": reviews.count(),
                "next": paginator.get_next_link(),
                "previous": paginator.get_previous_link()
            }, status=status.HTTP_200_OK)
        
        except VendorContents.DoesNotExist:
            return Response({"error": "Content not found"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


