from django.db import models
from django.conf import settings

class NewUsers(models.Model):
    name = models.CharField(max_length=100)
    username = models.CharField(max_length=100, unique=True)
    password = models.CharField(max_length=255)  

    def __str__(self):
        return self.username

class LoginUser(models.Model):
    user = models.CharField(max_length=100)  # Store username as a string
    refresh_token = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user} - {self.refresh_token}"
