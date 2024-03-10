"""URLs for the soninha app."""
from django.urls import path
from . import views

app_name = 'soninha'
urlpatterns = [
    path('login/', views.LoginView.as_view(), name='login'),
    path('logout/', views.LogoutView.as_view(), name='logout'),
    path('user/profile-picture', views.ProfilePictureView.as_view(), name='profile_picture'),
    path('user/display-name', views.DisplayNameView.as_view(), name='display_name'),
]
