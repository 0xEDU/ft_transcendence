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


class Score(models.Model):
    """Model for a score."""

    player = models.ForeignKey(User, on_delete=models.CASCADE)
    vs_id = models.IntegerField()
    match = models.ForeignKey(Match, on_delete=models.CASCADE)
    score = models.IntegerField()
