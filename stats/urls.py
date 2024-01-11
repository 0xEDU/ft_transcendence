"""URLs for the stats app."""
from django.urls import path
from . import views

urlpatterns = [
    path('matches-history/', views.MatchesHistoryTemplateView.as_view(),
         name='matchHistory'),
    path('tournaments/', views.TournamentsTemplateView.as_view(),
         name='tournaments'),
]
