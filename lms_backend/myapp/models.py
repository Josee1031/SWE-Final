from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager
# Create your models here.

class User(models.Model):
    user_id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=100)
    email = models.EmailField(max_length=100, unique=True)
    password = models.CharField(max_length=100)
    is_staff = models.BooleanField(default=False)

    def __str__(self):
        return self.name
    
    class Meta:
        db_table = "user"

class Author(models.Model):
    author_id = models.AutoField(primary_key=True)  # Auto-incremented ID
    name = models.CharField(max_length=100)  # Author name

    def __str__(self):
        return self.name

    class Meta:
        db_table = "author"

class Genre(models.Model):
    genre_id = models.AutoField(primary_key=True)  # Auto-incremented ID
    name = models.CharField(max_length=50)  # Genre name (e.g., Fiction, Non-Fiction)

    def __str__(self):
        return self.name

    class Meta:
        db_table = "genre"

class Book(models.Model):
    book_id = models.AutoField(primary_key=True)  # Auto-incremented ID
    title = models.CharField(max_length=100)  # Book title
    author = models.ForeignKey(Author, on_delete=models.CASCADE)  # Author ID
    genre = models.ForeignKey(Genre, on_delete=models.CASCADE)  # Genre ID
    isbn = models.CharField(max_length=13)  # ISBN number
    quantity = models.IntegerField()  # Number of copies available

    def __str__(self):
        return self.title

    class Meta:
        db_table = "book"

class Book_Copies(models.Model):
    copy_id = models.AutoField(primary_key=True)  # Auto-incremented ID
    book_id = models.ForeignKey(Book, on_delete=models.CASCADE)  # Book ID
    is_available = models.BooleanField(default=True)  # Availability status

    def __str__(self):
        return str(self.copy_id)

    class Meta:
        db_table = "book_copy"

class Reservations(models.Model):
    reservation_id = models.AutoField(primary_key=True)  # Auto-incremented ID
    user_id = models.ForeignKey(User, on_delete=models.CASCADE)  # User ID
    copy_id = models.ForeignKey(Book_Copies, on_delete=models.CASCADE)  # Copy ID
    book_id = models.ForeignKey(Book, on_delete=models.CASCADE)  # Book ID
    start_date = models.DateField()  # Reservation date
    due_date = models.DateField()  # Return date

    def __str__(self):
        return str(self.reservation_id)

    class Meta:
        db_table = "reservations"

class Waitlist(models.Model):
    queue_id = models.AutoField(primary_key=True)  # Auto-incremented ID
    user_id = models.ForeignKey(User, on_delete=models.CASCADE)  # User ID
    book_id = models.ForeignKey(Book, on_delete=models.CASCADE)  # Book ID
    date_placed = models.DateField()  # Date added to waitlist
    limit_date = models.DateField()  # Date limit for reservation
    book_lent = models.BooleanField(default=False)  # Book lent status

    def __str__(self):
        return str(self.waitlist_id)

    class Meta:
        db_table = "waitlist"