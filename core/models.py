from django.db import models
from soninha.models import User

class Friendship(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('accepted', 'Accepted'),
    ]

    requester = models.ForeignKey(User, on_delete=models.CASCADE, related_name='friendship_requests_sent')
    accepter = models.ForeignKey(User, on_delete=models.CASCADE, related_name='friendship_requests_received')
    status = models.CharField(max_length=8, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.requester} -> {self.accepter} [{self.status}]"