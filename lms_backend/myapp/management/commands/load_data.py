import os
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from myapp.models import Author, Genre, Book, BookCopies

User = get_user_model()

# Users data
# Users data
users = [
    {"email": "librarian1@example.com", "password": "password1", "name": "Librarian 1", "is_staff": True, "is_superuser": False},
    {"email": "librarian2@example.com", "password": "password2", "name": "Librarian 2", "is_staff": True, "is_superuser": False},
    {"email": "user1@example.com", "password": "password3", "name": "User 1", "is_staff": False, "is_superuser": False},
    {"email": "user2@example.com", "password": "password4", "name": "User 2", "is_staff": False, "is_superuser": False},
]


# Authors data
authors = [
    {"name": "George Orwell"},
    {"name": "J.K. Rowling"},
    {"name": "Isaac Asimov"},
    {"name": "J.R.R. Tolkien"},
    {"name": "Jane Austen"},
    {"name": "Mark Twain"},
    {"name": "Charles Dickens"},
    {"name": "Agatha Christie"},
    {"name": "Ernest Hemingway"},
    {"name": "F. Scott Fitzgerald"},
    {"name": "William Shakespeare"},
    {"name": "Stephen King"},
    {"name": "Arthur Conan Doyle"},
    {"name": "Virginia Woolf"},
    {"name": "Ray Bradbury"},
    {"name": "H.G. Wells"},
    {"name": "Haruki Murakami"},
    {"name": "Gabriel Garcia Marquez"},
    {"name": "Kurt Vonnegut"},
    {"name": "Oscar Wilde"},
    {"name": "C.S. Lewis"},
    {"name": "Leo Tolstoy"},
    {"name": "Mary Shelley"},
    {"name": "Aldous Huxley"},
    {"name": "Emily Bronte"},
    {"name": "J.D. Salinger"},
    {"name": "Toni Morrison"},
    {"name": "Herman Melville"},
    {"name": "Fyodor Dostoevsky"},
    {"name": "Edgar Allan Poe"},
    {"name": "James Joyce"},
    {"name": "Franz Kafka"},
    {"name": "Lewis Carroll"},
    {"name": "George R.R. Martin"},
    {"name": "Jules Verne"},
    {"name": "Ayn Rand"},
    {"name": "Jack London"},
    {"name": "Homer"},
    {"name": "Ralph Ellison"},
    {"name": "Charlotte Perkins Gilman"},
    {"name": "Margaret Atwood"},
    {"name": "John Steinbeck"},
    {"name": "Robert Louis Stevenson"},
    {"name": "Joseph Conrad"},
    {"name": "Thomas Hardy"},
]


# Genres data
genres = [
    {"name": "Fantasy"},
    {"name": "Science Fiction"},
    {"name": "Mystery"},
    {"name": "Historical Fiction"},
    {"name": "Romance"},
    {"name": "Horror"},
    {"name": "Drama"},
    {"name": "Thriller"},
    {"name": "Adventure"},
    {"name": "Dystopian"},
    {"name": "Classic"},
    {"name": "Humor"},
    {"name": "Philosophical"},
    {"name": "Mythology"},
    {"name": "Biography"},
    {"name": "Non-Fiction"},
    {"name": "Poetry"},
    {"name": "Western"},
    {"name": "Political Fiction"},
    {"name": "Satire"},
    {"name": "Magical Realism"},
    {"name": "Children's"},
    {"name": "Young Adult"},
    {"name": "Gothic"},
    {"name": "Psychological Fiction"},
]


