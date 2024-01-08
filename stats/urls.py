"""URLs for the stats app."""
from django.urls import path
from . import views

urlpatterns = [
    path('matches-history/', views.MatchesHistoryTemplate.as_view(),
         name='matchHistory'),
]
