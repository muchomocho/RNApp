from rest_framework import serializers
from .models import Ingredient, Recipe, RecipeStep, Tag, UserRecord, UserAccount, Comment

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

class RecipeSerializer(serializers.ModelSerializer):
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
        fields = ['id', 'recipe_ID', 'text']

class CommentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Comment
        fields = ['id', 'username', 'recipe_ID', 'text']

class IngredientSerializer(serializers.ModelSerializer):
    class Meta:
        model = Ingredient
        fields = ['id', 'recipe_ID', 'ingredient_name', 'ingredient_quantity', 'ingredient_unit']