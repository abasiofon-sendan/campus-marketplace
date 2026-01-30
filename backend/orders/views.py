from django.shortcuts import render
from .models import Order
from .serializers import OrderSerializer
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.db.models import Q
from rest_framework.permissions import IsAuthenticated
from django.db import transaction as db_transaction
from wallet.models import EscrowWallet
from paymentapp.models import VendorWallet
from django.db.models import F
from notification.utils import send_notification_to_user
from django.utils import timezone

# Create your views here.


class GetAllOrders(APIView):
    def get(self, request):
        user = request.user
        data = Order.objects.filter(
            Q(vendor=user) | Q(buyer=user)
        ).select_related("vendor", "buyer")

        serializer = OrderSerializer(data, many=True)

        return Response(serializer.data, status=status.HTTP_200_OK)
    
class ValidateOrderQRCodeView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self,request):
        vendor = request.user
        order_id = request.data.get("order_id")

        if not order_id:
            return Response({"error":"Order ID is required"}, status=status.HTTP_400_BAD_REQUEST)
        try:
            order = Order.objects.select_for_update().get(id=order_id)
        except Order.DoesNotExist:
            return Response({"error":"Order not found"}, status=status.HTTP_404_NOT_FOUND)
        
        if order.vendor_id != vendor.id:
            return Response({"error":"You are not authorized to validate this order"}, status=status.HTTP_403_FORBIDDEN)
        if order.status != "pending":
            return Response({"error":f"Order already {order.status}",
                             "current_status":order.status},status=status.HTTP_400_BAD_REQUEST)
        
        with db_transaction.atomic():
            try:
                escrow = EscrowWallet.objects.select_for_update().get(order=order)
            except EscrowWallet.DoesNotExist:
                return Response({"error":"vendor wallet not found"},status= status.HTTP_404_NOT_FOUND)
            
            if escrow.status != "HELD":
                return Response({"error":"Escrow is not in HELD status"}, status=status.HTTP_400_BAD_REQUEST)
            
            try:
                vendor_wallet = VendorWallet.objects.select_for_update().get(vendor_id=vendor.id)
            except VendorWallet.DoesNotExist:
                    return Response({"error":"vendor wallet not found"},status= status.HTTP_404_NOT_FOUND)
            
            VendorWallet.objects.filter(vendor_id=vendor.id).update(
                balance= F('balance') + escrow.amount)
            
            escrow.status = "RELEASED"
            escrow.released_at = timezone.now()
            escrow.save()   
            order.status = "COMPLETED"
            order.save()

            send_notification_to_user(
                user=order.buyer,
                title="Order Confirmed",
                message=f"Your order {order.id} has been completed successfully.",
                notification_type="order"
            )
            send_notification_to_user(
                user=order.vendor,
                title="Order Confirmed",
                message=f"You have successfully completed order {order.id}.",
                notification_type="order"
            )

            return Response({
                "message": "Order validated and payment released from escrow successfully.",
                "order_id": order.id,
                "amount_released": str(escrow.amount),
                "order_status": order.status
            }, status=status.HTTP_200_OK)