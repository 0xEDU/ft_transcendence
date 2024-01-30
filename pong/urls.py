"""URLs for the pong app."""
from django.urls import path
from .views import home_view, GameView, MatchView, GameFormView

app_name = "pong" # pylint: disable=invalid-name
urlpatterns = [
    path('', home_view, name='home'),
    path('game', GameView.as_view(), name='game'),
    path('match', MatchView.as_view(), name='match'),
    path('form', GameFormView.as_view(), name='form'),
]
