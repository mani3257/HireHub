from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User

@admin.register(User)
class CustomUserAdmin(UserAdmin):
    fieldsets = UserAdmin.fieldsets + (("HireHub profile", {"fields": ("role", "company", "headline")}),)
    add_fieldsets = UserAdmin.add_fieldsets + (("HireHub profile", {"fields": ("email", "role", "company", "headline")}),)
    list_display = ("username", "email", "role", "company", "is_staff")
