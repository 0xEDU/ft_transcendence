"""Models for the soninha app."""
from django.db import models


class User(models.Model):
    """Model for a user."""

    login_intra = models.CharField(max_length=20)
    display_name = models.CharField(max_length=40)
    avatar_image_url = models.CharField(max_length=200, null=True)

class Achievements(models.Model):
    """Model for achievements."""

    user = models.ForeignKey(User, on_delete=models.CASCADE)
    ball_distance = models.IntegerField()
    friends_count = models.IntegerField()
    hours_played = models.IntegerField()
    matches_classic = models.IntegerField()
    matches_coop = models.IntegerField()
    matches_won = models.IntegerField()
