from rest_framework import serializers
# from .models import UserProfile
from django.contrib.auth import get_user_model
from djoser.serializers import UserCreateSerializer, UserSerializer
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import CustomUserModel
from paymentapp.models import VendorWallet, BuyerWallet

User = get_user_model()

class UserCreateSerializer(UserCreateSerializer):
    class Meta(UserCreateSerializer.Meta):
        model = User
        fields = ("id","email","username", "password","role","institute", "phone")

    def create(self, validate_data):
        email = validate_data.get('email')
        role = validate_data.get('role')
        username = validate_data.get('username')
        phone = validate_data.get("phone")

        email = email.strip() if email else None


        if not email or not role or not username:
            raise serializers.ValidationError("You must provide email,username and role.")


        
        user = CustomUserModel(
            email=email,
            role=role,
            username=username,
            phone=phone
        )
        user.set_password(validate_data['password'])
        user.save()
        if role == 'vendor':
            VendorWallet.objects.create(vendor=user, balance=0)
        elif role == 'buyer':
            BuyerWallet.objects.create(user=user, balance=0)
        return user


    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value
    
    


class UserSerializer(UserSerializer):
    class Meta(UserSerializer.Meta):
        model = User
        fields = ("id","username","role","email", "phone")

# class UserProfileSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = UserProfile
#         fields = ['user', 'role']        



class LoginSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        user = User.objects.get(pk=self.user.id)
        serializer= UserSerializer(user)
        data.update(
            {'user': serializer.data})
        return data
