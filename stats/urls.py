from django.urls import path
from . import views

urlpatterns = [
	path('matches-history/', views.matchesHistory, name='matchHistory'),
]
