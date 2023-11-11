from django.urls import path
from .views import pong_view

urlpatterns = [
    path('', pong_view, name='pong'),
]
