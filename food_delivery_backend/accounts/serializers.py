from rest_framework import serializers
from .models import User
from django.contrib.auth import authenticate
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import RefreshToken


User = get_user_model()


class RegisterSerializer(serializers.ModelSerializer):

    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = [
            "username",
            "email",
            "phone",
            "address",
            "password",
        ]

    def create(self, validated_data):
        user = User(
            username=validated_data["username"],
            email=validated_data["email"],
            phone=validated_data["phone"],
            address=validated_data.get("address"),
            role="customer",
        )

        user.set_password(validated_data["password"])
        user.save()

        return user


class LoginSerializer(serializers.Serializer):

    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        email = data["email"]
        password = data["password"]

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            raise serializers.ValidationError("Email not found.")

        user = authenticate(
            username=user.username,
            password=password
        )

        if user is None:
            raise serializers.ValidationError("Invalid password.")

        data["user"] = user
        return data


class ProfileSerializer(serializers.ModelSerializer):

    class Meta:
        model = User

        fields = [
            "id",
            "username",
            "email",
            "phone",
            "address",
            "role",
        ]

        read_only_fields = [
            "id",
            "role",
            "email",
        ]


class LogoutSerializer(serializers.Serializer):

    refresh = serializers.CharField()

    def save(self):
        token = RefreshToken(
            self.validated_data["refresh"]
        )

        token.blacklist()
        
        
class AdminCreateRiderSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = [
            "username",
            "email",
            "phone",
            "password",
        ]

    def create(self, validated_data):
        from tracking.models import DeliveryRider

        user = User(
            username=validated_data["username"],
            email=validated_data["email"],
            phone=validated_data["phone"],
            role="rider",
        )

        user.set_password(validated_data["password"])
        user.save()

        DeliveryRider.objects.create(
            user=user,
            phone=validated_data["phone"],
            is_online=False,
            is_available=True,
        )

        return user        