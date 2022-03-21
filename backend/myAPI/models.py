from django.utils import timezone
from django.db import models
from django.conf import settings
from django.contrib.auth.models import (
    BaseUserManager, AbstractBaseUser, PermissionsMixin
)
import datetime

# Create your models here.

"""
custom user manager required to create users
https://docs.djangoproject.com/en/4.0/topics/auth/customizing/
"""

class UserAccountManager(BaseUserManager):
    
    def create_user(self, username, email, password):
        email = self.normalize_email(email)
        user = self.model(username=username, email=email)
        user.set_password(password)
        user.save()
        return user
    
    def create_superuser(self, username, email, password):
        email = self.normalize_email(email)
        user = self.model(username=username, email=email)
        user.set_password(password)
        
        user.is_staff = True
        user.is_admin = True

        user.save()
        return user

"""
custom user 
https://docs.djangoproject.com/en/4.0/topics/auth/customizing/
django has 'users' for the system as a feature which has log in etc. 
other libraries such as authentication utilise this, therefore it is advantageeous to use this 
by extending abstract user, the custom user model can be used for authentication etc.
authentication is simple jwt, settings in settings and url
"""
class UserAccount(AbstractBaseUser, PermissionsMixin):
    # pk is default
    username = models.CharField(max_length=30, unique=True)
    email = models.EmailField(unique=True)
    password = models.CharField(max_length=255)
    date_created = models.DateTimeField(auto_now_add=True)

    is_active = models.BooleanField(default=True)
    is_admin = models.BooleanField(default=False)
    is_staff = models.BooleanField(default=False)

    objects = UserAccountManager()

    # field to be used as username for log in
    USERNAME_FIELD = 'username'
    # other fields that are required for creation
    REQUIRED_FIELDS = ['email']

    def __str__(self):
        return self.username
    
    # required to define permissions on user
    def has_perm(self, perm, obj=None):
        return self.is_admin
    
    def has_module_perms(self, app_label):
        return self.is_admin


class UserData(models.Model):
    # an account have multiple users, such as family members
    user = models.ForeignKey(settings.AUTH_USER_MODEL, related_name='people', on_delete=models.CASCADE)
    name = models.CharField(max_length=30)
    age = models.IntegerField()

    # https://docs.djangoproject.com/en/4.0/ref/models/fields/
    # 'Generally, it’s best to define choices inside a model class, 
    # and to define a suitably-named constant for each value:'
    # The gender choices are to reference the government recommended dietry values so recipe recommendation is done in reference to that
    MALE = 'M'
    FEMALE = 'F'
    OTHER = 'O'
    GENDER_CHOICES = [
        (MALE, 'Male'),
        (FEMALE, 'Female'),
        (OTHER, 'Other')
    ]
    gender = models.CharField(max_length=1, choices=GENDER_CHOICES)
    unique_together = ['user', 'name']

class UserRecord(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, to_field='username', db_column='username', on_delete=models.CASCADE)
    name = models.CharField(max_length=30)
    date = models.DateField(auto_now_add=True)

    # government dietry recommendations per day
    # https://assets.publishing.service.gov.uk/government/uploads/system/uploads/attachment_data/file/618167/government_dietary_recommendations.pdf
    # energy in kcal
    energy = models.DecimalField(default=0, max_digits=5, decimal_places=2)

    # macro nutrients in grams
    protein = models.DecimalField(default=0, max_digits=5, decimal_places=2)
    fat = models.DecimalField(default=0, max_digits=5, decimal_places=2)
    saturated_fat = models.DecimalField(default=0, max_digits=5, decimal_places=2)
    carbohydrate = models.DecimalField(default=0, max_digits=5, decimal_places=2)
    free_sugars = models.DecimalField(default=0, max_digits=5, decimal_places=2)
    salt = models.DecimalField(default=0, max_digits=5, decimal_places=2)
    dietry_fibre = models.DecimalField(default=0, max_digits=5, decimal_places=2)

    # vitamins
    # micrograms
    vitamin_a = models.DecimalField(default=0, max_digits=5, decimal_places=2)
    vitamin_b_12 = models.DecimalField(default=0, max_digits=5, decimal_places=2)
    folate = models.DecimalField(default=0, max_digits=5, decimal_places=2)
    vitamin_d = models.DecimalField(default=0, max_digits=5, decimal_places=2)
    # milligrams
    thiamin = models.DecimalField(default=0, max_digits=5, decimal_places=2)
    riboflavin = models.DecimalField(default=0, max_digits=5, decimal_places=2)
    niacin_equivalent = models.DecimalField(default=0, max_digits=5, decimal_places=2)
    vitamin_b_6 = models.DecimalField(default=0, max_digits=5, decimal_places=2)
    vitamin_c = models.DecimalField(default=0, max_digits=5, decimal_places=2)

    # minerals
    # milligrams
    iron = models.DecimalField(default=0, max_digits=5, decimal_places=2)
    calcium = models.DecimalField(default=0, max_digits=5, decimal_places=2)
    magnesium = models.DecimalField(default=0, max_digits=5, decimal_places=2)
    potassium = models.DecimalField(default=0, max_digits=5, decimal_places=2)
    zinc = models.DecimalField(default=0, max_digits=5, decimal_places=2)
    copper = models.DecimalField(default=0, max_digits=5, decimal_places=2)
    phosphorus = models.DecimalField(default=0, max_digits=5, decimal_places=2)
    chloride = models.DecimalField(default=0, max_digits=5, decimal_places=2)
    # micrograms
    iodine = models.DecimalField(default=0, max_digits=5, decimal_places=2)
    selenium = models.DecimalField(default=0, max_digits=5, decimal_places=2)
    # grams 
    sodium = models.DecimalField(default=0, max_digits=5, decimal_places=2)


class Recipe(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, to_field='username', db_column='username', on_delete=models.CASCADE)
    title = models.CharField(max_length=100)
    main_image_url = models.URLField()

    def __str__(self):
        return self.title

class RecipeStep(models.Model):
    recipe = models.ForeignKey(Recipe, related_name='steps', on_delete=models.CASCADE)
    step_number = models.IntegerField()
    text = models.CharField(max_length=255)

    class Meta:
        unique_together = ['recipe', 'step_number']

class Tag(models.Model):
    recipe = models.ManyToManyField(Recipe, related_name='tags')
    text = models.CharField(max_length=20)

class Comment(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, to_field='username', db_column='username', on_delete=models.CASCADE)
    recipe = models.ForeignKey(Recipe, on_delete=models.CASCADE)
    text = models.TextField(max_length=300)
    date_created = models.DateTimeField(default=timezone.now)

class Ingredient(models.Model):
    name = models.CharField(max_length=20, unique=True)
    # TODO - ingredient data

    def __str__(self):
        return self.name

class RecipeIngredient(models.Model):
    recipe = models.ForeignKey(Recipe, related_name='ingredients', on_delete=models.CASCADE)
    ingredient = models.ForeignKey(Ingredient, to_field='name', on_delete=models.CASCADE)
    ingredient_quantity = models.IntegerField()
    ingredient_unit = models.CharField(max_length=10)

