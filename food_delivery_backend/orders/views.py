from decimal import Decimal

from django.db import transaction
from django.shortcuts import get_object_or_404

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status

from cart.models import Cart
from .models import Order, OrderItem
from .serializers import OrderSerializer
from tracking.models import DeliveryRider


class MyOrdersView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        orders = Order.objects.filter(
            user=request.user
        ).prefetch_related(
            "items"
        ).order_by("-created_at")

        serializer = OrderSerializer(
            orders,
            many=True
        )

        return Response({
            "count": orders.count(),
            "orders": serializer.data
        })
        
class PlaceOrderView(APIView):

    permission_classes = [IsAuthenticated]

    def post(self, request):

        # 1. Delivery address check
        delivery_address = request.data.get("delivery_address")

        if not delivery_address:
            return Response(
                {"error": "Delivery address is required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # 2. Logged-in user's cart
        cart = get_object_or_404(
            Cart,
            user=request.user
        )

        # 3. Get cart items with food and restaurant data
        cart_items = list(
            cart.items.select_related(
                "food_item",
                "food_item__restaurant"
            )
        )

        # 4. Empty cart check
        if not cart_items:
            return Response(
                {"error": "Cart is empty"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # 5. Check food availability
        unavailable_items = [
            item.food_item.name
            for item in cart_items
            if not item.food_item.is_available
        ]

        if unavailable_items:
            return Response(
                {
                    "error": "Some food items are currently unavailable",
                    "items": unavailable_items
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        # 6. Check restaurant
        restaurant_ids = {
            item.food_item.restaurant_id
            for item in cart_items
        }

        if len(restaurant_ids) != 1:
            return Response(
                {
                    "error": "Cart can contain items from only one restaurant"
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        restaurant = cart_items[0].food_item.restaurant

        # 7. Create Order + OrderItems
        with transaction.atomic():

            total_amount = sum(
                (
                    item.food_item.price * item.quantity
                    for item in cart_items
                ),
                Decimal("0.00")
            )

            order = Order.objects.create(
                user=request.user,
                restaurant=restaurant,
                total_amount=total_amount,
                delivery_address=delivery_address
            )

            for item in cart_items:

                subtotal = (
                    item.food_item.price * item.quantity
                )

                OrderItem.objects.create(
                    order=order,
                    food_item=item.food_item,
                    food_name=item.food_item.name,
                    price=item.food_item.price,
                    quantity=item.quantity,
                    subtotal=subtotal
                )

            # 8. Clear cart after successful order
            cart.items.all().delete()

        # 9. Return created order
        serializer = OrderSerializer(order)

        return Response(
            serializer.data,
            status=status.HTTP_201_CREATED
        )
        
class OrderDetailView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request, order_id):

        order = get_object_or_404(
            Order,
            id=order_id,
            user=request.user
        )

        serializer = OrderSerializer(order)

        return Response(
            serializer.data,
            status=status.HTTP_200_OK
        )     
        
class CancelOrderView(APIView):

    permission_classes = [IsAuthenticated]

    def patch(self, request, order_id):

        order = get_object_or_404(
            Order,
            id=order_id,
            user=request.user
        )

        if order.status != "pending":
            return Response(
                {
                    "error": "Only pending orders can be cancelled"
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        order.status = "cancelled"
        order.save(update_fields=["status"])

        serializer = OrderSerializer(order)

        return Response({
            "message": "Order cancelled successfully",
            "order": serializer.data
        }) 
        
class UpdateOrderStatusView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, order_id):
        new_status = request.data.get("status")

        if not new_status:
            return Response(
                {"error": "Status is required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        allowed_statuses = [
            "pending",
            "confirmed",
            "preparing",
            "out_for_delivery",
            "delivered",
            "cancelled",
        ]

        if new_status not in allowed_statuses:
            return Response(
                {"error": "Invalid status"},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            order = Order.objects.get(id=order_id)
        except Order.DoesNotExist:
            return Response(
                {"error": "Order not found"},
                status=status.HTTP_404_NOT_FOUND
            )

        user_role = getattr(request.user, "role", None)

        # Rider can update only his assigned order
        if user_role == "rider":
            try:
                rider = DeliveryRider.objects.get(user=request.user)
            except DeliveryRider.DoesNotExist:
                return Response(
                    {"error": "Delivery rider profile not found"},
                    status=status.HTTP_403_FORBIDDEN
                )

            if order.delivery_rider_id != rider.id:
                return Response(
                    {"error": "This order is not assigned to you"},
                    status=status.HTTP_403_FORBIDDEN
                )

        order.status = new_status
        order.save(update_fields=["status"])

        return Response(
            {
                "message": "Order status updated successfully",
                "order_id": order.id,
                "status": order.status,
            },
            status=status.HTTP_200_OK
        )                  
        
class AssignRiderView(APIView):

    permission_classes = [IsAuthenticated]

    def patch(self, request, order_id):

        rider_id = request.data.get("rider_id")

        if not rider_id:
            return Response(
                {
                    "error": "rider_id is required"
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            order = Order.objects.get(
                id=order_id
            )

        except Order.DoesNotExist:
            return Response(
                {
                    "error": "Order not found"
                },
                status=status.HTTP_404_NOT_FOUND
            )

        try:
            rider = DeliveryRider.objects.get(
                id=rider_id
            )

        except DeliveryRider.DoesNotExist:
            return Response(
                {
                    "error": "Rider not found"
                },
                status=status.HTTP_404_NOT_FOUND
            )

        order.delivery_rider = rider

        order.status = "out_for_delivery"

        order.save(
            update_fields=[
                "delivery_rider",
                "status",
            ]
        )

        return Response(
            {
                "message": "Rider assigned successfully",
                "order_id": order.id,
                "rider_id": rider.id,
                "status": order.status,
            },
            status=status.HTTP_200_OK
        )   
        
class MyAssignedOrdersView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):

        if getattr(request.user, "role", None) != "rider":
            return Response(
                {
                    "error": "Only delivery riders can access assigned orders"
                },
                status=status.HTTP_403_FORBIDDEN
            )

        try:
            rider = DeliveryRider.objects.get(
                user=request.user
            )
        except DeliveryRider.DoesNotExist:
            return Response(
                {
                    "error": "Delivery rider profile not found"
                },
                status=status.HTTP_404_NOT_FOUND
            )

        orders = (
            Order.objects
            .filter(delivery_rider=rider)
            .select_related("restaurant")
            .prefetch_related("items")
            .order_by("-created_at")
        )

        serializer = OrderSerializer(
            orders,
            many=True
        )

        return Response(
            serializer.data,
            status=status.HTTP_200_OK
        )             