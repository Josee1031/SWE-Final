from rest_framework.views import APIView # type: ignore
from rest_framework.response import Response # type: ignore
from myapp.models import User
from rest_framework.permissions import AllowAny
from rest_framework import status
from myapp.models import User

class UserDetailView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, user_id):
        """
        Retrieve a user by user_id.
        """
        try:
            user = User.objects.get(pk=user_id)
            return Response({"name": user.name, "email": user.email})
        except User.DoesNotExist:
            return Response({"error": "User not found"}, status=404)

    def put(self, request, user_id):
        """
        Update a user's details (e.g., name, email) by user_id.
        Only provided fields are updated.
        """
        try:
            user = User.objects.get(pk=user_id)
        except User.DoesNotExist:
            return Response({"error": "User not found"}, status=404)

        name = request.data.get('name')
        email = request.data.get('email')

        if name:
            user.name = name
        if email:
            # Optionally add validation for email uniqueness or format here
            user.email = email

        user.save()
        return Response({"name": user.name, "email": user.email}, status=200)

    def delete(self, request, user_id):
        """
        Delete a user by user_id.
        """
        try:
            user = User.objects.get(pk=user_id)
        except User.DoesNotExist:
            return Response({"error": "User not found"}, status=404)

        user.delete()
        return Response({"message": "User deleted successfully."}, status=200)


class UserListView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        """
        Retrieve a list of all users with is_staff = False.
        """
        users = User.objects.filter(is_staff=False)
        user_list = [{"id": user.pk, "name": user.name, "email": user.email, "is_staff":user.is_staff} for user in users]
        return Response(user_list, status=200)
