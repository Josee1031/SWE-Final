# Generated by Django 5.1.3 on 2024-12-07 01:27

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('myapp', '0002_rename_book_copies_bookcopies_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='reservations',
            name='returned',
            field=models.BooleanField(default=False),
        ),
    ]
