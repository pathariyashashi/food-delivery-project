from django.urls import path
from .views import (
    FoodCategoryListCreateView,
    FoodItemListCreateView,
    RestaurantMenuView,
)

urlpatterns = [
    path("categories/", FoodCategoryListCreateView.as_view()),
    path("food-items/", FoodItemListCreateView.as_view()),
    path(
        "restaurants/<int:restaurant_id>/menu/",
        RestaurantMenuView.as_view(),
        name="restaurant-menu",
    ),
]