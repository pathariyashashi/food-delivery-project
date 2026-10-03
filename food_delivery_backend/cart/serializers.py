from rest_framework import serializers
from .models import CartItem

class CartItemSerializer(serializers.ModelSerializer):

    food_name = serializers.CharField(
        source="food_item.name",
        read_only=True
    )

    price = serializers.DecimalField(
        source="food_item.price",
        max_digits=8,
        decimal_places=2,
        read_only=True
    )

    subtotal = serializers.SerializerMethodField()

    class Meta:
        model = CartItem
        fields = [
            "id",
            "food_item",
            "food_name",
            "price",
            "quantity",
            "subtotal"
        ]

    def get_subtotal(self, obj):
        return obj.food_item.price * obj.quantity