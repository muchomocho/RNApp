from django.contrib import admin

from myAPI.models import Recipe, UserAccount

# Register your models here.

admin.site.register(UserAccount)
admin.site.register(Recipe)