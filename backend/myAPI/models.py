from django.db import models

# Create your models here.

# the account data of the user
class UserAccount(models.Model):
    user_ID = models.CharField(max_length=30, primary_key=True)
    email = models.EmailField()

    def __str__(self):
        return self.user_ID

class UserData(models.Model):
    user_ID = models.ForeignKey(UserAccount, on_delete=models.CASCADE)
    name = models.CharField(max_length=30)

class Recipe(models.Model):
    user_ID = models.ForeignKey(UserAccount, on_delete=models.CASCADE)
    title = models.CharField(max_length=100)
    main_image_url = models.URLField()

    def __str__(self):
        return self.title

class RecipeSteps(models.Model):
    recipe_ID = models.ForeignKey(Recipe, on_delete=models.CASCADE)
    step_number = models.IntegerField()
    text = models.CharField(max_length=255)

class Tag(models.Model):
    recipe_ID = models.ForeignKey(Recipe, on_delete=models.CASCADE)
    text = models.CharField(max_length=20)

class Comment(models.Model):
    user_ID = models.ForeignKey(UserAccount, on_delete=models.CASCADE)
    recipe_ID = models.ForeignKey(Recipe, on_delete=models.CASCADE)
    text = models.TextField(max_length=300)
    date = models.DateField()

class Ingredients(models.Model):
    recipe_ID = models.ForeignKey(Recipe, on_delete=models.CASCADE)
    ingredient_name = models.CharField(max_length=20)
    ingredient_quantity = models.IntegerField()
    ingredient_unit = models.CharField(max_length=10)

