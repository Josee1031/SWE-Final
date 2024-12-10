from rest_framework.views import APIView  # type: ignore
from rest_framework.response import Response  # type: ignore
from rest_framework.permissions import AllowAny  # type: ignore
from rest_framework import status  # type: ignore
from myapp.models import Reservations, User, BookCopies
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
        `returned` now correlates to `copy.is_available`.
        
        If `returned=true`, we filter reservations where `copy.is_available=True`.
        If `returned=false`, we filter reservations where `copy.is_available=False`.
        """
        try:
            book_id = request.query_params.get("book_id", None)
            returned = request.query_params.get("returned", None)

            # Start with all reservations
            reservations = Reservations.objects.all()

            # Filter by book_id if provided
            if book_id:
                reservations = reservations.filter(book_id=book_id)

            # Filter by returned if provided, interpreting returned as availability
            if returned is not None:
                returned_bool = returned.lower() == "true"
                # Filter by copy availability instead of reservation returned field
                reservations = reservations.filter(copy__is_available=returned_bool)

            serializer = ReservationSerializer(reservations, many=True)
            return Response(serializer.data, status=200)
        except Exception as e:
            print(f"Error: {e}")
            return Response({"error": str(e)}, status=500)

    def post(self, request):
        """
        Create a new reservation. When a reservation is created,
        set the copy's is_available to False, indicating it's checked out.
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
            # 'returned' removed from the model, no need to set it
        }

        serializer = ReservationSerializer(data=data)
        if serializer.is_valid():
            reservation = serializer.save()

            # Mark the copy as no longer available since it's reserved
            copy = BookCopies.objects.get(pk=copy_id)
            copy.is_available = False
            copy.save()

            # Re-serialize to reflect updated data
            reservation_serializer = ReservationSerializer(reservation)
            return Response(reservation_serializer.data, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def put(self, request, reservation_id):
        """
        Mark a reservation as returned by making the copy available again.
        """
        try:
            reservation = Reservations.objects.get(reservation_id=reservation_id)
        except Reservations.DoesNotExist:
            return Response({"error": "Reservation not found."}, status=status.HTTP_404_NOT_FOUND)

        # If the copy is already available, it means the book is effectively returned
        if reservation.copy.is_available:
            return Response(
                {"error": "This reservation's copy is already available (already returned)."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Make the copy available again, which implies the book is returned
        copy = reservation.copy
        copy.is_available = True
        copy.save()

        serializer = ReservationSerializer(reservation)
        return Response(
            {
                "message": "Reservation is considered returned as the copy is now available.",
                "reservation": serializer.data,
                "copy_id": copy.copy_id,
                "is_available": copy.is_available,
            },
            status=status.HTTP_200_OK,
        )



class ReservationDetailView(APIView):
    def put(self, request, reservation_id):
        try:
            reservation = Reservations.objects.get(reservation_id=reservation_id)
        except Reservations.DoesNotExist:
            return Response({"error": "Reservation not found."}, status=status.HTTP_404_NOT_FOUND)

        # Business logic for updating the reservation
        copy = reservation.copy
        if copy.is_available:
            return Response(
                {"error": "This reservation's copy is already available (already returned)."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Mark the copy as available
        copy.is_available = True
        copy.save()

        return Response({"message": "Reservation updated successfully.", "copy_id": copy.copy_id}, status=status.HTTP_200_OK)


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
