from django.db import models
import datetime

# Create your models here.
class Author(models.Model):
    author_id = models.AutoField(primary_key=True)  # Auto-incremented ID
    name = models.CharField(max_length=100)  # Author name

    def __str__(self):
        return self.name


class Genre(models.Model):
    genre_id = models.AutoField(primary_key=True)  # Auto-incremented ID
    name = models.CharField(max_length=50)  # Genre name (e.g., Fiction, Non-Fiction)

    def __str__(self):
        return self.name

class Book(models.Model):
    book_id = models.AutoField(primary_key=True)  # Auto-incremented ID
    title = models.CharField(max_length=100)  # Book title
    release_date = models.DateField(default=datetime.date(1001,1,1))
    author_id = models.ForeignKey(Author, on_delete=models.CASCADE, default=1)  # Author ID
    genre_id = models.ForeignKey(Genre, on_delete=models.CASCADE, default=1)  # Genre ID
    isbn = models.CharField(max_length=13)  # ISBN number
    copies_available = models.IntegerField()  # Number of copies available

    def __str__(self):
        return self.title

class Book_Copies(models.Model):
    copy_id = models.AutoField(primary_key=True)  # Auto-incremented ID
    book_id = models.ForeignKey(Book, on_delete=models.CASCADE, default=1)  # Book ID
    is_available = models.BooleanField(default=True)  # Availability status

    def __str__(self):
        return str(self.copy_id)