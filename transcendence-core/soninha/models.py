from django.db import models


# Create your models here.
class User(models.Model):
    login_intra = models.CharField(max_length=20)
    display_name = models.CharField(max_length=40)
    avatar_image_url = models.CharField(max_length=200)