# Books data
books = [
    {"title": "1984", "author_id": 1, "genre_id": 10, "isbn": "9780451524935", "quantity": 3},
    {"title": "Harry Potter and the Sorcerer's Stone", "author_id": 2, "genre_id": 1, "isbn": "9780439554930", "quantity": 4},
    {"title": "Foundation", "author_id": 3, "genre_id": 2, "isbn": "9780553293357", "quantity": 2},
    {"title": "The Hobbit", "author_id": 4, "genre_id": 1, "isbn": "9780547928227", "quantity": 3},
    {"title": "Pride and Prejudice", "author_id": 5, "genre_id": 5, "isbn": "9780141439518", "quantity": 3},
    {"title": "The Adventures of Tom Sawyer", "author_id": 6, "genre_id": 12, "isbn": "9780486400778", "quantity": 1},
    {"title": "A Tale of Two Cities", "author_id": 7, "genre_id": 11, "isbn": "9780141439600", "quantity": 2},
    {"title": "Murder on the Orient Express", "author_id": 8, "genre_id": 3, "isbn": "9780062693662", "quantity": 3},
    {"title": "The Old Man and the Sea", "author_id": 9, "genre_id": 4, "isbn": "9780684801223", "quantity": 6},
    {"title": "The Great Gatsby", "author_id": 10, "genre_id": 11, "isbn": "9780743273565", "quantity": 4},
    {"title": "Hamlet", "author_id": 11, "genre_id": 7, "isbn": "9780743477123", "quantity": 6},
    {"title": "The Shining", "author_id": 12, "genre_id": 6, "isbn": "9780307743657", "quantity": 5},
    {"title": "The Hound of the Baskervilles", "author_id": 13, "genre_id": 3, "isbn": "9780141032436", "quantity": 3},
    {"title": "Mrs. Dalloway", "author_id": 14, "genre_id": 7, "isbn": "9780156628709", "quantity": 4},
    {"title": "Fahrenheit 451", "author_id": 15, "genre_id": 2, "isbn": "9781451673319", "quantity": 5},
    {"title": "The War of the Worlds", "author_id": 16, "genre_id": 2, "isbn": "9780345484218", "quantity": 6},
    {"title": "Norwegian Wood", "author_id": 17, "genre_id": 25, "isbn": "9780375704024", "quantity": 2},
    {"title": "One Hundred Years of Solitude", "author_id": 18, "genre_id": 21, "isbn": "9780060883287", "quantity": 4},
    {"title": "Slaughterhouse-Five", "author_id": 19, "genre_id": 20, "isbn": "9780385333849", "quantity": 3},
    {"title": "The Picture of Dorian Gray", "author_id": 20, "genre_id": 7, "isbn": "9780141439570", "quantity": 5},
    {"title": "The Lion, the Witch and the Wardrobe", "author_id": 21, "genre_id": 1, "isbn": "9780064471046", "quantity": 2},
    {"title": "War and Peace", "author_id": 22, "genre_id": 11, "isbn": "9780199232765", "quantity": 6},
    {"title": "Frankenstein", "author_id": 23, "genre_id": 24, "isbn": "9780486282114", "quantity": 6},
    {"title": "Brave New World", "author_id": 24, "genre_id": 10, "isbn": "9780060850524", "quantity": 4},
    {"title": "Wuthering Heights", "author_id": 25, "genre_id": 24, "isbn": "9780141439556", "quantity": 3},
    {"title": "Animal Farm", "author_id": 1, "genre_id": 19, "isbn": "9780451526342", "quantity": 3},
    {"title": "Harry Potter and the Chamber of Secrets", "author_id": 2, "genre_id": 1, "isbn": "9780439064873", "quantity": 4},
    {"title": "I, Robot", "author_id": 3, "genre_id": 2, "isbn": "9780553382563", "quantity": 5},
    {"title": "The Lord of the Rings: The Fellowship of the Ring", "author_id": 4, "genre_id": 9, "isbn": "9780547928210", "quantity": 6},
    {"title": "Sense and Sensibility", "author_id": 5, "genre_id": 5, "isbn": "9780141439662", "quantity": 6},
    {"title": "The Prince and the Pauper", "author_id": 6, "genre_id": 12, "isbn": "9780486411101", "quantity": 2},
    {"title": "Great Expectations", "author_id": 7, "genre_id": 11, "isbn": "9780141439563", "quantity": 3},
    {"title": "The ABC Murders", "author_id": 8, "genre_id": 3, "isbn": "9780062073587", "quantity": 5},
    {"title": "For Whom the Bell Tolls", "author_id": 9, "genre_id": 4, "isbn": "9780684803357", "quantity": 6},
    {"title": "Tender is the Night", "author_id": 10, "genre_id": 11, "isbn": "9780684801544", "quantity": 6},
    {"title": "Macbeth", "author_id": 11, "genre_id": 17, "isbn": "9780743477109", "quantity": 3},
    {"title": "Carrie", "author_id": 12, "genre_id": 6, "isbn": "9780307743664", "quantity": 4},
    {"title": "A Study in Scarlet", "author_id": 13, "genre_id": 3, "isbn": "9780141032535", "quantity": 4},
    {"title": "To the Lighthouse", "author_id": 14, "genre_id": 7, "isbn": "9780156907391", "quantity": 5},
    {"title": "The Martian Chronicles", "author_id": 15, "genre_id": 2, "isbn": "9780062079930", "quantity": 6},
    {"title": "The Time Machine", "author_id": 16, "genre_id": 2, "isbn": "9780345321601", "quantity": 6},
    {"title": "Kafka on the Shore", "author_id": 17, "genre_id": 25, "isbn": "9781400079278", "quantity": 4},
    {"title": "Love in the Time of Cholera", "author_id": 18, "genre_id": 21, "isbn": "9780307389731", "quantity": 4},
    {"title": "Cat's Cradle", "author_id": 19, "genre_id": 20, "isbn": "9780385333481", "quantity": 2},
    {"title": "The Importance of Being Earnest", "author_id": 20, "genre_id": 13, "isbn": "9780486264783", "quantity": 4},
    {"title": "The Horse and His Boy", "author_id": 21, "genre_id": 1, "isbn": "9780064471061", "quantity": 4},
    {"title": "Anna Karenina", "author_id": 22, "genre_id": 11, "isbn": "9780140449174", "quantity": 5},
    {"title": "The Last Man", "author_id": 23, "genre_id": 6, "isbn": "9780140439123", "quantity": 5},
    {"title": "Island", "author_id": 24, "genre_id": 10, "isbn": "9780060850525", "quantity": 2},
    {"title": "Agnes Grey", "author_id": 25, "genre_id": 24, "isbn": "9780140432100", "quantity": 4},
]



