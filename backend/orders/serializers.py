from rest_framework import serializers
from .models import Order


class OrderSerializer(serializers.ModelSerializer):
    buyer_username = serializers.CharField(source='buyer.username', read_only=True)
    vendor_username = serializers.CharField(source='vendor.username', read_only=True)
    class Meta:
        model = Order
        fields = ('id', 'buyer', 'buyer_username', 'vendor_username', 'vendor','product', 'amount', 'status', 'qr_code', 'created_at', 'completed_at')
        read_only_fields = ('qr_code', 'created_at', 'id')