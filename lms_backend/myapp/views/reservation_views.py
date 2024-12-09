from rest_framework.views import APIView  # type: ignore
from rest_framework.response import Response  # type: ignore
from rest_framework.permissions import AllowAny  # type: ignore
from rest_framework import status  # type: ignore
from myapp.models import Reservations, User
from myapp.serializers.reservation_serializers import ReservationSerializer
from datetime import timedelta, datetime


class ReservationListView(APIView):
    """
    API view to handle creating, retrieving, and updating reservations.
    """
    permission_classes = [AllowAny]

    def get(self, request):
        """
        Retrieve reservations with optional filtering by `book_id` and `returned`.
        If no query parameters are provided, return all reservations.
        """
        try:
            # Get query parameters
            book_id = request.query_params.get("book_id", None)  # Default to None if not provided
            returned = request.query_params.get("returned", None)  # Default to None if not provided

            # Start with all reservations
            reservations = Reservations.objects.all()

            # Filter by book_id if provided
            if book_id:
                reservations = reservations.filter(book_id=book_id)

            # Filter by returned if provided
            if returned is not None:
                returned_bool = returned.lower() == "true"
                reservations = reservations.filter(returned=returned_bool)

            # Serialize the filtered or full queryset
            serializer = ReservationSerializer(reservations, many=True)

            # Return serialized data
            return Response(serializer.data, status=200)
        except Exception as e:
            print(f"Error: {e}")  # Debug: Log error for development purposes
            return Response({"error": str(e)}, status=500)


    def post(self, request):
        """
        Create a new reservation.
        """
        required_fields = ["email", "book_id", "copy_id", "start_date"]
        for field in required_fields:
            if not request.data.get(field):
                return Response(
                    {"error": f"{field} is required."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

        email = request.data["email"]
        book_id = request.data["book_id"]
        copy_id = request.data["copy_id"]
        start_date = request.data["start_date"]

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response(
                {"error": "User with the given email does not exist."},
                status=status.HTTP_404_NOT_FOUND,
            )

        try:
            start_date_obj = datetime.strptime(start_date, "%Y-%m-%d").date()
        except ValueError:
            return Response(
                {"error": "Invalid date format. Use YYYY-MM-DD."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        due_date = start_date_obj + timedelta(days=7)
        data = {
            "user": user.user_id,
            "book": book_id,
            "copy": copy_id,
            "start_date": start_date_obj,
            "due_date": due_date,
            "returned": False,
        }

        serializer = ReservationSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def put(self, request, reservation_id):
        """
        Mark a reservation as returned and set the associated book copy as available.
        """
        try:
            # Retrieve the reservation
            reservation = Reservations.objects.get(reservation_id=reservation_id)
        except Reservations.DoesNotExist:
            return Response({"error": "Reservation not found."}, status=status.HTTP_404_NOT_FOUND)

        # Update reservation and copy availability
        if reservation.returned:
            return Response(
                {"error": "This reservation has already been marked as returned."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Mark the reservation as returned
        reservation.returned = True
        reservation.save()

        # Update the book copy's availability
        copy = reservation.copy
        copy.is_available = True
        copy.save()

        serializer = ReservationSerializer(reservation)
        return Response(
            {
                "message": "Reservation marked as returned and book copy set to available.",
                "reservation": serializer.data,
                "copy_id": copy.copy_id,
                "is_available": copy.is_available,
            },
            status=status.HTTP_200_OK,
        )




class ExtendReservationView(APIView):
    """
    API view to extend the due date of a reservation.
    """
    permission_classes = [AllowAny]

    def put(self, request, reservation_id):
        """
        Extend the reservation's due date by 7 days.
        """
        try:
            # Retrieve the reservation by ID
            reservation = Reservations.objects.get(reservation_id=reservation_id)
        except Reservations.DoesNotExist:
            return Response({"error": "Reservation not found."}, status=404)

        # Extend the due_date by 7 days
        reservation.due_date += timedelta(days=7)
        reservation.save()

        # Serialize the updated reservation
        serializer = ReservationSerializer(reservation)
        return Response(serializer.data, status=200)
