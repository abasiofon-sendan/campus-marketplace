from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()


class TopCustomers(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="top_customer")
    total_purchases = models.PositiveIntegerField()

    def __str__(self):
        return f"{self.user.username} - {self.total_purchases}"
    

class TopVendors(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="top_vendor")
    total_sales = models.PositiveIntegerField()

    def __str__(self):
        return f"{self.user.username} - {self.total_sales}"