from django.urls import path, include
from . import views

app_name = 'auth'

urlpatterns = [
    path('login/', views.LoginView.as_view(), name='login'),
    path('logout/', views.LogoutView.as_view(), name='logout'),
    path('user/', views.UserTemplateView.as_view(), name='user'),
    path('user_authenticated/', views.UserAuthenticatedView.as_view(), name='user_authenticated')
]
