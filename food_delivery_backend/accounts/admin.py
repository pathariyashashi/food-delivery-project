from django.contrib import admin
from .models import User

@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ("id","username","email","phone","role")
    search_fields = ("username","email","phone")
    list_filter = ("role",)