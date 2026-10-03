from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status

from .models import DeliveryRider
from orders.models import Order
from .serializers import DeliveryRiderSerializer

class UpdateRiderLocationView(APIView):

    permission_classes = [IsAuthenticated]

    def post(self, request):

        # =====================================
        # CHECK USER ROLE
        # =====================================

        if getattr(request.user, "role", None) != "rider":
            return Response(
                {
                    "error": "Only delivery riders can update location"
                },
                status=status.HTTP_403_FORBIDDEN
            )


        # =====================================
        # GET DATA
        # =====================================

        latitude = request.data.get("latitude")
        longitude = request.data.get("longitude")
        order_id = request.data.get("order_id")


        # =====================================
        # VALIDATION
        # =====================================

        if latitude is None or longitude is None:
            return Response(
                {
                    "error": "Latitude and longitude are required"
                },
                status=status.HTTP_400_BAD_REQUEST
            )


        if not order_id:
            return Response(
                {
                    "error": "Order ID is required"
                },
                status=status.HTTP_400_BAD_REQUEST
            )


        # =====================================
        # GET RIDER
        # =====================================

        try:

            rider = DeliveryRider.objects.get(
                user=request.user
            )

        except DeliveryRider.DoesNotExist:

            return Response(
                {
                    "error": "You are not registered as a delivery rider"
                },
                status=status.HTTP_403_FORBIDDEN
            )


        # =====================================
        # GET ASSIGNED ORDER
        # =====================================

        try:

            order = Order.objects.get(
                id=order_id,
                delivery_rider=rider
            )

        except Order.DoesNotExist:

            return Response(
                {
                    "error": "Order not assigned to this rider"
                },
                status=status.HTTP_404_NOT_FOUND
            )


        # =====================================
        # SAVE RIDER LOCATION
        # =====================================

        rider.latitude = latitude
        rider.longitude = longitude
        rider.is_online = True

        rider.save(
            update_fields=[
                "latitude",
                "longitude",
                "is_online",
                "updated_at",
            ]
        )


        # =====================================
        # SEND LIVE LOCATION
        # =====================================

        channel_layer = get_channel_layer()

        async_to_sync(
            channel_layer.group_send
        )(
            f"order_{order.id}",
            {
                "type": "location_update",

                "order_id": order.id,

                "latitude": str(
                    latitude
                ),

                "longitude": str(
                    longitude
                ),
            }
        )


        # =====================================
        # RESPONSE
        # =====================================

        return Response(
            {
                "message": "Location updated successfully",

                "order_id": order.id,

                "latitude": latitude,

                "longitude": longitude,
            },
            status=status.HTTP_200_OK
        )
        
        
class RiderListView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        riders = DeliveryRider.objects.select_related(
            "user"
        ).filter(
            is_available=True
        )

        serializer = DeliveryRiderSerializer(
            riders,
            many=True
        )

        return Response(
            serializer.data,
            status=status.HTTP_200_OK
        )        