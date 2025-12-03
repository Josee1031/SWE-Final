from rest_framework.views import APIView  # type: ignore
from rest_framework.response import Response  # type: ignore
from rest_framework.permissions import IsAuthenticated  # type: ignore
from rest_framework import status  # type: ignore
from myapp.models import User
from myapp.permissions import IsStaffUser


class UserDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, user_id):
        """
        Retrieve a user by user_id.
        Staff can view any user, customers can only view themselves.
        """
        try:
            user = User.objects.get(pk=user_id)
        except User.DoesNotExist:
            return Response({"error": "User not found"}, status=404)

        # Staff can view any user, customer can only view themselves
        if not request.user.is_staff and request.user.user_id != user_id:
            return Response({"error": "Permission denied"}, status=403)

        return Response({"name": user.name, "email": user.email})

    def put(self, request, user_id):
        """
        Update a user's details (e.g., name, email) by user_id.
        Staff can edit any user, customers can only edit themselves.
        """
        try:
            user = User.objects.get(pk=user_id)
        except User.DoesNotExist:
            return Response({"error": "User not found"}, status=404)

        # Staff can edit any user, customer can only edit themselves
        if not request.user.is_staff and request.user.user_id != user_id:
            return Response({"error": "Permission denied"}, status=403)

        name = request.data.get('name')
        email = request.data.get('email')

        if name:
            user.name = name
        if email:
            # Validate email uniqueness (excluding current user)
            if User.objects.filter(email=email).exclude(pk=user_id).exists():
                return Response({"error": "Email already in use"}, status=400)
            user.email = email

        user.save()
        return Response({"name": user.name, "email": user.email}, status=200)

    def delete(self, request, user_id):
        """
        Delete a user by user_id.
        Only staff can delete users.
        """
        # Only staff can delete users
        if not request.user.is_staff:
            return Response({"error": "Permission denied"}, status=403)

        try:
            user = User.objects.get(pk=user_id)
        except User.DoesNotExist:
            return Response({"error": "User not found"}, status=404)

        user.delete()
        return Response({"message": "User deleted successfully."}, status=200)


class UserListView(APIView):
    permission_classes = [IsStaffUser]

    def get(self, request):
        """
        Retrieve a list of all users with is_staff = False.
        Only staff can list users.
        """
        users = User.objects.filter(is_staff=False)
        user_list = [{"id": user.pk, "name": user.name, "email": user.email} for user in users]
        return Response(user_list, status=200)
