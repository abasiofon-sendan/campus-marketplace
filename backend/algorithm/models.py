from django.db import models
from Products_app.models import Product
from django.contrib.auth import get_user_model
User = get_user_model()


# Create your models here.

class UserCategoryModel(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="user")
    category = models.CharField(max_length=100, unique=True)
    view_count = models.PositiveIntegerField(default=1)