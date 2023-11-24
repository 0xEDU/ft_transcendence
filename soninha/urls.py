from django.urls import path, include
from . import views

app_name = 'auth'

urlpatterns = [
    path('intra/', views.intra_view, name='intra'),
    path('login/', views.login_view, name='login'),
]
