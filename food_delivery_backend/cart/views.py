from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from decimal import Decimal
from .models import Cart, CartItem
from .serializers import CartItemSerializer
from menu.models import FoodItem
from django.shortcuts import get_object_or_404


class AddToCartView(APIView):

    permission_classes = [IsAuthenticated]

    def post(self, request):

        food_item_id = request.data.get("food_item")
        quantity = request.data.get("quantity", 1)

        food_item = FoodItem.objects.get(id=food_item_id)

        cart, created = Cart.objects.get_or_create(
            user=request.user
        )

        cart_item, created = CartItem.objects.get_or_create(
            cart=cart,
            food_item=food_item
        )

        if created:
            cart_item.quantity = int(quantity)
        else:
            cart_item.quantity += int(quantity)

        cart_item.save()

        serializer = CartItemSerializer(cart_item)

        return Response(
            serializer.data,
            status=status.HTTP_201_CREATED
        )
        
class UserCartView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        cart, created = Cart.objects.get_or_create(
            user=request.user
        )

        cart_items = CartItem.objects.filter(cart=cart)

        serializer = CartItemSerializer(
            cart_items,
            many=True
        )

        total_amount = Decimal("0.00")
        total_items = 0

        for item in cart_items:
            total_amount += item.food_item.price * item.quantity
            total_items += item.quantity

        return Response({
            "cart_id": cart.id,
            "user": request.user.username,
            "items": serializer.data,
            "total_items": total_items,
            "total_amount": total_amount
        })        
        
        


class UpdateCartItemView(APIView):

    permission_classes = [IsAuthenticated]

    def patch(self, request, item_id):

        cart_item = get_object_or_404(
            CartItem,
            id=item_id,
            cart__user=request.user
        )

        quantity = request.data.get("quantity")

        if quantity is None:
            return Response(
                {"error": "Quantity is required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        if int(quantity) <= 0:
            return Response(
                {"error": "Quantity must be greater than zero"},
                status=status.HTTP_400_BAD_REQUEST
            )

        cart_item.quantity = quantity
        cart_item.save()

        serializer = CartItemSerializer(cart_item)

        return Response({
            "message": "Quantity updated successfully",
            "item": serializer.data
        })     
        
class RemoveCartItemView(APIView):

    permission_classes = [IsAuthenticated]

    def delete(self, request, item_id):

        cart_item = get_object_or_404(
            CartItem,
            id=item_id,
            cart__user=request.user
        )

        cart_item.delete()

        return Response(
            {"message": "Item removed from cart"},
            status=status.HTTP_200_OK
        )     
        
class ClearCartView(APIView):

    permission_classes = [IsAuthenticated]

    def delete(self, request):

        cart = get_object_or_404(
            Cart,
            user=request.user
        )

        cart.items.all().delete()

        return Response({
            "message": "Cart cleared successfully"
        })              