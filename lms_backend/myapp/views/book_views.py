from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from myapp.models import Book
from myapp.serializers.book_serializers import BookSerializer

class BookListView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        books = Book.objects.all()
        serializer = BookSerializer(books, many=True)  # Serialize all books
        return Response(serializer.data)

class BookDetailView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, *args, **kwargs):
        book_id = self.kwargs.get('book_id')
        
        if book_id:
            try:
                book = Book.objects.get(book_id=book_id)
                serializer = BookSerializer(book)  # Serialize a single book
                return Response(serializer.data)
            except Book.DoesNotExist:
                return Response({"error": "Book not found"}, status=404)
        else:
            books = Book.objects.all()  # Fallback: Retrieve all books if book_id is not provided
            serializer = BookSerializer(books, many=True)  # Serialize all books
            return Response(serializer.data)
