from django.contrib import admin
from .models import *
# Register your models here.
@admin.register(Author)
class AuthorAdmin(admin.ModelAdmin):
    list_display = ['name']

@admin.register(Genre)
class GenreAdmin(admin.ModelAdmin):
    list_display = ['name']

@admin.register(Book)
class BookAdmin(admin.ModelAdmin):
    list_display = ['title', 'release_date', 'isbn']

    # def display_release_date(self, obj):
    #     return obj.release_date.strftime('%d %b %Y')  # Format date as dd mm yyyy
    # display_release_date.short_description = 'Release Date'

@admin.register(Book_Copies)
class Book_copiesAdmin(admin.ModelAdmin):
    list_display = ['book_id', 'copy_id', 'is_available']