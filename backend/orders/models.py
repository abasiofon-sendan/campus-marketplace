from django.db import models
import uuid
from django.contrib.auth import get_user_model
from Products_app.models import Product

User = get_user_model()

# Create your models here.


def generate_order_id():
    return f"ORD-{str(uuid.uuid4())[4:11]}"


class Order(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('accepted', 'Accepted by vendor'),
        ('awaiting', 'Waiting for delivery'),
        ('completed', 'Completed'),
        ('expired', 'Expired - Refunded')
    ]

    id = models.CharField(primary_key=True, max_length=20, unique=True, default=generate_order_id, editable=False)
    buyer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='purchases')
    vendor = models.ForeignKey(User, on_delete=models.CASCADE, related_name="sales")
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=30, choices=STATUS_CHOICES, default='pending')

    qr_code = models.UUIDField(default=uuid.uuid4, unique=True)
    qr_expires_at = models.DateTimeField(blank=True, null=True)
    qr_scanned = models.BooleanField(default=False)
    qr_scanned_at = models.DateTimeField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)