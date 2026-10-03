from django.urls import path

from .views import (
    MyAssignedOrdersView,
    PlaceOrderView,
    MyOrdersView,
    OrderDetailView,
    CancelOrderView,
    UpdateOrderStatusView,
    AssignRiderView,
)


urlpatterns = [
    path(
        "orders/place/",
        PlaceOrderView.as_view(),
        name="place-order"
    ),

    path(
        "orders/",
        MyOrdersView.as_view(),
        name="my-orders"
    ),

    path(
        "orders/<int:order_id>/cancel/",
        CancelOrderView.as_view(),
        name="cancel-order"
    ),

    path(
        "orders/<int:order_id>/status/",
        UpdateOrderStatusView.as_view(),
        name="update-order-status"
    ),

    path(
        "orders/<int:order_id>/",
        OrderDetailView.as_view(),
        name="order-detail"
    ),

    path(
        "orders/<int:order_id>/assign-rider/",
        AssignRiderView.as_view(),
        name="assign-rider"
    ),
    
    path(
    "rider/orders/",
    MyAssignedOrdersView.as_view(),
    name="rider-assigned-orders",
),
]