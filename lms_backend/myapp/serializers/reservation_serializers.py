from rest_framework import serializers  # type: ignore
from myapp.models import Reservations
from datetime import timedelta

class ReservationSerializer(serializers.ModelSerializer):
    user_email = serializers.CharField(source='user.email', read_only=True)  # Get user email
    book_title = serializers.CharField(source='book.title', read_only=True)  # Get book title
    returned = serializers.BooleanField(read_only=True)  # Property on model

    class Meta:
        model = Reservations
        fields = ['reservation_id', 'user', 'book', 'copy', 'user_email', 'book_title', 'start_date', 'due_date', 'returned']

    def validate_start_date(self, value):
        """
        Ensure the start_date is valid.
        """
        if value is None:
            raise serializers.ValidationError("start_date is required.")
        return value

    def create(self, validated_data):
        """
        Automatically set the due_date to be a week after start_date.
        """
        start_date = validated_data.get('start_date')

        # Calculate the due_date
        if start_date:
            validated_data['due_date'] = start_date + timedelta(days=7)

        # Create and return the reservation
        return super().create(validated_data)