# Book copies data
book_copies = [
    # "1984"
    {"book_title": "1984", "quantity": 3},

    # "Harry Potter and the Sorcerer's Stone"
    {"book_title": "Harry Potter and the Sorcerer's Stone", "quantity": 4},

    # "Foundation"
    {"book_title": "Foundation", "quantity": 2},

    # "The Hobbit"
    {"book_title": "The Hobbit", "quantity": 3},

    # "Pride and Prejudice"
    {"book_title": "Pride and Prejudice", "quantity": 3},

    # "The Adventures of Tom Sawyer"
    {"book_title": "The Adventures of Tom Sawyer", "quantity": 1},

    # "A Tale of Two Cities"
    {"book_title": "A Tale of Two Cities", "quantity": 2},

    # "Murder on the Orient Express"
    {"book_title": "Murder on the Orient Express", "quantity": 3},

    # "The Old Man and the Sea"
    {"book_title": "The Old Man and the Sea", "quantity": 6},

    # "The Great Gatsby"
    {"book_title": "The Great Gatsby", "quantity": 4},

    # "Hamlet"
    {"book_title": "Hamlet", "quantity": 6},

    # "The Shining"
    {"book_title": "The Shining", "quantity": 5},

    # "The Hound of the Baskervilles"
    {"book_title": "The Hound of the Baskervilles", "quantity": 3},

    # "Mrs. Dalloway"
    {"book_title": "Mrs. Dalloway", "quantity": 4},

    # "Fahrenheit 451"
    {"book_title": "Fahrenheit 451", "quantity": 5},

    # "The War of the Worlds"
    {"book_title": "The War of the Worlds", "quantity": 6},

    # "Norwegian Wood"
    {"book_title": "Norwegian Wood", "quantity": 2},

    # "One Hundred Years of Solitude"
    {"book_title": "One Hundred Years of Solitude", "quantity": 4},

    # "Slaughterhouse-Five"
    {"book_title": "Slaughterhouse-Five", "quantity": 3},

    # "The Picture of Dorian Gray"
    {"book_title": "The Picture of Dorian Gray", "quantity": 5},

    # "The Lion, the Witch and the Wardrobe"
    {"book_title": "The Lion, the Witch and the Wardrobe", "quantity": 2},

    # "War and Peace"
    {"book_title": "War and Peace", "quantity": 6},

    # "Frankenstein"
    {"book_title": "Frankenstein", "quantity": 6},

    # "Brave New World"
    {"book_title": "Brave New World", "quantity": 4},

    # "Wuthering Heights"
    {"book_title": "Wuthering Heights", "quantity": 3},

    # "Animal Farm"
    {"book_title": "Animal Farm", "quantity": 3},

    # "Harry Potter and the Chamber of Secrets"
    {"book_title": "Harry Potter and the Chamber of Secrets", "quantity": 4},

    # "I, Robot"
    {"book_title": "I, Robot", "quantity": 5},

    # "The Lord of the Rings: The Fellowship of the Ring"
    {"book_title": "The Lord of the Rings: The Fellowship of the Ring", "quantity": 6},

    # "Sense and Sensibility"
    {"book_title": "Sense and Sensibility", "quantity": 6},

    # "The Prince and the Pauper"
    {"book_title": "The Prince and the Pauper", "quantity": 2},

    # "Great Expectations"
    {"book_title": "Great Expectations", "quantity": 3},

    # "The ABC Murders"
    {"book_title": "The ABC Murders", "quantity": 5},

    # "For Whom the Bell Tolls"
    {"book_title": "For Whom the Bell Tolls", "quantity": 6},

    # "Tender is the Night"
    {"book_title": "Tender is the Night", "quantity": 6},

    # "Macbeth"
    {"book_title": "Macbeth", "quantity": 3},

    # "Carrie"
    {"book_title": "Carrie", "quantity": 4},

    # "A Study in Scarlet"
    {"book_title": "A Study in Scarlet", "quantity": 4},

    # "To the Lighthouse"
    {"book_title": "To the Lighthouse", "quantity": 5},

    # "The Martian Chronicles"
    {"book_title": "The Martian Chronicles", "quantity": 6},

    # "The Time Machine"
    {"book_title": "The Time Machine", "quantity": 6},

    # "Kafka on the Shore"
    {"book_title": "Kafka on the Shore", "quantity": 4},

    # "Love in the Time of Cholera"
    {"book_title": "Love in the Time of Cholera", "quantity": 4},

    # "Cat's Cradle"
    {"book_title": "Cat's Cradle", "quantity": 2},

    # "The Importance of Being Earnest"
    {"book_title": "The Importance of Being Earnest", "quantity": 4},

    # "The Horse and His Boy"
    {"book_title": "The Horse and His Boy", "quantity": 4},

    # "Anna Karenina"
    {"book_title": "Anna Karenina", "quantity": 5},

    # "The Last Man"
    {"book_title": "The Last Man", "quantity": 5},

    # "Island"
    {"book_title": "Island", "quantity": 2},

    # "Agnes Grey"
    {"book_title": "Agnes Grey", "quantity": 4},
]



