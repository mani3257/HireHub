from django.db.models import Count, Q
from django.shortcuts import get_object_or_404
from rest_framework import generics, permissions, status
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import Job, Application
from .serializers import JobSerializer, ApplicationSerializer, ApplicationStatusSerializer
from .permissions import IsRecruiter, IsCandidate

class JobListCreateView(generics.ListCreateAPIView):
    serializer_class = JobSerializer
    def get_queryset(self):
        qs = Job.objects.select_related("recruiter").annotate(_application_count=Count("applications"))
        if self.request.user.is_authenticated and getattr(self.request.user, "role", "") == "recruiter":
            # Recruiters see all public active jobs plus their own inactive jobs.
            qs = qs.filter(Q(is_active=True) | Q(recruiter=self.request.user))
        else:
            qs = qs.filter(is_active=True)
        params = self.request.query_params
        search = params.get("search", "").strip()
        if search:
            qs = qs.filter(Q(title__icontains=search) | Q(company__icontains=search) |
                           Q(location__icontains=search) | Q(description__icontains=search))
        location = params.get("location", "").strip()
        if location:
            qs = qs.filter(location__icontains=location)
        employment_type = params.get("employment_type")
        if employment_type:
            qs = qs.filter(employment_type=employment_type)
        experience = params.get("experience")
        if experience:
            qs = qs.filter(experience=experience)
        return qs
    def get_permissions(self):
        if self.request.method == "POST":
            return [permissions.IsAuthenticated(), IsRecruiter()]
        return [permissions.AllowAny()]
    def perform_create(self, serializer):
        company = serializer.validated_data.get("company") or self.request.user.company
        serializer.save(recruiter=self.request.user, company=company)

class JobDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = JobSerializer
    queryset = Job.objects.select_related("recruiter").all()
    def get_permissions(self):
        if self.request.method in ("PATCH", "PUT", "DELETE"):
            return [permissions.IsAuthenticated(), IsRecruiter()]
        return [permissions.AllowAny()]
    def get_object(self):
        obj = super().get_object()
        if not obj.is_active and not (self.request.user.is_authenticated and obj.recruiter_id == self.request.user.id):
            from rest_framework.exceptions import NotFound
            raise NotFound()
        return obj
    def perform_update(self, serializer):
        if serializer.instance.recruiter_id != self.request.user.id:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("You can only edit your own job postings.")
        serializer.save()
    def perform_destroy(self, instance):
        if instance.recruiter_id != self.request.user.id:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("You can only delete your own job postings.")
        instance.delete()

class ApplyToJobView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsCandidate]
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    def post(self, request, pk):
        job = get_object_or_404(Job, pk=pk, is_active=True)
        if Application.objects.filter(job=job, candidate=request.user).exists():
            return Response({"detail": "You have already applied to this job."}, status=status.HTTP_400_BAD_REQUEST)
        serializer = ApplicationSerializer(data={**request.data, "job": job.id}, context={"request": request})
        serializer.is_valid(raise_exception=True)
        application = serializer.save(job=job, candidate=request.user)
        return Response(ApplicationSerializer(application, context={"request": request}).data, status=status.HTTP_201_CREATED)

class MyApplicationsView(generics.ListAPIView):
    serializer_class = ApplicationSerializer
    permission_classes = [permissions.IsAuthenticated, IsCandidate]
    def get_queryset(self):
        return Application.objects.filter(candidate=self.request.user).select_related("job", "candidate")

class JobApplicantsView(generics.ListAPIView):
    serializer_class = ApplicationSerializer
    permission_classes = [permissions.IsAuthenticated, IsRecruiter]
    def get_queryset(self):
        job = get_object_or_404(Job, pk=self.kwargs["pk"], recruiter=self.request.user)
        return Application.objects.filter(job=job).select_related("job", "candidate")

class UpdateApplicationStatusView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsRecruiter]
    def patch(self, request, pk):
        application = get_object_or_404(Application.objects.select_related("job"), pk=pk)
        if application.job.recruiter_id != request.user.id:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("You can only update applications for your own jobs.")
        serializer = ApplicationStatusSerializer(application, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(ApplicationSerializer(application, context={"request": request}).data)

class DashboardView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    def get(self, request):
        if request.user.role == "recruiter":
            jobs = Job.objects.filter(recruiter=request.user)
            apps = Application.objects.filter(job__recruiter=request.user)
            return Response({
                "role": "recruiter",
                "total_jobs": jobs.count(),
                "active_jobs": jobs.filter(is_active=True).count(),
                "total_applications": apps.count(),
                "shortlisted": apps.filter(status="shortlisted").count(),
                "interviews": apps.filter(status="interview").count(),
                "selected": apps.filter(status="selected").count(),
            })
        apps = Application.objects.filter(candidate=request.user)
        return Response({
            "role": "candidate",
            "applications": apps.count(),
            "interviews": apps.filter(status="interview").count(),
            "selected": apps.filter(status="selected").count(),
            "rejected": apps.filter(status="rejected").count(),
        })
