# Generated by Django 4.2.7 on 2024-02-28 14:08

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('soninha', '0002_alter_user_avatar_image_url'),
    ]

    operations = [
        migrations.RenameField(
            model_name='user',
            old_name='avatar_image_url',
            new_name='intra_cdn_profile_picture_url',
        ),
        migrations.AddField(
            model_name='user',
            name='profile_picture',
            field=models.ImageField(blank=True, null=True, upload_to='profile_pictures/'),
        ),
    ]
