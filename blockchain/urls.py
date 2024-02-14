"""URLs for the blockchain app"""
from django.urls import path
from . import views

app_name = 'blockchain'
urlpatterns = [
	path('tournament/', views.TournamentView.as_view(), name='mine'),
]
