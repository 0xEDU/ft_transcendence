from django.contrib import admin
from django.urls import path, include
from . import views

urlpatterns = [
    # path('', views.home, name='home'),
    path('', views.SPAView, name='home'),
    path('admin/', admin.site.urls),
    path('pong/', include('pong.urls')),
    path("i18n/", include("django.conf.urls.i18n")),
]
