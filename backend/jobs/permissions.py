from rest_framework.permissions import BasePermission, SAFE_METHODS

class IsRecruiter(BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == "recruiter")

class IsCandidate(BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == "candidate")

class IsRecruiterOwnerOrReadOnly(BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.method in SAFE_METHODS:
            return True
        return bool(request.user.is_authenticated and obj.recruiter_id == request.user.id)
