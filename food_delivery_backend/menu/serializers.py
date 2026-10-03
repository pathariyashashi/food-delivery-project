from rest_framework import serializers
from .models import FoodCategory
from .models import FoodItem

class FoodCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = FoodCategory
        fields = "__all__"

class FoodItemSerializer(serializers.ModelSerializer):
    restaurant_name = serializers.CharField(
        source="restaurant.name",
        read_only=True
    )

    category_name = serializers.CharField(
        source="category.name",
        read_only=True
    )

    class Meta:
        model = FoodItem
        fields = "__all__"
        
class MenuItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = FoodItem
        fields = ["id", "name", "price", "is_veg", "image"]        