from rest_framework import serializers # type: ignore
from myapp.models import Reservations

class ReservationSerializer(serializers.ModelSerializer):
    user_email = serializers.CharField(source='user.email', read_only=True)  # Get user email
    book_title = serializers.CharField(source='book.title', read_only=True)  # Get book title

    class Meta:
        model = Reservations
        fields = ['reservation_id', 'user_email', 'book_title', 'start_date', 'due_date', 'is_returned']
