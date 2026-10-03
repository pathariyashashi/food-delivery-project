from django.db import models
from accounts.models import User


class DeliveryRider(models.Model):

    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name="delivery_rider"
    )

    phone = models.CharField(
        max_length=15,
        blank=True,
        null=True
    )

    latitude = models.DecimalField(
        max_digits=10,
        decimal_places=7,
        null=True,
        blank=True
    )

    longitude = models.DecimalField(
        max_digits=10,
        decimal_places=7,
        null=True,
        blank=True
    )

    is_online = models.BooleanField(
        default=False
    )

    is_available = models.BooleanField(
        default=True
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )

    def __str__(self):
        return self.user.username