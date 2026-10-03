from django.shortcuts import get_object_or_404
from rest_framework import generics
from rest_framework.permissions import AllowAny
from rest_framework.views import APIView
from rest_framework.response import Response

from restaurants.models import Restaurant
from .models import FoodCategory, FoodItem
from .serializers import (
    FoodCategorySerializer,
    FoodItemSerializer,
    MenuItemSerializer,
)


# ===========================
# CATEGORY API (GET + POST)
# ===========================
class FoodCategoryListCreateView(generics.ListCreateAPIView):
    queryset = FoodCategory.objects.all().order_by("name")
    serializer_class = FoodCategorySerializer
    permission_classes = [AllowAny]


# ===========================
# FOOD ITEM API (GET + POST + FILTERS)
# ===========================
class FoodItemListCreateView(generics.ListCreateAPIView):
    serializer_class = FoodItemSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        queryset = FoodItem.objects.all().order_by("-created_at")

        is_veg = self.request.query_params.get("is_veg")
        if is_veg is not None:
            queryset = queryset.filter(is_veg=is_veg.lower() == "true")

        restaurant = self.request.query_params.get("restaurant")
        if restaurant:
            queryset = queryset.filter(restaurant_id=restaurant)

        category = self.request.query_params.get("category")
        if category:
            queryset = queryset.filter(category__name__iexact=category)

        min_price = self.request.query_params.get("min_price")
        if min_price:
            queryset = queryset.filter(price__gte=min_price)

        max_price = self.request.query_params.get("max_price")
        if max_price:
            queryset = queryset.filter(price__lte=max_price)

        return queryset


# ===========================
# RESTAURANT MENU API
# ===========================
class RestaurantMenuView(APIView):

    def get(self, request, restaurant_id):
        restaurant = get_object_or_404(Restaurant, id=restaurant_id)

        menu = []

        categories = FoodCategory.objects.all()

        for category in categories:
            items = FoodItem.objects.filter(
                restaurant=restaurant,
                category=category,
                is_available=True,
            )

            if items.exists():
                menu.append({
                    "category": category.name,
                    "items": MenuItemSerializer(items, many=True).data,
                })

        return Response({
            "restaurant": restaurant.name,
            "city": restaurant.city,
            "menu": menu,
        })