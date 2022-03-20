from rest_framework import serializers
from .models import Ingredient, Recipe, RecipeStep, Tag, UserData, UserRecord, UserAccount, Comment

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

class UserRecordsSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserRecord
        fields = [
            'username', 'name', 'date',
            'energy',

            # macro nutrients in grams
            'protein',
            'fat',
            'saturated_fat',
            'carbohydrate',
            'free_sugars',
            'salt',
            'dietry_fibre',

            # vitamins
            # micrograms
            'vitamin_a',
            'vitamin_b_12',
            'folate',
            'vitamin_d',
            # milligrams
            'thiamin',
            'riboflavin',
            'niacin_equivalent',
            'vitamin_b_6',
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
            if key not in ['username', 'date', 'name']:
                setattr(instance, key, value)
        instance.save()
        return instance

class UserDataSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserData
        fields = ['id', 'name', 'age', 'gender']

class UserProfileSerializer(serializers.ModelSerializer):
    people = UserDataSerializer(many=True)
    
    class Meta:
        model = UserAccount
        fields = ['id', 'username', 'email', 'people']

class RecipeTitleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Recipe
        fields = ['id', 'username', 'title', 'main_image_url']

class RecipeStepSerializer(serializers.ModelSerializer):
    class Meta:
        model = RecipeStep
        fields = ['id', 'recipe_ID', 'step_number', 'text']

class TagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tag
        fields = ['id', 'recipe', 'text']

""" 
https://www.django-rest-framework.org/api-guide/relations/

Use of relations of models to use nested json formats.
This serializer can read / write recipe with nested json with each step.
"""
class RecipeSerializer(serializers.ModelSerializer):
    class SimpleTagSerializer(serializers.ModelSerializer):
        class Meta:
            model = Tag
            fields = ['text']

    class SimpleStepSerializer(serializers.ModelSerializer):
        class Meta:
            model = RecipeStep

            # step numbers will be assigned automatically server-side as requiring it client side could mess up the unique constraint
            fields = ['text']

    steps = SimpleStepSerializer(many=True)
    tags = SimpleTagSerializer(many=True)

    class Meta:
        model = Recipe
        fields = ['id', 'username', 'title', 'main_image_url', 'tags', 'steps']

    def create(self, validated_data):
        tags_data = validated_data.pop('tags')
        steps_data = validated_data.pop('steps')
        recipe = Recipe.objects.create(**validated_data)

        for tag_data in tags_data:
            instance_list = Tag.objects.filter(text=tag_data.get('text'))
            if len(instance_list) == 0:
                recipe.tags.add(Tag.objects.create(**tag_data))
            else:
                recipe.tags.add(instance_list[0])
            
        for step_number, step_data in enumerate(steps_data):
            RecipeStep.objects.create(recipe_ID=recipe, step_number=step_number, **step_data)
        return recipe

class CommentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Comment
        fields = ['id', 'username', 'recipe_ID', 'text']

class IngredientSerializer(serializers.ModelSerializer):
    class Meta:
        model = Ingredient
        fields = ['id', 'recipe_ID', 'ingredient_name', 'ingredient_quantity', 'ingredient_unit']