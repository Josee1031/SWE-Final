from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin

# Create your models here.
from django.conf import settings
from django.core.exceptions import ValidationError
from django.utils.translation import gettext_lazy as _

# Added to read static file bath
# from encrypted_model_fields.fields import EncryptedCharField
# from phonenumber_field.modelfields import PhoneNumberField
from django.utils import timezone
import os
import re


from django.contrib.auth.models import BaseUserManager

class CustomAccountManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError("The Email field must be set")
        
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)  # Set and hash the password
        user.save(using=self._db)

        # return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)

        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')

        self.create_user(email, password, **extra_fields)

        # return user

class LibraryUser(AbstractBaseUser, PermissionsMixin):
    user_id = models.AutoField(primary_key=True)
    username = models.CharField(max_length=100, verbose_name="Nombre d usuario", unique=True)
    first_name = models.CharField(max_length=50, verbose_name="Nombre")
    last_name = models.CharField(max_length=50, verbose_name="Apellidos")
    email = models.EmailField(max_length=100, unique=True, verbose_name="Correo electrónico")
    is_active = models.BooleanField(default=True)
    date_joined = models.DateTimeField(_("date joined"), auto_now_add=True)

    is_staff = models.BooleanField(default=False, verbose_name="Admin")

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["name"]

    objects = CustomAccountManager()

    def __str__(self):
        return self.email