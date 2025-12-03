from rest_framework.views import APIView  # type: ignore
from rest_framework.response import Response  # type: ignore
from rest_framework import status  # type: ignore
from myapp.models import Book, BookCopies, Reservations, Author, Genre
from myapp.serializers.book_serializers import BookSerializer, BookCopySerializer
from django.db.models import Q  # type: ignore
from myapp.serializers.reservation_serializers import ReservationSerializer
import logging
from django.db import transaction
import re
from stdnum import isbn as stdnum_isbn
from myapp.permissions import IsStaffOrReadOnly, IsStaffUser
from myapp.utils import sanitize_string

logger = logging.getLogger(__name__)


class BookListView(APIView):
    permission_classes = [IsStaffOrReadOnly]

    def get(self, request):
        search_query = request.query_params.get("q", None)

        # Filter books by title or author's name
        if search_query:
            books = Book.objects.filter(
                Q(title__icontains=search_query) | Q(author__name__icontains=search_query)
            )
        else:
            books = Book.objects.all()

        serializer = BookSerializer(books, many=True)
        return Response(serializer.data)

    @transaction.atomic
    def post(self, request):
        """
        Create a new book using the `BookAPIView` logic.
        Only staff can create books (enforced by IsStaffOrReadOnly permission).
        """
        author_name = sanitize_string(request.data.get("author_name"))
        genre_name = sanitize_string(request.data.get("genre_name"))
        title = sanitize_string(request.data.get("title"))
        isbn = request.data.get("isbn")
        copy_number = request.data.get("copy_number", 1)

        # Validate required fields
        if not all([author_name, genre_name, title, isbn]):
            return Response(
                {"error": "author_name, genre_name, title, and isbn are required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            # Validate copy_number
            copy_number = int(copy_number)
            if copy_number < 1:
                raise ValueError
        except (ValueError, TypeError):
            return Response(
                {"error": "copy_number must be an integer greater than or equal to 1."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Validate ISBN
        if not stdnum_isbn.is_valid(isbn):
            return Response({"error": "Invalid ISBN format."}, status=status.HTTP_400_BAD_REQUEST)

        isbn = stdnum_isbn.compact(isbn)

        try:
            # Get or create the author and genre (already sanitized above)
            author, _ = Author.objects.get_or_create(name=author_name)
            genre, _ = Genre.objects.get_or_create(name=genre_name)

            # Create the book (title already sanitized above)
            book = Book.objects.create(
                title=title,
                isbn=isbn,
                author=author,
                genre=genre,
            )

            # Create book copies
            book_copies = [BookCopies(book=book, is_available=True) for _ in range(copy_number)]
            BookCopies.objects.bulk_create(book_copies)

            # Serialize and return the book
            serializer = BookSerializer(book)
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)









class BookDetailView(APIView):
    permission_classes = [IsStaffOrReadOnly]

    def get(self, request, book_id):
        try:
            book = Book.objects.get(pk=book_id)
            serializer = BookSerializer(book)
            return Response(serializer.data)
        except Book.DoesNotExist:
            return Response({"error": "Book not found"}, status=404)
    
    def put(self, request, book_id):
        """
        Update the details of a specific book by its ID.
        """
        try:
            # Retrieve the book instance
            book = Book.objects.get(pk=book_id)

            # Deserialize and validate the incoming data
            serializer = BookSerializer(book, data=request.data, partial=True)
            if serializer.is_valid():
                # Save the updated book instance
                serializer.save()
                return Response(serializer.data, status=200)
            return Response(serializer.errors, status=400)

        except Book.DoesNotExist:
            return Response({"error": "Book not found"}, status=404)
        except Exception as e:
            return Response({"error": str(e)}, status=500)
        
    def delete(self, request, book_id):
        """
        Delete a specific book by its ID.
        """
        try:
            # Retrieve the book instance
            book = Book.objects.get(pk=book_id)

            # Delete the book
            book.delete()
            return Response(
                {"message": "Book deleted successfully."},
                status=200
            )
        except Book.DoesNotExist:
            return Response({"error": "Book not found"}, status=404)
        except Exception as e:
            return Response({"error": str(e)}, status=500)


class BookCopyUpdateView(APIView):
    """
    API view to toggle the availability of a book copy and update the reservation status.
    Only staff can mark books as returned.
    """
    permission_classes = [IsStaffUser]

    def put(self, request, book_id, copy_number):
        """
        Toggle the `is_available` field for a specific book copy,
        and mark any associated reservation as returned.
        """
        try:
            # Retrieve all book copies for the given book_id
            book_copies = BookCopies.objects.filter(book_id=book_id).order_by('copy_id')
            if copy_number <= 0 or copy_number > len(book_copies):
                return Response({"error": "Invalid copy number."}, status=400)

            # Fetch the specific book copy by copy_number
            book_copy = book_copies[copy_number - 1]

            # Retrieve the first reservation associated with this copy
            reservation = Reservations.objects.filter(copy=book_copy, copy__is_available=False).first()

            # If a reservation exists, mark the book copy as available
            if reservation:
                book_copy.is_available = True
                book_copy.save()

            # Prepare the response data
            response_data = {
                "message": "Book copy availability updated successfully.",
                "copy_id": book_copy.copy_id,
                "is_available": book_copy.is_available,
                "reservation_status": "Returned" if reservation else "No active reservation",
            }

            # If a reservation exists, serialize it for the response
            if reservation:
                serializer = ReservationSerializer(reservation)
                response_data["reservation"] = serializer.data

            return Response(response_data, status=200)

        except BookCopies.DoesNotExist:
            return Response({"error": "Book copy not found."}, status=404)
        except Exception as e:
            return Response({"error": str(e)}, status=500)
