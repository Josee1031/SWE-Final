from django.db import models
from user_reg.models import LibraryUser
from librarian_dashboard.models import *
from django.utils import timezone
import datetime

# Create your models here.
class Reservations(models.Model):
    reservation_id = models.AutoField(primary_key=True)  # Auto-incremented ID
    user_id = models.ForeignKey(LibraryUser, on_delete=models.CASCADE, default=1)  # User ID
    copy_id = models.ForeignKey(Book_Copies, on_delete=models.CASCADE, default=1)  # Copy ID
    book_id = models.ForeignKey(Book, on_delete=models.CASCADE)  # Book ID
    start_date = models.DateField(auto_now_add=True)  # Reservation date
    due_date = models.DateField()  # Return date

    def save(self, *args, **kwargs):
        if not self.id:  # Check if the record is being created
            self.limit_date = self.date_placed + timezone.timedelta(days=30)
        super(YourModel, self).save(*args, **kwargs)

    def __str__(self):
        return str(self.reservation_id)


class Waitlist(models.Model):
    queue_id = models.AutoField(primary_key=True)  # Auto-incremented ID
    user_id = models.ForeignKey(LibraryUser, on_delete=models.CASCADE, default=1)  # User ID
    book_id = models.ForeignKey(Book, on_delete=models.CASCADE, default=1)  # Book ID
    date_placed = models.DateField(auto_now_add=True)  # Date added to waitlist
    limit_date = models.DateField()  # Date limit for reservation
    book_lent = models.BooleanField(default=False)  # Book lent status

    def save(self, *args, **kwargs):
        if not self.id:  # Check if the record is being created
            self.limit_date = self.date_placed + timezone.timedelta(days=3)
        super(YourModel, self).save(*args, **kwargs)

    def __str__(self):
        return str(self.waitlist_id)