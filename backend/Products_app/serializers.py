from rest_framework import serializers
from .models import *

class ProductSerializer(serializers.ModelSerializer):
    vendor_username = serializers.CharField(source="vendor_id.username", read_only=True)
    vendor_email = serializers.CharField(source="vendor_id.email", read_only=True)
    vendor_rating = serializers.CharField(source="vendor_id.rating", read_only=True)
    institute = serializers.CharField(source="vendor_id.institute", read_only=True)
    class Meta:
        model = Product
        fields ="__all__"