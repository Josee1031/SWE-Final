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
    copy_number = serializers.IntegerField(write_only=True, required=False)  # For creating multiple copies

    class Meta:
        model = Book
        fields = ['book_id', 'title', 'author_name', 'isbn', 'genre_name', 'is_available', 'copies', 'copy_number']

    def get_is_available(self, obj):
        # Check if at least one copy of the book is available
        return BookCopies.objects.filter(book=obj, is_available=True).exists()

    def get_copies(self, obj):
        # Get all copies for the book
        copies = BookCopies.objects.filter(book=obj)
        return BookCopySerializer(copies, many=True).data

    def create(self, validated_data):
        # Extract the copy_number field from validated_data
        copy_number = validated_data.pop('copy_number', 0)

        # Create the book record
        book = Book.objects.create(**validated_data)

        # Create the specified number of copies
        book_copies = [BookCopies(book=book, is_available=True) for _ in range(copy_number)]
        BookCopies.objects.bulk_create(book_copies)

        return book
