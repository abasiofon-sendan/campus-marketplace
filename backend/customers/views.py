from django.shortcuts import render
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated

from account.models import CustomUserModel
from .models import TopCustomers, TopVendors, VendorProfiles, VendorContents
from .serializers import TopCustomersSerializer, TopVendorsSerializer, VendorContentSerializer, VendorProfilesSerializer
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
        # Only vendors can create/update profilesx
        if request.user.role != 'vendor':
            return Response(
                {"error": "Only vendors can create profiles"}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        try:
            # Check if profile already exists
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
        # Only vendors can edit profiles
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
        # Only vendors can upload content
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


class GetUserProfileAndContents(APIView):
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
            
            # Configure pagination
            paginator = PageNumberPagination()
            paginator.page_size = 10
            paginated_contents = paginator.paginate_queryset(contents, request)
            
            profile_serializer = VendorProfilesSerializer(profile)
            contents_serializer = VendorContentSerializer(paginated_contents, many=True)
            
            return Response({
                "profile": profile_serializer.data,
                "contents": contents_serializer.data,
                "contents_count": contents.count(),
                "next": paginator.get_next_link(),
                "previous": paginator.get_previous_link()
            }, status=status.HTTP_200_OK)
        except VendorProfiles.DoesNotExist:
            return Response({"error": "Vendor profile not found"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)