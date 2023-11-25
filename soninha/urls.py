from django.urls import path, include
from . import views

app_name = 'auth'

urlpatterns = [
    path('intra/', views.intra_view, name='intra'),
    path('login/', views.login_view, name='login'),
    path('logout/', views.logout_view, name='logout'),
    path('user/', views.LoggedUserView.as_view(), name='user')
]
