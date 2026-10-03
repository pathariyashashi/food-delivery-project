from django.db import models
from django.contrib.auth.models import AbstractUser


class User(AbstractUser):
    ROLE_CHOICES = (
        ("customer", "Customer"),
        ("restaurant", "Restaurant"),
        ("admin", "Admin"),
        ("rider", "Rider"),
    )

    phone = models.CharField(max_length=15, unique=True)
    address = models.TextField(blank=True, null=True)

    role = models.CharField(
        max_length=20,
        choices=ROLE_CHOICES,
        default="customer"
    )

    def __str__(self):
        return self.username