"""URLs for the pong app."""
from django.urls import path
from .views import home_view, GameTemplateView, MatchView, GameFormView

app_name = "pong" # pylint: disable=invalid-name
urlpatterns = [
    path('', home_view, name='home'),
    path('game', GameTemplateView.as_view(), name='game'),
    path('match', MatchView.as_view(), name='match'),
    path('form', GameFormView.as_view(), name='form'),
]
