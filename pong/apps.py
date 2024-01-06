"""Configuration module for the 'pong' app."""
from django.apps import AppConfig


class AppPongConfig(AppConfig):
    """
    Configuration class for the 'pong' app.
    """
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'pong'
