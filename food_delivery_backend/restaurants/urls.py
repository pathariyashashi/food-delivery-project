from django.urls import path
from .views import (
    RestaurantListView,
    RestaurantCreateView,
    RestaurantDetailView,
    RestaurantUpdateView,
    RestaurantDeleteView,
)

urlpatterns = [
    path("restaurants/", RestaurantListView.as_view(), name="restaurant-list"),
    path("restaurants/create/", RestaurantCreateView.as_view(), name="restaurant-create"),
    path("restaurants/<int:pk>/", RestaurantDetailView.as_view(), name="restaurant-detail"),
    path("restaurants/<int:pk>/update/", RestaurantUpdateView.as_view(), name="restaurant-update"),
    path("restaurants/<int:pk>/delete/", RestaurantDeleteView.as_view(), name="restaurant-delete"),
]