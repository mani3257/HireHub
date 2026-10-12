from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    class Role(models.TextChoices):
        CANDIDATE = "candidate", "Candidate"
        RECRUITER = "recruiter", "Recruiter"
    email = models.EmailField(unique=True)
    role = models.CharField(max_length=20, choices=Role.choices, default=Role.CANDIDATE)
    company = models.CharField(max_length=120, blank=True)
    headline = models.CharField(max_length=160, blank=True)

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["username"]

    def __str__(self):
        return f"{self.email} ({self.role})"
