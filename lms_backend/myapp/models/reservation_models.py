from django.db import models
from . import User, Book, BookCopies

class Reservations(models.Model):
    """
    Table for reservations.
    """
    reservation_id = models.AutoField(primary_key=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    copy = models.ForeignKey(BookCopies, on_delete=models.CASCADE)
    book = models.ForeignKey(Book, on_delete=models.CASCADE)
    start_date = models.DateField()
    due_date = models.DateField()

    def __str__(self):
        return str(self.reservation_id)

    class Meta:
        db_table = "reservations"


class Waitlist(models.Model):
    """
    Table for the waitlist.
    """
    queue_id = models.AutoField(primary_key=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    book = models.ForeignKey(Book, on_delete=models.CASCADE)
    date_placed = models.DateField()
    limit_date = models.DateField()
    book_lent = models.BooleanField(default=False)

    def __str__(self):
        return str(self.queue_id)

    class Meta:
        db_table = "waitlist"
