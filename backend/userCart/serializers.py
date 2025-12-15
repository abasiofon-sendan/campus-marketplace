from rest_framework import serializers
from .models import CartItem

class CartItemSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source="product.product_name", read_only=True)
    product_image = serializers.JSONField(source="product.image_url", read_only=True)
    product_price = serializers.IntegerField(source="product.price", read_only=True)
    vendor_name = serializers.CharField(source="product.vendor_id.username", read_only=True)
    class Meta:
        model = CartItem
        fields = '__all__'
        extra_kwargs = {
            "user": {"read_only": True}
        }