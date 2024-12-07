from rest_framework import serializers # type: ignore
from myapp.models import Book, BookCopies

class BookCopySerializer(serializers.ModelSerializer):
    class Meta:
        model = BookCopies
        fields = ['copy_id', 'is_available']

class BookSerializer(serializers.ModelSerializer):
    genre_name = serializers.CharField(source='genre.name', read_only=True)  # Get genre name
    author_name = serializers.CharField(source='author.name', read_only=True)  # Get author name
    is_available = serializers.SerializerMethodField()  # Custom field to check availability
    copies = serializers.SerializerMethodField()  # Include list of copies

    class Meta:
        model = Book
        fields = ['book_id','title', 'author_name', 'isbn', 'genre_name', 'is_available', 'copies']

    def get_is_available(self, obj):
        # Check if at least one copy of the book is available
        return BookCopies.objects.filter(book=obj, is_available=True).exists()

    def get_copies(self, obj):
        # Get all copies for the book
        copies = BookCopies.objects.filter(book=obj)
        return BookCopySerializer(copies, many=True).data
