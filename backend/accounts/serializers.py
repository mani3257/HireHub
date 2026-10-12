from django.contrib.auth import get_user_model
from rest_framework import serializers

User = get_user_model()

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    class Meta:
        model = User
        fields = ("id", "username", "email", "password", "role", "company", "headline")
        read_only_fields = ("id",)
    def validate(self, attrs):
        if attrs.get("role") == User.Role.RECRUITER and not attrs.get("company", "").strip():
            raise serializers.ValidationError({"company": "Company is required for recruiter accounts."})
        return attrs
    def create(self, validated_data):
        password = validated_data.pop("password")
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ("id", "username", "email", "role", "company", "headline")
