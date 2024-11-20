from django.contrib import admin
from .models import *
# Register your models here.
@admin.register(Reservations)
class ReservationAdmin(admin.ModelAdmin):
    list_display = ['book_id', 'user_id', 'start_date', 'due_date']

@admin.register(Waitlist)
class WaitlistAdmin(admin.ModelAdmin):
    list_display = ['book_id', 'user_id', 'date_placed']