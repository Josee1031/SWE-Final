from rest_framework.views import APIView # type: ignore
from rest_framework.response import Response # type: ignore
from myapp.models import Book
from myapp.serializers.book_serializers import BookSerializer
from rest_framework.permissions import AllowAny # type: ignore

class BookListView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        books = Book.objects.all()
        serializer = BookSerializer(books, many=True)  # Serialize all books
        return Response(serializer.data)
