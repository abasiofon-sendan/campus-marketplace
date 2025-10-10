from rest_framework import status
from rest_framework.response import Response
from django.core.exceptions import ObjectDoesNotExist
from rest_framework.views import APIView
from rest_framework.authtoken.models import Token
from .utils import send_email_verification, generate_verification_code, CustomPasswordResetTokenGenerator, gen_simple_token
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from rest_framework_simplejwt.tokens import RefreshToken
from django.utils.crypto import get_random_string
from django.utils import timezone
from datetime import timedelta
from django.core import signing
from django.conf import settings
from django.db import transaction
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.tokens import AccessToken
from rest_framework.permissions import AllowAny
from django.contrib.auth import get_user_model
from .models import Profile, EmailVerification, ResetPassword, ResetPasswordValuationToken
from .serializers import UserSerializer, ProfileSerializer, OTPVerificationSerializer, EditProfileSerializer
import os

import dotenv

dotenv.load_dotenv()

User = get_user_model()


class RegisterUser(APIView):
    authentication_classes = []
    permission_classes = []

    def post(self, request):
        try:
            serializer = UserSerializer(data=request.data)
            if serializer.is_valid(raise_exception=True):
                with transaction.atomic():
                    account = serializer.save()
                    
                    account.email_verified = True
                    account.save()
                    
                    refresh = RefreshToken.for_user(account)
                    
                    return Response(
                        {
                            "message": "Account successfully created",
                            "state": True,
                            "user": ProfileSerializer(account).data,
                            "refresh_token": str(refresh),
                            "access_token": str(refresh.access_token)
                        },
                        status=status.HTTP_201_CREATED
                    )
                    
        except Exception as e:
            print(str(e))
            return Response(
                {
                    "message": "An error occurred during registration",
                    "state": False,
                    "error": str(e)
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )




class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    username = "identifier"
    @classmethod
    def get_token(cls, user):
        refresh = super().get_token(user)
        refresh['role'] = user.role 
        return refresh

    def validate(self, attrs):
        data = super().validate(attrs)
        user = self.user

        data['user'] = ProfileSerializer(user).data

        data['access_token'] = data.pop('access')
        data['refresh_token'] = data.pop('refresh')
        return data
    


@method_decorator(csrf_exempt, name='dispatch')
class LoginView(TokenObtainPairView):

    authentication_classes = []
    permission_classes = []
    serializer_class = MyTokenObtainPairSerializer
        
    def post(self, request, *args, **kwargs):
        return super().post(request, *args, **kwargs)



class ResetPasswordView(APIView):
    authentication_classes = []
    permission_classes = [AllowAny]

    def post(self, request):
        try:
            serializer = ResetPassword(data=request.data)
            serializer.is_valid(raise_exception=True)

            user, code = serializer.save()

            # Send email with token
            send_email = send_email_verification(
                subject="Reset Password",
                template="accounts/password_reset.html",
                email=user.email,
                context={"token": code}
            )

            if send_email:
                ResetPassword.objects.create(profile=Profile.objects.get(id=user.id), otp=int(code))
                return Response({
                    "email": user.email,
                    "otp": code
                }, status=status.HTTP_200_OK)

            return Response({
                "message": "Failed to send reset email",
                "state": False
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        except Exception as e:
            print(f"Reset error: {str(e)}")
            return Response({
                "message": "An error occurred",
                "state": False
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)



class EditProfile(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            user = request.user
            serializer = EditProfileSerializer(user)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'message': 'An error occurred', 'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def put(self, request):
        try:
            user = request.user
            serializer = EditProfileSerializer(user, data=request.data, partial=True)
            if serializer.is_valid(raise_exception=True):
                serializer.save()
                return Response(serializer.data, status=status.HTTP_200_OK)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({'message': 'An error occurred', 'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)