from rest_framework.views import APIView # type: ignore
from rest_framework.response import Response # type: ignore
from myapp.models import User

class UserDetailView(APIView):
    def get(self, request, email):
        try:
            user = User.objects.get(email=email)
            return Response({"name": user.name, "email": user.email})
        except User.DoesNotExist:
            return Response({"error": "User not found"}, status=404)
