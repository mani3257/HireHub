from rest_framework import serializers
from .models import Job, Application

class JobSerializer(serializers.ModelSerializer):
    recruiter_name = serializers.CharField(source="recruiter.username", read_only=True)
    application_count = serializers.IntegerField(source="applications.count", read_only=True)
    class Meta:
        model = Job
        fields = (
            "id", "recruiter", "recruiter_name", "title", "company", "location",
            "employment_type", "experience", "salary_min", "salary_max",
            "description", "requirements", "is_active", "created_at", "updated_at",
            "application_count",
        )
        read_only_fields = ("id", "recruiter", "recruiter_name", "created_at", "updated_at", "application_count")
    def validate(self, attrs):
        low = attrs.get("salary_min", getattr(self.instance, "salary_min", None))
        high = attrs.get("salary_max", getattr(self.instance, "salary_max", None))
        if low is not None and high is not None and low > high:
            raise serializers.ValidationError({"salary_max": "Maximum salary must be greater than or equal to minimum salary."})
        return attrs

class ApplicationSerializer(serializers.ModelSerializer):
    candidate_name = serializers.CharField(source="candidate.username", read_only=True)
    candidate_email = serializers.EmailField(source="candidate.email", read_only=True)
    job_title = serializers.CharField(source="job.title", read_only=True)
    company = serializers.CharField(source="job.company", read_only=True)
    resume_url = serializers.SerializerMethodField()
    class Meta:
        model = Application
        fields = (
            "id", "job", "job_title", "company", "candidate", "candidate_name",
            "candidate_email", "cover_letter", "resume", "resume_url", "status",
            "applied_at", "updated_at",
        )
        read_only_fields = ("id", "candidate", "status", "applied_at", "updated_at", "resume_url")
    def get_resume_url(self, obj):
        request = self.context.get("request")
        if obj.resume:
            url = obj.resume.url
            return request.build_absolute_uri(url) if request else url
        return None
    def validate_resume(self, value):
        if value and not value.name.lower().endswith(".pdf"):
            raise serializers.ValidationError("Please upload a PDF resume.")
        if value and value.size > 5 * 1024 * 1024:
            raise serializers.ValidationError("Resume must be 5 MB or smaller.")
        return value

class ApplicationStatusSerializer(serializers.ModelSerializer):
    class Meta:
        model = Application
        fields = ("status",)
