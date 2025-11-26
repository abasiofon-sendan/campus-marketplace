from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
import uuid
import requests
from decimal import Decimal
from django.conf import settings
from paymentapp.models import BuyerWallet
from .models import TopUpMOdel


class TopUpWAlletView(APIView):
    def post(self,request):
        user = request.user
        amount = request.data.get("amount")
        amount = int(amount) *100

        if not amount or int(amount) <=0:
            return Response({"error": "Invalid amount"})
        

        try:
            wallet = BuyerWallet.objects.get(user=user)
        except BuyerWallet.DoesNotExist:
            return Response({"error": "Wallet not found."}, status=status.HTTP_404_NOT_FOUND)
        
        reference = str(uuid.uuid4()).replace("-", "")[:12]
        headers ={
            "Authorization":f"Bearer {settings.PAYSTACK_SECRET_KEY}",
            "Content-Type":"application/json"
        }

        data={
            "email":user.email,
            "amount":amount,
            "reference":reference,
            "metadata":{"wallet_top_up":True}

        }

        res = requests.post("https://api.paystack.co/transaction/initialize",json=data,headers=headers)

        res_data= res.json()

        if res_data["status"] or res_data["data"]["status"]=="success":
            TopUpMOdel.objects.create(
                buyer=wallet,
                amount=amount,
                status="PENDING",
                transaction_type="TOPUP"
            )

            return Response({
                "message":"TOPUP initialize successfully","details":res_data
            },status=status.HTTP_200_OK)
        return Response({"error":"Failed to initialize top-up","detail": res_data},status=status.HTTP_400_BAD_REQUEST)
    

class VerifyTopupView(APIView):
    def get(self,request,reference):
        headers = {
            "Authorization":f"Bearer {settings.PAYSTACK_SECRET_KEY}",
            "Content-Type":"application/json"
        }

        res = requests.get(
            f"https://api.paystack.co/transaction/verify/{reference}",
            headers=headers
            
            )
        res_data = res.json()

        if res_data['status'] or res_data["data"]["status"]=="success":

            user = request.user
            wallet = BuyerWallet.objects.get(user=user)

            transaction=TopUpMOdel.objects.get(
                reference=reference,
                status="PENDING"
            )

            metadata = res_data["data"]
            amount = metadata["amount"]

            wallet.balance +=amount
            transaction.status="COMPLETED"
    
            wallet.save()
            transaction.save()
            return Response({"data":res_data},status=status.HTTP_200_OK)
        return Response({"error":"Failed to verifiy TOPUP"},status=status.HTTP_400_BAD_REQUEST)

            
        
