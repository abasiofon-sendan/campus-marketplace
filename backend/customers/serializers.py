from rest_framework import serializers
from .models import TopCustomers, TopVendors

class TopCustomersSerializer(serializers.ModelSerializer):
    class Meta:
        model = TopCustomers
        fields = ['customer', 'total_purchases']
         

class TopVendorsSerializer(serializers.ModelSerializer):
    class Meta:
        model = TopVendors
        fields = ['vendor', 'total_sales']