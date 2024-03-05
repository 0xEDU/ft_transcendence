"""URLs for the pong app."""
from django.urls import path
from .views import MatchView

app_name = "pong" # pylint: disable=invalid-name
urlpatterns = [
    path('match', MatchView.as_view(), name='match'),
]
