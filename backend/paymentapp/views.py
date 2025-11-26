from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from userCart.models import CartItem
from userCart.serializers import CartItemSerializer 
from .models import Transaction, VendorWallet,BuyerWallet

import uuid
from django.conf import settings
import requests

class InitializePaymentView(APIView):
    def post(self,request,car_id):
        user = request.user
        quantity = request.data.get("quantity")
        try:
            cart_item = CartItem.objects.get(id=car_id, user=user)
        except CartItem.DoesNotExist:
            return Response({"error": "Cart item not found."}, status=status.HTTP_404_NOT_FOUND)
        
        product = cart_item.product
        vendor_user = product.vendor_name
        
        reference = str(uuid.uuid4()).replace("-", "")[:12]
        amount = product.price * quantity
        # vendor = cart_item.product.vendor_name

        headers = {
            "Authorization": f"Bearer {settings.PAYSTACK_SECRET_KEY}",
            "Content-Type":"application/json"
        }

        data = {
            "email": user.email,
            "amount": int(amount * 100),
            "metadata": {
                "cart_id": cart_item.id,
                "vendor_name": vendor_user.username,
                "quantity": quantity,
            },
            "reference": reference,
        }

        res = requests.post(
            "https://api.paystack.co/transaction/initialize",
            json=data,
            headers=headers
        )

        res_data = res.json()
        # buyer_wallet = user.Buyer
        vendor_wallet= VendorWallet.objects.get(vendor=vendor_user)
        buyer_wallet= BuyerWallet.objects.get(user=user)

        # print("Vendor wallet is:", wallet_vendor)
        # print("Buyer wallet is:", wallet_buyer)
          # the OneToOne related object
        # vendor_wallet = vendor.Vendor

        if res.status_code == 200:
            Transaction.objects.create(
                buyer=buyer_wallet,
                vendor=vendor_wallet,
                quantity=quantity,
                amount=amount,
                reference=reference,
                status='PENDING',
                transaction_type='PURCHASE'
            )
        return Response(res_data, status=status.HTTP_200_OK)
        # return Response(res_data, status=res.status_code)
    

class VerifyPaymentView(APIView):
    def get(self,request,reference):

        headers = {
            "Authorization": f"Bearer {settings.PAYSTACK_SECRET_KEY}",
        }
        res = requests.get(
            f"https://api.paystack.co/transaction/verify/{reference}",
            headers=headers
        )
        res_data = res.json()

        # verify payment status

        if not res_data['status'] or res_data["data"]["status"]!="success":
            return Response ({"error": "payment verification failed."}, status=status.HTTP_400_BAD_REQUEST)
        
        # extract metadata
        metadata = res_data["data"]["metadata"]
        cart_id = metadata["cart_id"]
        quantity = int(metadata["quantity"])

        # Get cart item
        try:
            cart_item = CartItem.objects.get(id=cart_id,user= request.user)
        except CartItem.DoesNotExist:
            return Response({"error": "Cart item not found."}, status=status.HTTP_404_NOT_FOUND)
        
            
        expected_amount = cart_item.product.price * quantity

        # Get transaction using reference

        try :
            transaction = Transaction.objects.get(
                reference=reference,
                status='PENDING',
            )
        except Transaction.DoesNotExist:
            return Response({"error": "Transaction not found or already processed."}, status=status.HTTP_404_NOT_FOUND)
        
        # Ger correct wallets for the transaction
        
        buyer_wallet= transaction.buyer
        vendor_wallet=transaction.vendor

        # buyer_wallet.balance += 200000

        # Move fund between wallets

        buyer_wallet.balance -= expected_amount
        vendor_wallet.balance += expected_amount

        buyer_wallet.save()
        vendor_wallet.save()

        # Update transaction status
            
        transaction.status = 'COMPLETED'
        transaction.save()

        # Remove cart item after successful payment

        cart_item.delete()

        return Response({"message": "Payment verified and processed successfully."}, status=status.HTTP_200_OK)



            