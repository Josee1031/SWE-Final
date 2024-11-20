from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.utils.translation import gettext_lazy as _
from .models import *
# Register your models here.

class LibraryUserAdmin(BaseUserAdmin):
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('username', 'first_name', 'last_name', 'email', 'is_active', 'is_staff', 'password1', 'password2'),
        }),
    )

    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        (_('Personal info'), {'fields': ('username', 'first_name', 'last_name')}),
        (_('Permissions'), {'fields': ('is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        (_('Important dates'), {'fields': ('last_login',)}),  # 'date_joined' is omitted here
    )

    list_display = ['username', 'first_name', 'last_name', 'email', 'is_staff']
    ordering = ['username']  # Set the default ordering field
    
    list_filter = ['is_staff'] 

admin.site.register(LibraryUser, LibraryUserAdmin)