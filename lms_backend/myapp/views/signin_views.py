from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer 
from myapp.serializers.signin_serializers import UserSignInSerializer
from rest_framework.permissions import AllowAny

from rest_framework.permissions import AllowAny

class SignInAPIView(APIView):
    permission_classes = [AllowAny]  # Anyone can access this endpoint to sign in.
    
    def post(self, request):
        serializer = UserSignInSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.validated_data['user']
            # Generate tokens for the authenticated user
            token_serializer = TokenObtainPairSerializer(data={
                'email': user.email,
                'password': request.data.get('password')
            })
            if token_serializer.is_valid():
                return Response({
                    'access': token_serializer.validated_data['access'],
                    'refresh': token_serializer.validated_data['refresh'],
                    'user': {
                        'email': user.email,
                        'name': user.name,
                        'is_staff': user.is_staff
                    }
                }, status=status.HTTP_200_OK)
            else:
                return Response(token_serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
