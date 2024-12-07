from django.urls import path # type: ignore
from myapp.views.user_views import UserDetailView
from myapp.views.book_views import BookListView
from myapp.views.reservation_views import ReservationListView


urlpatterns = [
   

    # Example API endpoints (add more as needed)
    path('books/', BookListView.as_view(), name='book_list'),
    path('reservations/', ReservationListView.as_view(), name='reservation_list'),
]
