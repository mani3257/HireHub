from django.contrib import admin
from .models import Job, Application

@admin.register(Job)
class JobAdmin(admin.ModelAdmin):
    list_display = ("title", "company", "location", "recruiter", "is_active", "created_at")
    list_filter = ("is_active", "employment_type", "experience")
    search_fields = ("title", "company", "location")

@admin.register(Application)
class ApplicationAdmin(admin.ModelAdmin):
    list_display = ("job", "candidate", "status", "applied_at")
    list_filter = ("status",)
    search_fields = ("job__title", "candidate__email")
