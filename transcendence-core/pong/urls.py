from django.urls import path
from .views import home_view, game_view

app_name = "pong"

urlpatterns = [
    path('', home_view, name='home'),
    path('game', game_view, name='game'),
]
