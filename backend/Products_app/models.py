from django.db import models
from django.contrib.auth.models import User
from django.conf import settings

# Create your models here.
class Product(models.Model):
    vendor_name = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='products')
    product_name = models.CharField(max_length=100)
    description = models.TextField()
    price = models.DecimalField(max_digits=10,decimal_places=2)
    quantity = models.PositiveIntegerField()
    category = models.CharField(max_length=255)
    image_url= models.JSONField(max_length=255,blank=True,null=True, default=list)
    rating = models.PositiveIntegerField()
    # rating = models.ForeignKey()
    def __str__(self):
        return f"{self.product_name} ({self.vendor_name.username})"