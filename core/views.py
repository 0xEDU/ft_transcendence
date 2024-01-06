"""Core views."""
from django.shortcuts import render

def home(request):
    """Renders the home page."""

    return render(request, 'index.html')
