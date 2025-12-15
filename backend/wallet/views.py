from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
import uuid
import requests
from decimal import Decimal
from django.conf import settings
from paymentapp.models import BuyerWallet
from paymentapp.serializers import BuyerWalletSerializer
from .models import TopUpMOdel
from rest_framework.permissions import IsAuthenticated



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
            # Ensure we persist the generated reference so the DB unique constraint
            # is respected and later verification can look up the transaction.
            try:
                TopUpMOdel.objects.create(
                    buyer=wallet,
                    amount=amount,
                    status="PENDING",
                    transaction_type="TOPUP",
                    reference=reference,
                )
            except Exception:
                # If a rare collision or DB error occurs, generate a fresh reference
                # and attempt a single retry to avoid IntegrityError on empty/duplicate refs.
                reference = str(uuid.uuid4()).replace("-", "")[:12]
                TopUpMOdel.objects.create(
                    buyer=wallet,
                    amount=amount,
                    status="PENDING",
                    transaction_type="TOPUP",
                    reference=reference,
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

        if res_data.get('status') or (res_data.get("data") and res_data["data"].get("status") == "success"):

            user = request.user
            try:
                wallet = BuyerWallet.objects.get(user=user)
            except BuyerWallet.DoesNotExist:
                return Response({"error": "Wallet not found."}, status=status.HTTP_404_NOT_FOUND)

            # Try to find the transaction regardless of status so we can be idempotent.
            transaction = TopUpMOdel.objects.filter(reference=reference).first()
            if not transaction:
                return Response({"error": "Top-up transaction not found."}, status=status.HTTP_404_NOT_FOUND)

            # Ensure the requester owns the transaction
            if getattr(transaction.buyer, 'user', None) != user:
                return Response({"error": "You are not authorized to verify this transaction."}, status=status.HTTP_403_FORBIDDEN)

            # If the transaction was already processed, return success with current balance
            if transaction.status == "COMPLETED":
                try:
                    wallet_balance = float(Decimal(transaction.buyer.balance) / Decimal(100))
                except Exception:
                    wallet_balance = None
                return Response({"message": "Top-up already processed.", "wallet_balance": wallet_balance, "data": res_data}, status=status.HTTP_200_OK)

            # At this point the transaction exists and is not completed -> process it
            metadata = res_data.get("data", {})
            amount = metadata.get("amount", transaction.amount or 0)

            # amount from Paystack is in the smallest unit (kobo). DB stores balance in kobo.
            transaction.buyer.balance += int(amount)
            transaction.status = "COMPLETED"

            transaction.buyer.save()
            transaction.save()

            # Return the updated wallet balance in major units (Naira)
            try:
                wallet_balance = float(Decimal(transaction.buyer.balance) / Decimal(100))
            except Exception:
                wallet_balance = None

            return Response({
                "data": res_data,
                "wallet_balance": wallet_balance
            }, status=status.HTTP_200_OK)
        return Response({"error":"Failed to verifiy TOPUP"},status=status.HTTP_400_BAD_REQUEST)

            


class GetWalletBalanceView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        data = BuyerWallet.objects.get(user=request.user)
        serializer = BuyerWalletSerializer(data)
        return Response(serializer.data)
        
