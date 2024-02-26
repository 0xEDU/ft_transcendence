"""URLs for the soninha app."""
from django.urls import path
from . import views

app_name = 'auth'
urlpatterns = [
    path('login/', views.LoginView.as_view(), name='login'),
    path('logout/', views.LogoutView.as_view(), name='logout'),
    path('user/', views.UserTemplateView.as_view(), name='user'),

    path('user/profile-picture', views.update_profile_picture, name='profile_picture'),
]
