from django.db import models
from soninha.models import User

class Match(models.Model):
    match_date = models.DateTimeField(auto_now_add=True)
    players = models.ManyToManyField(User, through="Score")

class Score(models.Model):
    player = models.ForeignKey(User, on_delete=models.CASCADE)
    match = models.ForeignKey(Match, on_delete=models.CASCADE)
    score = models.IntegerField()

