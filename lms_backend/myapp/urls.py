from django.urls import path # type: ignore
from myapp.views.book_views import BookListView, BookDetailView, BookCopyUpdateView
from myapp.views.reservation_views import ReservationListView, ExtendReservationView
from myapp.views.user_views import UserListView, UserDetailView

urlpatterns = [
    path('books/', BookListView.as_view(), name='book_list'),
    path('books/<int:book_id>/', BookDetailView.as_view(), name='book_detail'),
    path('books/<int:book_id>/copies/<int:copy_number>/', BookCopyUpdateView.as_view(), name='book_copy_update'),
    path('reservations/', ReservationListView.as_view(), name='reservation_list'),
    path('reservations/<int:reservation_id>/extend/', ExtendReservationView.as_view(), name='extend_reservation'),
    path('users/', UserListView.as_view(), name='user_list'),
    path('users/<int:user_id>/', UserDetailView.as_view(), name='user_detail'),
]
