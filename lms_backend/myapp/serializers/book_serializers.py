from rest_framework import serializers  # type: ignore
from myapp.models import Book, BookCopies, Genre, Author
import re
from stdnum import isbn as stdnum_isbn

class BookCopySerializer(serializers.ModelSerializer):
    class Meta:
        model = BookCopies
        fields = ['copy_id', 'is_available']

class BookSerializer(serializers.ModelSerializer):
    # Read-only fields to display names
    genre_name = serializers.CharField(source='genre.name', read_only=True)
    author_name = serializers.CharField(source='author.name', read_only=True)
    is_available = serializers.SerializerMethodField()
    copies = serializers.SerializerMethodField()

    # Write-only fields to accept names for creation
    author_name_input = serializers.CharField(write_only=True, required=True, help_text="Name of the author")
    genre_name_input = serializers.CharField(write_only=True, required=True, help_text="Name of the genre")
    copy_number = serializers.IntegerField(write_only=True, required=False, default=1, help_text="Number of copies to create")

    class Meta:
        model = Book
        fields = [
            'book_id', 'title', 'author_name_input', 'author_name',
            'isbn', 'genre_name_input', 'genre_name',
            'is_available', 'copies', 'copy_number'
        ]
        read_only_fields = ['book_id', 'author_name', 'genre_name', 'is_available', 'copies']

    def get_is_available(self, obj):
        # Check if at least one copy of the book is available
        return BookCopies.objects.filter(book=obj, is_available=True).exists()

    def get_copies(self, obj):
        # Get all copies for the book
        copies = BookCopies.objects.filter(book=obj)
        return BookCopySerializer(copies, many=True).data

    def create(self, validated_data):
        author_name = validated_data.pop('author_name_input')
        genre_name = validated_data.pop('genre_name_input')
        copy_number = validated_data.pop('copy_number', 1)

        # Validate author_name
        if not author_name.strip():
            raise serializers.ValidationError({"author_name_input": "Author name cannot be empty."})

        # Validate genre_name
        if not genre_name.strip():
            raise serializers.ValidationError({"genre_name_input": "Genre name cannot be empty."})

        # Validate copy_number
        if copy_number < 1:
            raise serializers.ValidationError({"copy_number": "Number of copies must be at least 1."})

        # Get or create the Author
        author, created = Author.objects.get_or_create(name=author_name)

        # Get or create the Genre
        genre, created = Genre.objects.get_or_create(name=genre_name)

        # Create the Book instance
        book = Book.objects.create(author=author, genre=genre, **validated_data)

        # Create the specified number of BookCopies
        if copy_number > 0:
            book_copies = [BookCopies(book=book, is_available=True) for _ in range(copy_number)]
            BookCopies.objects.bulk_create(book_copies)

        return book

    def validate_isbn(self, value):
        """
        Validate the ISBN using python-stdnum.
        """
        if not stdnum_isbn.is_valid(value):
            raise serializers.ValidationError("Invalid ISBN format.")
        return stdnum_isbn.compact(value)  # Normalize the ISBN
