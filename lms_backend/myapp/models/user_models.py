from django.contrib.auth.models import AbstractBaseUser, BaseUserManager #type: ignore
from django.db import models # type: ignore

class UserManager(BaseUserManager):
    """
    Custom manager for the User model.
    """

    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError("The Email field must be set")
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)  # Hash the password
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        """
        Create and return a superuser with the given email and password.
        """
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)

        if not extra_fields.get('is_staff'):
            raise ValueError("Superuser must have is_staff=True.")
        if not extra_fields.get('is_superuser'):
            raise ValueError("Superuser must have is_superuser=True.")

        return self.create_user(email, password, **extra_fields)


class User(AbstractBaseUser):
    """
    Custom User model that uses email instead of username.
    """
    user_id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=100)
    email = models.EmailField(max_length=100, unique=True)
    password = models.CharField(max_length=128)  # Provided by AbstractBaseUser
    is_staff = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)  # Determines if user is active
    is_superuser = models.BooleanField(default=False)  # Superuser/admin flag

    # Custom manager for the User model
    objects = UserManager()

    # Use email for login instead of username
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['name']

    def __str__(self):
        return self.name

    class Meta:
        db_table = "user"