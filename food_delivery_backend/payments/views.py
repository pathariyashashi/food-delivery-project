import razorpay

from django.conf import settings
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status


class CreateRazorpayOrderView(APIView):

    permission_classes = [IsAuthenticated]

    def post(self, request):

        amount = request.data.get("amount")

        if not amount:
            return Response(
                {"error": "Amount is required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            amount = float(amount)

            if amount <= 0:
                return Response(
                    {"error": "Amount must be greater than zero"},
                    status=status.HTTP_400_BAD_REQUEST
                )

            amount_in_paise = int(round(amount * 100))

            client = razorpay.Client(
                auth=(
                    settings.RAZORPAY_KEY_ID,
                    settings.RAZORPAY_KEY_SECRET
                )
            )

            razorpay_order = client.order.create({
                "amount": amount_in_paise,
                "currency": "INR",
                "payment_capture": 1
            })

            return Response({
                "message": "Razorpay order created successfully",
                "key_id": settings.RAZORPAY_KEY_ID,
                "order_id": razorpay_order["id"],
                "amount": razorpay_order["amount"],
                "currency": razorpay_order["currency"]
            })

        except Exception as e:
            return Response(
                {
                    "error": "Unable to create Razorpay order",
                    "details": str(e)
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class VerifyRazorpayPaymentView(APIView):

    permission_classes = [IsAuthenticated]

    def post(self, request):

        razorpay_order_id = request.data.get("razorpay_order_id")
        razorpay_payment_id = request.data.get("razorpay_payment_id")
        razorpay_signature = request.data.get("razorpay_signature")

        if not all([
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature
        ]):
            return Response(
                {"error": "Payment verification data is incomplete"},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            client = razorpay.Client(
                auth=(
                    settings.RAZORPAY_KEY_ID,
                    settings.RAZORPAY_KEY_SECRET
                )
            )

            client.utility.verify_payment_signature({
                "razorpay_order_id": razorpay_order_id,
                "razorpay_payment_id": razorpay_payment_id,
                "razorpay_signature": razorpay_signature
            })

            return Response({
                "message": "Payment verified successfully",
                "verified": True,
                "razorpay_order_id": razorpay_order_id,
                "razorpay_payment_id": razorpay_payment_id
            })

        except razorpay.errors.SignatureVerificationError:
            return Response(
                {
                    "message": "Payment verification failed",
                    "verified": False
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        except Exception as e:
            return Response(
                {
                    "error": "Unable to verify payment",
                    "details": str(e)
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )