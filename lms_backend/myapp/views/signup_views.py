from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model
from rest_framework.permissions import AllowAny
from myapp.utils import sanitize_string
import logging

logger = logging.getLogger(__name__)

User = get_user_model()


class SignupAPIView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        # Extract and sanitize fields
        name = sanitize_string(request.data.get('name'))
        email = request.data.get('email')
        password = request.data.get('password')

        # Validate fields
        if not name or not email or not password:
            return Response({"error": "Name, email, and password are required."}, status=status.HTTP_400_BAD_REQUEST)

        # Check for existing email
        if User.objects.filter(email=email).exists():
            return Response({"error": "A user with this email already exists."}, status=status.HTTP_400_BAD_REQUEST)

        # Attempt to create user
        try:
            user = User.objects.create_user(name=name, email=email, password=password)
        except Exception as e:
            logger.error(f"Error creating user: {e}")
            return Response({"error": "Failed to create user"}, status=status.HTTP_400_BAD_REQUEST)

        # Generate tokens
        refresh = RefreshToken.for_user(user)

        # Return success response
        return Response({
            "user": {
                "id": user.user_id,  # Updated to match custom primary key
                "name": user.name,
                "email": user.email,
            },
            "access": str(refresh.access_token),
            "refresh": str(refresh),
        }, status=status.HTTP_201_CREATED)
