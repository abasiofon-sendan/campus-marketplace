from django.db import models
from paymentapp.models import BuyerWallet
from django.contrib.auth import get_user_model

User = get_user_model()

PAYMENT_STATUS = [
    ("PENDING","pending"),
    ("COMPLETED","completed")
]

class TopUpMOdel(models.Model):
    buyer = models.ForeignKey(BuyerWallet,on_delete=models.CASCADE)
    amount=models.PositiveBigIntegerField()
    status = models.CharField(max_length=10,choices=PAYMENT_STATUS,default="PENDING")
    transaction_type = models.CharField(max_length=10, default="TOPUP")
    reference = models.CharField(max_length=36, unique=True, blank=True)