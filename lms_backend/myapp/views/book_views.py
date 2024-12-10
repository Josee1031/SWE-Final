from rest_framework.views import APIView  # type: ignore
from rest_framework.response import Response  # type: ignore
from rest_framework.permissions import AllowAny  # type: ignore
from rest_framework import status  # type: ignore
from myapp.models import Book, BookCopies, Reservations, Author, Genre
from myapp.serializers.book_serializers import BookSerializer, BookCopySerializer
from django.db.models import Q  # type: ignore
from myapp.serializers.reservation_serializers import ReservationSerializer
import logging
from django.db import transaction
import re
from stdnum import isbn as stdnum_isbn
logger = logging.getLogger(__name__)


class BookListView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        # Get the search query from the request
        search_query = request.query_params.get('q', None)

        # Filter books by title or author's name
        if search_query:
            books = Book.objects.filter(
                Q(title__icontains=search_query) | Q(author__name__icontains=search_query)
            )
        else:
            books = Book.objects.all()

        serializer = BookSerializer(books, many=True)
        return Response(serializer.data)



class BookAPIView(APIView):

    @transaction.atomic
    def post(self, request):
        """
        Create a new book using `author_name`, `title`, `isbn`, `genre_name`, and `copy_number`.
        - author_name (str): The name of the author.
        - title (str): The title of the book.
        - isbn (str): The ISBN of the book.
        - genre_name (str): The name of the genre.
        - copy_number (int, optional): Number of copies to create.
        """
        author_name = request.data.get('author_name')
        genre_name = request.data.get('genre_name')
        title = request.data.get('title')
        isbn = request.data.get('isbn')
        copy_number = request.data.get('copy_number', 1)  # Default to 1 if not provided

        # Validate required fields
        if not all([author_name, genre_name, title, isbn]):
            logger.warning("Missing required fields in book creation request.")
            return Response(
                {"error": "author_name, genre_name, title, and isbn are required."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Validate copy_number
        try:
            copy_number = int(copy_number)
            if copy_number < 1:
                raise ValueError
        except (ValueError, TypeError):
            logger.warning(f"Invalid copy_number: {copy_number}")
            return Response(
                {"error": "copy_number must be an integer greater than or equal to 1."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Validate ISBN using python-stdnum
        if not stdnum_isbn.is_valid(isbn):
            logger.warning(f"Invalid ISBN format: {isbn}")
            return Response(
                {"error": "Invalid ISBN format."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Normalize ISBN (remove hyphens, spaces)
        isbn = stdnum_isbn.compact(isbn)

        # Get or create the Author by name
        author, created = Author.objects.get_or_create(name=author_name.strip())
        if created:
            logger.info(f"Created new author: {author_name}")

        # Get or create the Genre by name
        genre, genre_created = Genre.objects.get_or_create(name=genre_name.strip())
        if genre_created:
            logger.info(f"Created new genre: {genre_name}")

        # Prepare data for serializer
        data = {
            "author_name_input": author.name,  # Pass the author's name to the serializer
            "genre_name_input": genre.name,   # Pass the genre's name to the serializer
            "title": title.strip(),
            "isbn": isbn,
            "copy_number": copy_number
        }

        serializer = BookSerializer(data=data)
        if serializer.is_valid():
            book = serializer.save()
            logger.info(f"Book created successfully: {book.title}")
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        else:
            logger.warning(f"Book creation failed: {serializer.errors}")
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)




class BookDetailView(APIView):
    permission_classes = [AllowAny]

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
    """
    permission_classes = [AllowAny]

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
