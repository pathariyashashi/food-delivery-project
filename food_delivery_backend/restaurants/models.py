from django.db import models
from accounts.models import User

class Restaurant(models.Model):
    CATEGORY_CHOICES = (
        ("Pizza", "Pizza"),
        ("Burger", "Burger"),
        ("South Indian", "South Indian"),
        ("Chinese", "Chinese"),
        ("Cafe", "Cafe"),
    )

    owner = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="restaurants"
    )
    
    image = models.ImageField(
        upload_to="restaurants/",
        null=True,
        blank=True
    )

    name = models.CharField(max_length=100)
    city = models.CharField(max_length=100)
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES)
    address = models.TextField()
    rating = models.DecimalField(max_digits=2, decimal_places=1, default=0.0)
    is_open = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name