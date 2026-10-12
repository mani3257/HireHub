from django.conf import settings
from django.db import models

class Job(models.Model):
    class EmploymentType(models.TextChoices):
        FULL_TIME = "full_time", "Full-time"
        PART_TIME = "part_time", "Part-time"
        CONTRACT = "contract", "Contract"
        INTERNSHIP = "internship", "Internship"
    class Experience(models.TextChoices):
        ENTRY = "entry", "Entry level"
        MID = "mid", "Mid level"
        SENIOR = "senior", "Senior level"

    recruiter = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="jobs")
    title = models.CharField(max_length=160)
    company = models.CharField(max_length=120)
    location = models.CharField(max_length=120)
    employment_type = models.CharField(max_length=20, choices=EmploymentType.choices, default=EmploymentType.FULL_TIME)
    experience = models.CharField(max_length=20, choices=Experience.choices, default=Experience.ENTRY)
    salary_min = models.PositiveIntegerField(null=True, blank=True)
    salary_max = models.PositiveIntegerField(null=True, blank=True)
    description = models.TextField()
    requirements = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]
    def __str__(self):
        return f"{self.title} at {self.company}"

class Application(models.Model):
    class Status(models.TextChoices):
        APPLIED = "applied", "Applied"
        SHORTLISTED = "shortlisted", "Shortlisted"
        INTERVIEW = "interview", "Interview"
        SELECTED = "selected", "Selected"
        REJECTED = "rejected", "Rejected"

    job = models.ForeignKey(Job, on_delete=models.CASCADE, related_name="applications")
    candidate = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="applications")
    cover_letter = models.TextField(blank=True)
    resume = models.FileField(upload_to="resumes/%Y/%m/", blank=True, null=True)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.APPLIED)
    applied_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-applied_at"]
        constraints = [
            models.UniqueConstraint(fields=["job", "candidate"], name="unique_candidate_job_application")
        ]
    def __str__(self):
        return f"{self.candidate.email} → {self.job.title}"
