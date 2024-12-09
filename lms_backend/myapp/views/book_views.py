from rest_framework.views import APIView  # type: ignore
from rest_framework.response import Response  # type: ignore
from rest_framework.permissions import AllowAny  # type: ignore
from rest_framework import status  # type: ignore
from myapp.models import Book, BookCopies, Reservations, Author, Genre
from myapp.serializers.book_serializers import BookSerializer, BookCopySerializer
from django.db.models import Q  # type: ignore
from myapp.serializers.reservation_serializers import ReservationSerializer


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

    def post(self, request):
        """
        Create a new book using `author_name`, `title`, `isbn`, `genre_id`, and `copy_number`.
        - author_name (str): The name of the author.
        - title (str): The title of the book.
        - isbn (str): The ISBN of the book.
        - genre_id (int): The ID of the genre.
        - copy_number (int, optional): Number of copies to create.
        """
        author_name = request.data.get('author_name')
        genre_id = request.data.get('genre_id')

        if not author_name or not genre_id:
            return Response({"error": "author_name and genre_id are required"}, status=400)

        # Get or create the Author by name
        author, created = Author.objects.get_or_create(name=author_name)

        # Retrieve the Genre by id
        try:
            genre = Genre.objects.get(pk=genre_id)
        except Genre.DoesNotExist:
            return Response({"error": "Genre not found"}, status=404)

        # Prepare data for serializer: replacing author_name and genre_id with author, genre IDs
        data = request.data.copy()
        data['author'] = author.id
        data['genre'] = genre.id
        data.pop('author_name', None)
        data.pop('genre_id', None)

        serializer = BookSerializer(data=data)
        if serializer.is_valid():
            book = serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
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
        and update related reservations where `returned=False`.
        """
        try:
            # Retrieve the specific book copy
            book_copies = BookCopies.objects.filter(book_id=book_id)
            if copy_number - 1 >= len(book_copies):
                return Response({"error": "Invalid copy number."}, status=400)

            book_copy = book_copies[copy_number - 1]

            # Retrieve the reservation linked to this book copy where `returned=False`
            reservation = Reservations.objects.filter(
                copy_id=book_copy.copy_id,
                returned=False
            ).first()

            # If a reservation exists, mark it as returned
            if reservation:
                reservation.returned = True
                reservation.save()

            # Toggle the `is_available` field of the book copy
            book_copy.is_available = not book_copy.is_available
            book_copy.save()

            # Prepare the response data
            response_data = {
                "message": "Book copy availability toggled and reservation updated successfully.",
                "copy_id": book_copy.copy_id,
                "is_available": book_copy.is_available,
                "reservation_returned": reservation.returned if reservation else None,
            }

            # If a reservation exists, include its serialized data
            if reservation:
                serializer = ReservationSerializer(reservation)
                response_data["reservation"] = serializer.data

            return Response(response_data, status=200)

        except BookCopies.DoesNotExist:
            return Response({"error": "Book copy not found."}, status=404)
        except Exception as e:
            return Response({"error": str(e)}, status=500)

    
