from django.db import models
from django.conf import settings

User = settings.AUTH_USER_MODEL


class TopCustomers(models.Model):
    customer = models.ForeignKey(User, on_delete=models.CASCADE)
    total_purchases = models.PositiveBigIntegerField()

    def __str__(self):
        return f"{self.customer} - {self.total_purchases}"
    
class TopVendors(models.Model):
    vendor = models.ForeignKey(User, on_delete=models.CASCADE)
    total_sales = models.PositiveBigIntegerField()

    def __str__(self):
        return f"{self.vendor} - {self.total_sales}"