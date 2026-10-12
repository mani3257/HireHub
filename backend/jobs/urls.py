from django.urls import path
from .views import (
    JobListCreateView, JobDetailView, ApplyToJobView, MyApplicationsView,
    JobApplicantsView, UpdateApplicationStatusView, DashboardView,
)

urlpatterns = [
    path("jobs/", JobListCreateView.as_view(), name="job-list-create"),
    path("jobs/<int:pk>/", JobDetailView.as_view(), name="job-detail"),
    path("jobs/<int:pk>/apply/", ApplyToJobView.as_view(), name="job-apply"),
    path("jobs/<int:pk>/applicants/", JobApplicantsView.as_view(), name="job-applicants"),
    path("applications/mine/", MyApplicationsView.as_view(), name="my-applications"),
    path("applications/<int:pk>/status/", UpdateApplicationStatusView.as_view(), name="application-status"),
    path("dashboard/", DashboardView.as_view(), name="dashboard"),
]
