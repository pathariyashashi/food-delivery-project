from rest_framework import serializers

from .models import DeliveryRider


class DeliveryRiderSerializer(serializers.ModelSerializer):

    username = serializers.CharField(
        source="user.username",
        read_only=True
    )

    email = serializers.EmailField(
        source="user.email",
        read_only=True
    )

    class Meta:
        model = DeliveryRider

        fields = [
            "id",
            "username",
            "email",
            "phone",
            "latitude",
            "longitude",
            "is_online",
            "is_available",
            "updated_at",
        ]