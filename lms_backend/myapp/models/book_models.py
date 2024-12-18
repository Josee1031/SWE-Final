from django.db import models # type: ignore

class Author(models.Model):
    """
    Table for book authors.
    """
    author_id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=100)

    def __str__(self):
        return self.name

    class Meta:
        db_table = "author"


class Genre(models.Model):
    """
    Table for book genres.
    """
    genre_id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=50)

    def __str__(self):
        return self.name

    class Meta:
        db_table = "genre"


class Book(models.Model):
    """
    Table for books.
    """
    book_id = models.AutoField(primary_key=True)
    title = models.CharField(max_length=100)
    author = models.ForeignKey(Author, on_delete=models.CASCADE)
    genre = models.ForeignKey(Genre, on_delete=models.CASCADE)
    isbn = models.CharField(max_length=13)
    quantity = models.IntegerField(default=1)

    def __str__(self):
        return self.title

    class Meta:
        db_table = "book"


class BookCopies(models.Model):
    """
    Table for individual book copies.
    """
    copy_id = models.AutoField(primary_key=True)
    book = models.ForeignKey(Book, on_delete=models.CASCADE)
    is_available = models.BooleanField(default=True)

    def __str__(self):
        return str(self.copy_id)

    class Meta:
        db_table = "book_copy"