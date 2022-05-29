from django.utils import timezone
from django.db import models
from django.conf import settings
from django.contrib.auth.models import (
    BaseUserManager, AbstractBaseUser, PermissionsMixin
)
from datetime import datetime, timedelta
import decimal
from django.core.validators import RegexValidator, MinLengthValidator

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
        user.is_superuser = True

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
    username = models.CharField(max_length=30, unique=True, validators=[
        RegexValidator(regex='^[a-zA-Z0-9_]+$', message='Username must consist of alphanumeric or underscore',
                       code=None, inverse_match=None, flags=0),
        MinLengthValidator(limit_value=6, message='Username must be longer than 6 characters')])
    email = models.EmailField(unique=True)
    password = models.CharField(max_length=255, validators=[
        RegexValidator(regex='^[a-zA-Z0-9_@#!?&%$]+$', message='Password must consist of alphanumeric or the characters _@#!?&%$',
                       code=None, inverse_match=None, flags=0),
        MinLengthValidator(limit_value=6, message='Password must be longer than 6 characters')])
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

# sub accounts for users, if user wants to record data for family members etc


class Subuser(models.Model):
    # an account have multiple users, such as family members
    user = models.ManyToManyField(settings.AUTH_USER_MODEL,
                                  related_name='subuser'
                                  )
    recordable_user = models.ManyToManyField(settings.AUTH_USER_MODEL,
                                             related_name='recordable_subuser'
                                             )
    viewable_user = models.ManyToManyField(settings.AUTH_USER_MODEL,
                                           related_name='viewable_subuser'
                                           )
    name = models.CharField(max_length=30,
                            validators=[
                                RegexValidator(regex='^[a-zA-Z0-9][a-zA-Z0-9_\-, ]*$', message='Name must consist of alphanumeric, underscore or hyphen',
                                               code=None, inverse_match=None, flags=0), ])
    date_of_birth = models.DateField()

    icon_number = models.IntegerField(default=0)
    icon_background = models.IntegerField(default=0)

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


class UserShareRequest(models.Model):
    request_received_from = models.ForeignKey(
        settings.AUTH_USER_MODEL, to_field='username', related_name='request_received_from', on_delete=models.CASCADE)
    request_sent_to = models.ForeignKey(
        settings.AUTH_USER_MODEL, to_field='username', related_name='request_sent_to', on_delete=models.CASCADE)
    text = models.TextField(max_length=300, null=True)


class FoodData(models.Model):
    main_img = models.ImageField(upload_to='fooddata/', null=True)
    # is this data only for the creator to use
    is_private = models.BooleanField(default=True)
    # is this data hidden for use
    is_hidden = models.BooleanField(default=False)
    date_created = models.DateTimeField(default=timezone.now)
    last_used = models.DateTimeField(default=timezone.now)

    uploader = models.ForeignKey(settings.AUTH_USER_MODEL, to_field='username',
                                 db_column='username', on_delete=models.CASCADE, validators=[
                                     RegexValidator(regex='^[a-zA-Z0-9][a-zA-Z0-9_\- ]*$', message='Name must consist of alphanumeric, underscore or hyphen',
                                                    code=None, inverse_match=None, flags=0), ])
    # additional information for source if applicable
    source_name = models.CharField(max_length=255, null=True, validators=[
        RegexValidator(regex='^[a-zA-Z0-9][a-zA-Z0-9_\- ]*$', message='Name must consist of alphanumeric, underscore or hyphen',
                       code=None, inverse_match=None, flags=0), ])
    name = models.CharField(max_length=255, validators=[
        RegexValidator(regex='^[a-zA-Z0-9][a-zA-Z0-9_\-, ]*$', message='Name must consist of alphanumeric, underscore or hyphen',
                       code=None, inverse_match=None, flags=0), ])
    amount_in_grams = models.DecimalField(
        default=0, max_digits=20, decimal_places=10)

    def __str__(self):
        return self.name


