from django.contrib import admin

from .models import NewUsers
from .models import LoginUser

admin.site.register(NewUsers)
admin.site.register(LoginUser)

# Register your models here.
