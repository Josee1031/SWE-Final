from django.urls import path # type: ignore
from myapp.views.book_views import BookListView
from myapp.views.book_views import BookDetailView
from myapp.views.reservation_views import ReservationListView


urlpatterns = [
    path('books/', BookListView.as_view(), name='book_list'),  # List view
    path('books/<int:book_id>/', BookDetailView.as_view(), name='book-detail'),  # Detail view
]