# model for a recipe
class Recipe(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, to_field='username',
                             db_column='username', on_delete=models.CASCADE)
    title = models.CharField(max_length=100, validators=[
        RegexValidator(regex='^[a-zA-Z0-9][a-zA-Z0-9_\- ]*$', message='Name must consist of alphanumeric, underscore or hyphen',
                       code=None, inverse_match=None, flags=0), ])
    main_img = models.ImageField(upload_to='recipes/', null=True)
    date_created = models.DateTimeField(default=timezone.now)
    last_used = models.DateTimeField(default=timezone.now)
    # is the data only for the creator to use
    is_private = models.BooleanField(default=True)
    # is the data "deleted" (no new record entries can be made)
    is_hidden = models.BooleanField(default=False)

    def __str__(self):
        return self.title


class RecipeStep(models.Model):
    recipe = models.ForeignKey(
        Recipe, related_name='steps', on_delete=models.CASCADE)
    step_number = models.IntegerField()
    text = models.CharField(max_length=255)

    class Meta:
        unique_together = ['recipe', 'step_number']


class RecipeTag(models.Model):
    recipe = models.ManyToManyField(Recipe, related_name='tags')
    text = models.CharField(max_length=20, validators=[
        RegexValidator(regex='^[a-zA-Z0-9][a-zA-Z0-9_\- ]*$', message='Name must consist of alphanumeric, underscore or hyphen',
                       code=None, inverse_match=None, flags=0), ])


class RecipeComment(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, to_field='username',
                             db_column='username', on_delete=models.CASCADE)
    recipe = models.ForeignKey(
        Recipe, related_name='comment', on_delete=models.CASCADE)
    text = models.TextField(max_length=300)
    date_created = models.DateTimeField(default=timezone.now)


class RecipeIngredient(models.Model):
    recipe = models.ForeignKey(
        Recipe, related_name='ingredients', on_delete=models.CASCADE)
    food_data = models.ForeignKey(FoodData, on_delete=models.CASCADE)
    amount = models.DecimalField(
        default=0, max_digits=15, decimal_places=5)
    unit = models.CharField(max_length=10)


class RecipeRating(models.Model):
    recipe = models.ForeignKey(
        Recipe, related_name='ratings', on_delete=models.CASCADE)
    user = models.ForeignKey(UserAccount, to_field='username',
                             db_column='username', on_delete=models.CASCADE)
    score = models.IntegerField()


"""
The meal user has eaten. consists of multiple food data
"""


class UserMealRecord(models.Model):
    #day_record = models.ForeignKey(UserDayRecord, related_name='meal_record', on_delete=models.CASCADE)
    subuser = models.ForeignKey(
        Subuser, related_name='user_meal_record', on_delete=models.CASCADE)
    time = models.DateTimeField(default=timezone.now)
    title = models.CharField(max_length=255, validators=[
        RegexValidator(regex='^[a-zA-Z0-9][a-zA-Z0-9_\- ]+$', message='Name must consist of alphanumeric, underscore or hyphen',
                       code=None, inverse_match=None, flags=0), ])


class UserMealRecipeContent(models.Model):
    parent_record = models.ForeignKey(
        UserMealRecord, related_name='recipe_meal_content', on_delete=models.CASCADE)
    recipe = models.ForeignKey(Recipe, on_delete=models.CASCADE)


class UserMealRecordContent(models.Model):
    parent_record = models.ForeignKey(
        UserMealRecord, related_name='meal_content', on_delete=models.CASCADE)
    food_data = models.ForeignKey(
        FoodData, related_name='food_data', on_delete=models.CASCADE)
    amount_in_grams = models.DecimalField(max_digits=15, decimal_places=5)


class NutritionalData(models.Model):
    parent_food = models.ForeignKey(
        FoodData, related_name='nutrient_data', on_delete=models.CASCADE)
    name = models.CharField(max_length=255)
    value = models.DecimalField(default=0, max_digits=15, decimal_places=5)
    unit = models.CharField(max_length=10)
