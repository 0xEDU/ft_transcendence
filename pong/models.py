"""Models for the pong app."""
from django.db import models
from soninha.models import User


class Match(models.Model):
    """Model for a match."""

    MATCH_TYPE_CHOICES = [
        ('co-op', 'Co-op'),
        ('classic', 'Classic'),
    ]

    match_date = models.DateTimeField(auto_now_add=True)
    players = models.ManyToManyField(User, through="Score")
    type = models.CharField(max_length=10, choices=MATCH_TYPE_CHOICES)
    tournament = models.BooleanField(default=False)


class Score(models.Model):
    """Model for a score."""

    player = models.ForeignKey(User, on_delete=models.CASCADE)
    vs_id = models.ManyToManyField(User, related_name="games_with")
    match = models.ForeignKey(Match, on_delete=models.CASCADE)
    score = models.IntegerField()
