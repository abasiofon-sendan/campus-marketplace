from django.db import models
from django.contrib.auth.models import User
from django.conf import settings

# Create your models here.

class Product(models.Model):
    vendor_id = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='products')
    product_name = models.CharField(max_length=100)
    description = models.TextField()
    price = models.DecimalField(max_digits=10,decimal_places=2)
    quantity = models.PositiveIntegerField()
    category = models.CharField(max_length=255)
    image_url= models.JSONField(max_length=255,blank=True,null=True, default=list)
    rating = models.PositiveIntegerField(default=0)
    view_count = models.PositiveIntegerField(default=0, null=True,blank=True)
    # rating = models.ForeignKey()
    
    


class ProductReviews(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name="product")
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="customer")
    rating = models.PositiveIntegerField()
    review = models.TextField()

class ProductView(models.Model):
    product =models.ForeignKey(Product, on_delete=models.CASCADE, related_name="views")
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('product', 'user')    
