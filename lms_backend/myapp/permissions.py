from rest_framework.permissions import BasePermission, SAFE_METHODS


class IsStaffUser(BasePermission):
    """
    Allows access only to staff users.
    """
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.is_staff


class IsStaffOrReadOnly(BasePermission):
    """
    Staff can do anything. Others can only read (GET, HEAD, OPTIONS).
    """
    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return True
        return request.user and request.user.is_authenticated and request.user.is_staff


class IsOwnerOrStaff(BasePermission):
    """
    Object-level permission: owner or staff can access.
    """
    def has_object_permission(self, request, view, obj):
        if request.user.is_staff:
            return True
        # For User objects
        if hasattr(obj, 'user_id'):
            return obj.user_id == request.user.user_id
        # For Reservation objects
        if hasattr(obj, 'user'):
            return obj.user.user_id == request.user.user_id
        return False
