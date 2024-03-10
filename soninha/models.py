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


class Achievements(models.Model):
    """Model for achievements."""

    user = models.ForeignKey(User, on_delete=models.CASCADE)
    ball_distance = models.IntegerField(default=0)
    friends_count = models.IntegerField(default=0)
    hours_played = models.IntegerField(default=0)
    matches_classic = models.IntegerField(default=0)
    matches_coop = models.IntegerField(default=0)
    matches_won = models.IntegerField(default=0)

    def __str__(self):
        return f"I am user [{self.user.login_intra}]'s achievements"
