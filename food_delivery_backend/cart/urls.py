from django.urls import path

from .views import (
    AddToCartView,
    UserCartView,
    UpdateCartItemView,
    RemoveCartItemView,
    ClearCartView,
)


urlpatterns = [
    path(
        "cart/add/",
        AddToCartView.as_view()
    ),

    path(
        "cart/",
        UserCartView.as_view()
    ),

    path(
        "cart/item/<int:item_id>/",
        UpdateCartItemView.as_view()
    ),

    path(
        "cart/item/<int:item_id>/delete/",
        RemoveCartItemView.as_view()
    ),

    path(
        "cart/clear/",
        ClearCartView.as_view()
    ),
]