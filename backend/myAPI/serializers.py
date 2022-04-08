from rest_framework import serializers
from .models import FoodData, NutritionalData, RecipeIngredient, Recipe, RecipeStep, Tag, UserData, UserDayRecord, UserMealContent, UserMealRecord, UserAccount, Comment

'''
class UserAccountSerializer(serializers.Serializer):
    user_ID = serializers.CharField(max_length=30)
    email = serializers.EmailField()


    def create(self, validated_data):
        return UserAccount.objects.create(validated_data)

    
    def update(self, instance, validated_data):
        instance.user_ID = validated_data.get('title', instance.user_ID)
        instance.email = validated_data.get('email', instance.email)
'''


"""
https://www.django-rest-framework.org/api-guide/serializers/
"""
class UserAccountSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserAccount
        fields = ['id', 'username', 'email', 'password']
        # password cant be viewed with get request
        # commenetd out for development
        #extra_kwargs = {'password': {'write_only': True}}
    
    def create(self, validated_data):
        password = validated_data.pop('password', None)
        instance = self.Meta.model(**validated_data)
        if password is not None:
            instance.set_password(password)
        instance.save()
        return instance
    
    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)
        instance.username = validated_data.get('username', instance.username)
        instance.email = validated_data.get('email', instance.email)
        if password is not None:
            instance.set_password(password)
        instance.save()
        return instance

class UserDayRecordSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserDayRecord
        fields = [
            'user', 'name', 'date',
            'energy',

            # macro nutrients in grams
            'protein',
            'fat',
            'saturated_fat',
            'polyunsaturated_fat',
            'monounsaturated_fat',
            'carbohydrate',
            'free_sugars',
            'salt',
            'dietry_fibre',

            # vitamins
            # micrograms
            'vitamin_a',
            'vitamin_b12',
            'folate',
            'vitamin_d',
            # milligrams
            'thiamin',
            'riboflavin',
            'niacin_equivalent',
            'vitamin_b6',
            'vitamin_c',

            # minerals
            # milligrams
            'iron',
            'calcium',
            'magnesium',
            'potassium',
            'zinc',
            'copper',
            'phosphorus',
            'chloride',
            # micrograms
            'iodine',
            'selenium',
            # grams 
            'sodium',
        ]

    def create(self, validated_data):
        instance = self.Meta.model(**validated_data)
        instance.save()
        return instance
    
    def update(self, instance, validated_data):
        for (key, value) in validated_data.items():
            if key not in ['user', 'date', 'name']:
                setattr(instance, key, value)
        instance.save()
        return instance

class UserDataSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserData
        fields = ['id', 'name', 'age', 'gender']

    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        instance = self.Meta.model(**validated_data)
        instance.save()
        return instance

class UserProfileSerializer(serializers.ModelSerializer):
    people = UserDataSerializer(many=True)
    
    class Meta:
        model = UserAccount
        fields = ['id', 'username', 'email', 'people']

class NutritionalDataSerializer(serializers.ModelSerializer):
    class Meta:
        model = NutritionalData
        fields = ['id', 'name', 'value', 'unit']

class FoodDataSerializer(serializers.ModelSerializer):

    nutrient_data = NutritionalDataSerializer(many=True)

    class Meta:
        model = FoodData
        fields = ['id', 'name', 'nutrient_data']

class UserMealContentSerializer(serializers.ModelSerializer):
    class SimpleFoodDataSerializer(serializers.ModelSerializer):
        class Meta:
            model = FoodData
            fields = ['name']

    food_data = SimpleFoodDataSerializer(many=True)

    class Meta:
        model = UserMealContent
        fields = '__all__'

class UserMealRecordSerializer(serializers.ModelSerializer):
    meal_content = UserMealContentSerializer(many=True)

    class Meta:
        model = UserMealRecord
        fields = ['id', 'time', 'title', 'meal_content']

    
    def create(self, validated_data):

        validated_nutrient_data = validated_data.pop('nutrient_data')

        food = self.Meta.model.objects.create(**validated_data)

        for each_nutrient_data in validated_nutrient_data:
            print('yo')
            NutritionalData.objects.create(parent_food=food, **each_nutrient_data)

        return food


class RecipeTitleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Recipe
        fields = ['id', 'user', 'title', 'main_image_url']

class RecipeStepSerializer(serializers.ModelSerializer):
    class Meta:
        model = RecipeStep
        fields = ['id', 'recipe', 'step_number', 'text']

class TagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tag
        fields = ['id', 'recipe', 'text']

class RecipeIngredientSerializer(serializers.ModelSerializer):
    class Meta:
        model = RecipeIngredient
        fields = ['id', 'recipe', 'ingredient', 'ingredient_quantity', 'ingredient_unit']

""" 
https://www.django-rest-framework.org/api-guide/relations/

Use of relations of models to use nested json formats in POST, GET etc.
This serializer can read / write recipe with nested json with each step.
"""
class RecipeSerializer(serializers.ModelSerializer):
    class SimpleTagSerializer(serializers.ModelSerializer):
        class Meta:
            model = Tag
            fields = ['text']

    class SimpleRecipeIngredientSerializer(serializers.ModelSerializer):
        class Meta:
            model = RecipeIngredient
            fields = ['ingredient', 'ingredient_quantity', 'ingredient_unit']

    class SimpleStepSerializer(serializers.ModelSerializer):
        class Meta:
            model = RecipeStep

            # step numbers will be assigned automatically server-side as requiring it client side could mess up the unique constraint
            fields = ['step_number', 'text']

    ingredients = SimpleRecipeIngredientSerializer(many=True)
    steps = SimpleStepSerializer(many=True)
    tags = SimpleTagSerializer(many=True)

    class Meta:
        model = Recipe
        fields = ['id', 'user', 'title', 'main_image_url', 'tags', 'ingredients', 'steps']

    def create(self, validated_data):
        tags_data = validated_data.pop('tags')
        ingredients_data = validated_data.pop('ingredients')
        steps_data = validated_data.pop('steps')

        #validated_data['user'] = self.context['request'].user
        recipe = Recipe.objects.create(**validated_data)

        for tag_data in tags_data:
            instance_list = Tag.objects.filter(text=tag_data.get('text'))
            if len(instance_list) == 0:
                recipe.tags.add(Tag.objects.create(**tag_data))
            else:
                recipe.tags.add(instance_list[0])
        
        for ingredient_data in ingredients_data:
            ingredient_name = ingredient_data.get('ingredient')
            instance_list = FoodData.objects.filter(name=ingredient_name)
            if len(instance_list) == 0:
                FoodData.objects.create(name=ingredient_name)
            RecipeIngredient.objects.create(recipe=recipe, **ingredient_data)
            
        for step_number, step_data in enumerate(steps_data):
            RecipeStep.objects.create(recipe=recipe, step_number=step_number, **step_data)

        return recipe

class CommentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Comment
        fields = ['id', 'user', 'recipe', 'text']
