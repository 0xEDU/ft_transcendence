"""
URL configuration for core project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""

# Our imports
from . import views

# Django's imports
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('', views.IndexView.as_view(), name='home'),
    path('admin/', admin.site.urls),
    path('auth/', include('soninha.urls')),
    path('i18n/', include('django.conf.urls.i18n')),
    path('pong/', include('pong.urls')),
    path('stats/', include('stats.urls')),
    path('blockchain/', include('blockchain.urls')),
	path('search-user/', views.SearchUserView.as_view(), name='search_user'),
	path('friends-list/', views.FriendListView.as_view(), name='friends-list'),
    path('create-friendship/', views.CreateFriendshipView.as_view(), name='create-friendship'),
    path('accept-friendship/', views.AcceptFriendshipView.as_view(), name='accept-friendship'),
]

# # Add the media URL pattern only during development
# if settings.DEBUG:
urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT) # this isn't ideal but oh well what can one do