from rest_framework import serializers
from .models import Ingredients, Recipe, RecipeSteps, Tag, UserAccount, Comment

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

class UserAccountSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserAccount
        fields = ['user_ID', 'email']

class RecipeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Recipe
        fields = ['id', 'user_ID', 'title', 'main_image_url']

class RecipeStepSerializer(serializers.ModelSerializer):
    class Meta:
        model = RecipeSteps
        fields = ['id', 'recipe_ID', 'step_number', 'text']

class TagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tag
        fields = ['id', 'recipe_ID', 'text']

class CommentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Comment
        fields = ['id', 'user_ID', 'recipe_ID', 'text', 'date']

class IngredientsSerializer(serializers.ModelSerializer):
    class Meta:
        model = Ingredients
        fields = ['id', 'recipe_ID', 'ingredient_name', 'ingredient_quantity', 'ingredient_unit']