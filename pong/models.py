"""Models for the pong app."""
from django.db import models
from soninha.models import User


class Match(models.Model):
    """Model for a match."""

    match_date = models.DateTimeField(auto_now_add=True)
    players = models.ManyToManyField(User, through="Score")


class Score(models.Model):
    """Model for a score."""

    player = models.ForeignKey(User, on_delete=models.CASCADE)
    match = models.ForeignKey(Match, on_delete=models.CASCADE)
    score = models.IntegerField()