class Command(BaseCommand):
    help = "Load initial data into the database"

    def handle(self, *args, **kwargs):
        # Insert users
        for user_data in users:
            user, created = User.objects.get_or_create(email=user_data["email"], defaults={
                "name": user_data["name"],
                "is_staff": user_data["is_staff"],
                "is_superuser": user_data["is_superuser"],
            })
            if created:
                user.set_password(user_data["password"])
                user.save()
                self.stdout.write(self.style.SUCCESS(f"User '{user.email}' created."))
            else:
                self.stdout.write(f"User '{user.email}' already exists.")

        # Insert authors
        for author_data in authors:
            Author.objects.get_or_create(name=author_data["name"])

        # Insert genres
        for genre_data in genres:
            Genre.objects.get_or_create(name=genre_data["name"])

        # Insert books
        for book_data in books:
            try:
                # Fetch author and genre instances by ID
                author = Author.objects.get(pk=book_data["author_id"])
                genre = Genre.objects.get(pk=book_data["genre_id"])

                # Create or get the book
                book, created = Book.objects.get_or_create(
                    title=book_data["title"],
                    author=author,  # Pass the Author instance
                    genre=genre,  # Pass the Genre instance
                    isbn=book_data["isbn"],
                    quantity=book_data["quantity"],
                )
                # Create book copies based on the quantity
                existing_copies = BookCopies.objects.filter(book=book).count()
                copies_to_add = book.quantity - existing_copies
                if copies_to_add > 0:
                    BookCopies.objects.bulk_create([BookCopies(book=book) for _ in range(copies_to_add)])
                    print(f"{copies_to_add} copies of '{book.title}' added.")
                else:
                    print(f"Book '{book.title}' already has {existing_copies} copies.")
                    
                if created:
                    self.stdout.write(self.style.SUCCESS(f"Book '{book.title}' created."))
                else:
                    self.stdout.write(f"Book '{book.title}' already exists.")
            except (Author.DoesNotExist, Genre.DoesNotExist) as e:
                self.stdout.write(self.style.ERROR(f"Error: {e}"))