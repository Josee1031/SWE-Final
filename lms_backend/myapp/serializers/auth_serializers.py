from rest_framework_simplejwt.serializers import TokenObtainPairSerializer # type: ignore

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        # Add custom fields to the token response
        data['is_staff'] = self.user.is_staff
        data['name'] = self.user.name
        return data
