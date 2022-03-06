from django.db import models

# Create your models here.

# the account data of the user
class UserAccount(models.Model):
    # custom id registered by a user
    user_ID = models.CharField(max_length=30, primary_key=True)
    email = models.EmailField()
    password = models.CharField(max_length=255)

    def __str__(self):
        return self.user_ID

class UserData(models.Model):
    # an account have multiple users, such as family members
    user_ID = models.ForeignKey(UserAccount, on_delete=models.CASCADE)
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

class UserRecords(models.Model):
    user_ID = models.ForeignKey(UserAccount, on_delete=models.CASCADE)
    name = models.CharField(max_length=30)
    date = models.DateField()

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

