from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase
from rest_framework import status
from myapp.models import Author, Genre, Book, BookCopies, Reservations
from datetime import date, timedelta

User = get_user_model()


class AuthTests(APITestCase):
    """Tests for authentication endpoints."""

    def setUp(self):
        self.user = User.objects.create_user(
            name='Alice Smith',
            email='alice.smith@example.com',
            password='password123'
        )

    def test_obtain_token(self):
        """Test JWT token generation via /api/auth/sign-in/."""
        response = self.client.post('/api/auth/sign-in/', {
            'email': 'alice.smith@example.com',
            'password': 'password123'
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)

    def test_obtain_token_invalid_credentials(self):
        """Test JWT token fails with wrong password."""
        response = self.client.post('/api/auth/sign-in/', {
            'email': 'alice.smith@example.com',
            'password': 'wrongpassword'
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


class SignUpTests(APITestCase):
    """Tests for POST /api/auth/sign-up/."""

    def test_signup_success(self):
        """Test successful user registration."""
        response = self.client.post('/api/auth/sign-up/', {
            'name': 'New User',
            'email': 'newuser@example.com',
            'password': 'securepassword'
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)
        self.assertEqual(response.data['user']['email'], 'newuser@example.com')

    def test_signup_missing_fields(self):
        """Test signup fails with missing fields."""
        response = self.client.post('/api/auth/sign-up/', {
            'email': 'test@example.com'
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_signup_duplicate_email(self):
        """Test signup fails with existing email."""
        User.objects.create_user(
            name='Existing User',
            email='existing@example.com',
            password='password123'
        )
        response = self.client.post('/api/auth/sign-up/', {
            'name': 'Another User',
            'email': 'existing@example.com',
            'password': 'password123'
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


class SignInTests(APITestCase):
    """Tests for POST /api/auth/sign-in/."""

    def setUp(self):
        self.user = User.objects.create_user(
            name='Test User',
            email='testuser@example.com',
            password='password123'
        )

    def test_signin_success(self):
        """Test successful sign-in."""
        response = self.client.post('/api/auth/sign-in/', {
            'email': 'testuser@example.com',
            'password': 'password123'
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)
        self.assertEqual(response.data['user']['email'], 'testuser@example.com')

    def test_signin_wrong_password(self):
        """Test sign-in fails with wrong password."""
        response = self.client.post('/api/auth/sign-in/', {
            'email': 'testuser@example.com',
            'password': 'wrongpassword'
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_signin_nonexistent_user(self):
        """Test sign-in fails for non-existent user."""
        response = self.client.post('/api/auth/sign-in/', {
            'email': 'nonexistent@example.com',
            'password': 'password123'
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


class UserMeTests(APITestCase):
    """Tests for GET /api/auth/users/me/."""

    def setUp(self):
        self.user = User.objects.create_user(
            name='Test User',
            email='testuser@example.com',
            password='password123'
        )

    def test_user_me_authenticated(self):
        """Test authenticated user can access /api/auth/users/me/."""
        # Get token via sign-in
        token_res = self.client.post('/api/auth/sign-in/', {
            'email': 'testuser@example.com',
            'password': 'password123'
        }, format='json')
        access_token = token_res.data['access']

        # Access protected endpoint
        self.client.credentials(HTTP_AUTHORIZATION='Bearer ' + access_token)
        response = self.client.get('/api/auth/users/me/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['email'], 'testuser@example.com')
        self.assertEqual(response.data['name'], 'Test User')

    def test_user_me_unauthenticated(self):
        """Test unauthenticated access is denied."""
        response = self.client.get('/api/auth/users/me/')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


class UserListTests(APITestCase):
    """Tests for GET /api/users/."""

    def setUp(self):
        self.regular_user = User.objects.create_user(
            name='Regular User',
            email='regular@example.com',
            password='password123',
            is_staff=False
        )
        self.staff_user = User.objects.create_user(
            name='Staff User',
            email='staff@example.com',
            password='password123',
            is_staff=True
        )

    def test_user_list_excludes_staff(self):
        """Test user list only returns non-staff users."""
        response = self.client.get('/api/users/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        emails = [user['email'] for user in response.data]
        self.assertIn('regular@example.com', emails)
        self.assertNotIn('staff@example.com', emails)


class UserDetailTests(APITestCase):
    """Tests for /api/users/<id>/."""

    def setUp(self):
        self.user = User.objects.create_user(
            name='Test User',
            email='testuser@example.com',
            password='password123'
        )

    def test_get_user_detail(self):
        """Test retrieving a user by ID."""
        response = self.client.get(f'/api/users/{self.user.user_id}/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['email'], 'testuser@example.com')

    def test_get_user_not_found(self):
        """Test 404 for non-existent user."""
        response = self.client.get('/api/users/99999/')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_update_user(self):
        """Test updating a user's name."""
        response = self.client.put(f'/api/users/{self.user.user_id}/', {
            'name': 'Updated Name'
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['name'], 'Updated Name')

    def test_delete_user(self):
        """Test deleting a user."""
        response = self.client.delete(f'/api/users/{self.user.user_id}/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertFalse(User.objects.filter(user_id=self.user.user_id).exists())


class BookListTests(APITestCase):
    """Tests for /api/books/."""

    def setUp(self):
        self.author = Author.objects.create(name='Test Author')
        self.genre = Genre.objects.create(name='Fiction')
        self.book = Book.objects.create(
            title='Test Book',
            author=self.author,
            genre=self.genre,
            isbn='9780306406157',
            quantity=5
        )

    def test_get_book_list(self):
        """Test listing all books."""
        response = self.client.get('/api/books/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['title'], 'Test Book')

    def test_search_books_by_title(self):
        """Test searching books by title."""
        response = self.client.get('/api/books/', {'q': 'Test'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

    def test_search_books_by_author(self):
        """Test searching books by author name."""
        response = self.client.get('/api/books/', {'q': 'Test Author'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

    def test_search_books_no_results(self):
        """Test search with no matching results."""
        response = self.client.get('/api/books/', {'q': 'Nonexistent'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 0)

    def test_create_book(self):
        """Test creating a new book."""
        response = self.client.post('/api/books/', {
            'author_name': 'New Author',
            'genre_name': 'Science Fiction',
            'title': 'New Book',
            'isbn': '978-0-13-468599-1',
            'copy_number': 3
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['title'], 'New Book')

    def test_create_book_missing_fields(self):
        """Test creating book fails with missing fields."""
        response = self.client.post('/api/books/', {
            'title': 'Incomplete Book'
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_create_book_invalid_isbn(self):
        """Test creating book fails with invalid ISBN."""
        response = self.client.post('/api/books/', {
            'author_name': 'Author',
            'genre_name': 'Genre',
            'title': 'Book',
            'isbn': 'invalid-isbn'
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


class BookDetailTests(APITestCase):
    """Tests for /api/books/<id>/."""

    def setUp(self):
        self.author = Author.objects.create(name='Test Author')
        self.genre = Genre.objects.create(name='Fiction')
        self.book = Book.objects.create(
            title='Test Book',
            author=self.author,
            genre=self.genre,
            isbn='9780306406157',
            quantity=5
        )

    def test_get_book_detail(self):
        """Test retrieving a book by ID."""
        response = self.client.get(f'/api/books/{self.book.book_id}/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['title'], 'Test Book')

    def test_get_book_not_found(self):
        """Test 404 for non-existent book."""
        response = self.client.get('/api/books/99999/')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_update_book(self):
        """Test updating a book."""
        response = self.client.put(f'/api/books/{self.book.book_id}/', {
            'title': 'Updated Title'
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['title'], 'Updated Title')

    def test_delete_book(self):
        """Test deleting a book."""
        response = self.client.delete(f'/api/books/{self.book.book_id}/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertFalse(Book.objects.filter(book_id=self.book.book_id).exists())


class BookCopyUpdateTests(APITestCase):
    """Tests for PUT /api/books/<book_id>/copies/<copy_number>/."""

    def setUp(self):
        self.author = Author.objects.create(name='Test Author')
        self.genre = Genre.objects.create(name='Fiction')
        self.book = Book.objects.create(
            title='Test Book',
            author=self.author,
            genre=self.genre,
            isbn='9780306406157',
            quantity=2
        )
        self.copy1 = BookCopies.objects.create(book=self.book, is_available=True)
        self.copy2 = BookCopies.objects.create(book=self.book, is_available=False)

        self.user = User.objects.create_user(
            name='Test User',
            email='testuser@example.com',
            password='password123'
        )
        self.reservation = Reservations.objects.create(
            user=self.user,
            book=self.book,
            copy=self.copy2,
            start_date=date.today(),
            due_date=date.today() + timedelta(days=7)
        )

    def test_update_copy_with_reservation(self):
        """Test returning a book copy that has a reservation."""
        response = self.client.put(f'/api/books/{self.book.book_id}/copies/2/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.copy2.refresh_from_db()
        self.assertTrue(self.copy2.is_available)

    def test_update_copy_invalid_number(self):
        """Test invalid copy number returns error."""
        response = self.client.put(f'/api/books/{self.book.book_id}/copies/999/')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


class ReservationListTests(APITestCase):
    """Tests for /api/reservations/."""

    def setUp(self):
        self.author = Author.objects.create(name='Test Author')
        self.genre = Genre.objects.create(name='Fiction')
        self.book = Book.objects.create(
            title='Test Book',
            author=self.author,
            genre=self.genre,
            isbn='9780306406157',
            quantity=2
        )
        self.copy = BookCopies.objects.create(book=self.book, is_available=True)
        self.user = User.objects.create_user(
            name='Test User',
            email='testuser@example.com',
            password='password123'
        )

    def test_get_reservations_empty(self):
        """Test getting empty reservations list."""
        response = self.client.get('/api/reservations/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 0)

    def test_create_reservation(self):
        """Test creating a new reservation."""
        response = self.client.post('/api/reservations/', {
            'email': 'testuser@example.com',
            'book_id': self.book.book_id,
            'copy_id': self.copy.copy_id,
            'start_date': str(date.today())
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.copy.refresh_from_db()
        self.assertFalse(self.copy.is_available)

    def test_create_reservation_missing_fields(self):
        """Test reservation fails with missing fields."""
        response = self.client.post('/api/reservations/', {
            'email': 'testuser@example.com'
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_create_reservation_invalid_user(self):
        """Test reservation fails for non-existent user."""
        response = self.client.post('/api/reservations/', {
            'email': 'nonexistent@example.com',
            'book_id': self.book.book_id,
            'copy_id': self.copy.copy_id,
            'start_date': str(date.today())
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_filter_reservations_by_book(self):
        """Test filtering reservations by book_id."""
        Reservations.objects.create(
            user=self.user,
            book=self.book,
            copy=self.copy,
            start_date=date.today(),
            due_date=date.today() + timedelta(days=7)
        )
        response = self.client.get(f'/api/reservations/?book_id={self.book.book_id}')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)


class ReservationDetailTests(APITestCase):
    """Tests for /api/reservations/<id>/."""

    def setUp(self):
        self.author = Author.objects.create(name='Test Author')
        self.genre = Genre.objects.create(name='Fiction')
        self.book = Book.objects.create(
            title='Test Book',
            author=self.author,
            genre=self.genre,
            isbn='9780306406157',
            quantity=1
        )
        self.copy = BookCopies.objects.create(book=self.book, is_available=False)
        self.user = User.objects.create_user(
            name='Test User',
            email='testuser@example.com',
            password='password123'
        )
        self.reservation = Reservations.objects.create(
            user=self.user,
            book=self.book,
            copy=self.copy,
            start_date=date.today(),
            due_date=date.today() + timedelta(days=7)
        )

    def test_return_book(self):
        """Test marking a book as returned via PUT."""
        response = self.client.put(f'/api/reservations/{self.reservation.reservation_id}/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.copy.refresh_from_db()
        self.assertTrue(self.copy.is_available)

    def test_return_already_returned(self):
        """Test returning an already returned book fails."""
        self.copy.is_available = True
        self.copy.save()
        response = self.client.put(f'/api/reservations/{self.reservation.reservation_id}/')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_return_nonexistent_reservation(self):
        """Test returning non-existent reservation fails."""
        response = self.client.put('/api/reservations/99999/')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)


class ExtendReservationTests(APITestCase):
    """Tests for PUT /api/reservations/<id>/extend/."""

    def setUp(self):
        self.author = Author.objects.create(name='Test Author')
        self.genre = Genre.objects.create(name='Fiction')
        self.book = Book.objects.create(
            title='Test Book',
            author=self.author,
            genre=self.genre,
            isbn='9780306406157',
            quantity=1
        )
        self.copy = BookCopies.objects.create(book=self.book, is_available=False)
        self.user = User.objects.create_user(
            name='Test User',
            email='testuser@example.com',
            password='password123'
        )
        self.original_due_date = date.today() + timedelta(days=7)
        self.reservation = Reservations.objects.create(
            user=self.user,
            book=self.book,
            copy=self.copy,
            start_date=date.today(),
            due_date=self.original_due_date
        )

    def test_extend_reservation(self):
        """Test extending a reservation by 7 days."""
        response = self.client.put(f'/api/reservations/{self.reservation.reservation_id}/extend/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.reservation.refresh_from_db()
        expected_due_date = self.original_due_date + timedelta(days=7)
        self.assertEqual(self.reservation.due_date, expected_due_date)

    def test_extend_nonexistent_reservation(self):
        """Test extending non-existent reservation fails."""
        response = self.client.put('/api/reservations/99999/extend/')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
