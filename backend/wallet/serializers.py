from rest_framework import serializers
from .models import BuyerWallet, VendorWallet


class BuyerWalletSerializer(serializers.ModelSerializer):
    class Meta:
        model=BuyerWallet
        fields="__all__"

class VendorWalletSerializer(serializers.ModelSerializer):
    class Meta:
        model=VendorWallet
        fields="__all__"