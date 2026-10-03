from django.contrib import admin
from .models import DeliveryRider


@admin.register(DeliveryRider)
class DeliveryRiderAdmin(admin.ModelAdmin):

    list_display = (
        "user",
        "phone",
        "latitude",
        "longitude",
        "is_online",
        "is_available",
        "updated_at",
    )

    list_filter = (
        "is_online",
        "is_available",
    )

    search_fields = (
        "user__username",
        "user__email",
        "phone",
    )