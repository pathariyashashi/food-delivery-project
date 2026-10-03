from django.contrib import admin
from .models import Order, OrderItem


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):

    list_display = (
        "id",
        "user",
        "restaurant",
        "total_amount",
        "status",
        "delivery_rider",
        "created_at",
    )

    list_filter = (
        "status",
        "restaurant",
    )

    search_fields = (
        "user__username",
        "user__email",
    )


@admin.register(OrderItem)
class OrderItemAdmin(admin.ModelAdmin):

    list_display = (
        "id",
        "order",
        "food_name",
        "price",
        "quantity",
        "subtotal",
    )

    search_fields = (
        "food_name",
    )