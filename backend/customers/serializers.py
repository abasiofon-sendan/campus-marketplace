from rest_framework import serializers
from .models import TopCustomers, TopVendors, VendorContents, VendorProfiles

class TopCustomersSerializer(serializers.ModelSerializer):
    class Meta:
        model = TopCustomers
        fields = ['customer', 'total_purchases']
         

class TopVendorsSerializer(serializers.ModelSerializer):
    class Meta:
        model = TopVendors
        fields = ['vendor', 'total_sales']


class VendorProfilesSerializer(serializers.ModelSerializer):
    class Meta:
        model = VendorProfiles
        fields = '__all__'


class VendorContentSerializer(serializers.ModelSerializer):
    content_type = serializers.SerializerMethodField()
    
    class Meta:
        model = VendorContents
        fields = ['id', 'user', 'video', 'pictures', 'caption', 'uploaded_at', 'content_type', 'likes', 'reviews']
        
    def get_content_type(self, obj):
        if obj.video:
            return 'video'
        elif obj.pictures:
            return 'picture'
        return None
    
    def validate(self, data):
        video = data.get('video')
        pictures = data.get('pictures')
        
        if video and pictures:
            raise serializers.ValidationError("You can only upload either a video or pictures, not both.")
        
        if not video and not pictures:
            raise serializers.ValidationError("You must upload either a video or pictures.")
        
        return data