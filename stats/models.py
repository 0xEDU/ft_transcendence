"""Models for stats app."""
from django.db import models
from soninha.models import User

# Create your models here.
class UserStats(models.Model):
    """Model for the stats of the user."""

    user = models.ForeignKey(User, on_delete=models.CASCADE)
    ball_distance = models.IntegerField(default=0)
    friends_count = models.IntegerField(default=0)
    hours_played = models.IntegerField(default=0)
    high_five_count = models.IntegerField(default=0)
    most_played_with = models.CharField(max_length=20)

    def __str__(self):
        return f"I am user [{self.user.login_intra}]'s stats"