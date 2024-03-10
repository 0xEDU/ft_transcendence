"""Models for the soninha app."""
from django.db import models


class User(models.Model):
    """Model for a user."""

    login_intra = models.CharField(max_length=20)
    display_name = models.CharField(max_length=40)
    intra_cdn_profile_picture_url = models.CharField(max_length=200, null=True)
