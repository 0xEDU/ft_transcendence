"""Models for the soninha app."""
from django.db import models


class User(models.Model):
    """Model for a user."""

    login_intra = models.CharField(max_length=20)
    display_name = models.CharField(max_length=40)
    intra_cdn_profile_picture_url = models.CharField(max_length=200, null=True)
    profile_picture = models.ImageField(upload_to='profile_pictures/', null=True, blank=True)

    def __str__(self):
        return f"I am user [{self.id}] - {self.display_name}"