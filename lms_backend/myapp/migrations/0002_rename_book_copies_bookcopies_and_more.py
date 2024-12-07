# Generated by Django 5.1.3 on 2024-12-06 16:12

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('myapp', '0001_initial'),
    ]

    operations = [
        migrations.RenameModel(
            old_name='Book_Copies',
            new_name='BookCopies',
        ),
        migrations.RenameField(
            model_name='bookcopies',
            old_name='book_id',
            new_name='book',
        ),
        migrations.RenameField(
            model_name='reservations',
            old_name='book_id',
            new_name='book',
        ),
        migrations.RenameField(
            model_name='reservations',
            old_name='copy_id',
            new_name='copy',
        ),
        migrations.RenameField(
            model_name='reservations',
            old_name='user_id',
            new_name='user',
        ),
        migrations.RenameField(
            model_name='waitlist',
            old_name='book_id',
            new_name='book',
        ),
        migrations.RenameField(
            model_name='waitlist',
            old_name='user_id',
            new_name='user',
        ),
        migrations.AddField(
            model_name='user',
            name='is_active',
            field=models.BooleanField(default=True),
        ),
        migrations.AddField(
            model_name='user',
            name='is_superuser',
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name='user',
            name='last_login',
            field=models.DateTimeField(blank=True, null=True, verbose_name='last login'),
        ),
        migrations.AlterField(
            model_name='user',
            name='password',
            field=models.CharField(max_length=128),
        ),
    ]