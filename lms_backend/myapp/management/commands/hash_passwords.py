from django.core.management.base import BaseCommand
from myapp.models import User  # Replace `myapp` with your app name
from django.contrib.auth.hashers import make_password

class Command(BaseCommand):
    help = "Hash all plain-text passwords in the User table to meet Django standards"

    def handle(self, *args, **kwargs):
        users = User.objects.all()
        for user in users:
            # Skip already hashed passwords
            if not user.password.startswith(('pbkdf2_sha256$', 'argon2$', 'bcrypt$', 'sha1$')):
                original_password = user.password
                hashed_password = make_password(original_password)
                user.password = hashed_password
                user.save()
                self.stdout.write(self.style.SUCCESS(f"Password hashed for user: {user.email}"))
            else:
                self.stdout.write(self.style.WARNING(f"Password for user {user.email} is already hashed."))
