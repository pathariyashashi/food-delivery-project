from django.urls import path

from .consumers import OrderTrackingConsumer


websocket_urlpatterns = [
    path(
        "ws/tracking/<int:order_id>/",
        OrderTrackingConsumer.as_asgi(),
    ),
]