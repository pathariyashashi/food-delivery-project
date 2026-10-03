from django.db import models
from restaurants.models import Restaurant


class FoodCategory(models.Model):
    name = models.CharField(max_length=100, unique=True)
    image = models.ImageField(
        upload_to="categories/",
        null=True,
        blank=True
    )
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name
    
class FoodItem(models.Model):
    restaurant = models.ForeignKey(
        Restaurant,
        on_delete=models.CASCADE,
        related_name="food_items"
    )

    category = models.ForeignKey(
        FoodCategory,
        on_delete=models.CASCADE,
        related_name="food_items"
    )

    name = models.CharField(max_length=150)
    description = models.TextField(blank=True)

    price = models.DecimalField(max_digits=8, decimal_places=2)

    image = models.ImageField(
        upload_to="food_items/",
        null=True,
        blank=True
    )

    is_veg = models.BooleanField(default=True)
    is_available = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name    