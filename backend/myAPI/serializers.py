from dataclasses import field
import decimal
from re import I
from tkinter.tix import Tree
import unicodedata
from wsgiref import validate
from django.shortcuts import get_object_or_404
from rest_framework import serializers
from .models import *
import json
import os
from . import helper

"""
https://www.django-rest-framework.org/api-guide/serializers/
"""


class UserAccountSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserAccount
        fields = ['id', 'username', 'email', 'password']
        # password cant be viewed with get request
        # commenetd out for development
        extra_kwargs = {'password': {'write_only': True}}

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


class SubuserSerializer(serializers.ModelSerializer):
    class Meta:
        model = Subuser
        fields = ['id', 'name', 'date_of_birth', 'gender']

    def create(self, validated_data):

        instance = self.Meta.model(**validated_data)
        instance.save()
        self.context['request'].user.people.add(instance)
        return instance

    # custom extra information to give age to client
    def to_representation(self, instance):
        data = super().to_representation(instance)
        data['age'] = helper.get_age_from_dob(instance.date_of_birth)
        return data


class UserProfileSerializer(serializers.ModelSerializer):
    people = SubuserSerializer(many=True)

    class Meta:
        model = UserAccount
        fields = ['id', 'username', 'email', 'people']


class NutritionalDataSerializer(serializers.ModelSerializer):
    class Meta:
        model = NutritionalData
        fields = ['id', 'name', 'value', 'unit']


class SimpleFoodDataSerializer(serializers.ModelSerializer):
    class Meta:
        model = FoodData
        fields = ['id', 'uploader', 'name', 'main_img']


class FoodDataSerializer(serializers.ModelSerializer):

    nutrient_data = NutritionalDataSerializer(many=True)

    class Meta:
        model = FoodData
        fields = [
            'id', 'main_img',
            'uploader',
            'is_private',
            'date_created',
            'last_used',
            'source_name',
            'name',
            'amount_in_grams',
            'nutrient_data', ]

    def create(self, validated_data):

        nutrient_data_list = validated_data.pop('nutrient_data')
        food_data = FoodData.objects.create(**validated_data)

        # reference to balance units
        dir = os.path.dirname(__file__)  # get current directory
        file_path = os.path.join(
            dir, 'Assets/gov_diet_recommendation_units.json')
        with open(file_path) as json_file:
            units = json.load(json_file)

        for nutrient_data in nutrient_data_list:
            if nutrient_data['name'] in units.keys():
                nutrient_data['value'] *= decimal.Decimal(helper.unit_converter(
                    target_unit=units[nutrient_data['name']], from_unit=nutrient_data['unit']))
                nutrient_data['unit'] = units[nutrient_data['name']]
            NutritionalData.objects.create(
                parent_food=food_data, **nutrient_data)

        return food_data

    def update(self, instance, validated_data):

        nutrient_data_list = validated_data.pop('nutrient_data')
        instance.nutrient_data.all().delete()
        instance.name = validated_data.pop('name')
        instance.amount_in_grams = validated_data.pop('amount_in_grams')
        instance.main_img.delete()
        instance.is_private = validated_data.pop('is_private')
        instance.main_img = validated_data.pop('main_img')

        # reference to balance units
        dir = os.path.dirname(__file__)  # get current directory
        file_path = os.path.join(
            dir, 'Assets/gov_diet_recommendation_units.json')
        with open(file_path) as json_file:
            units = json.load(json_file)

        for nutrient_data in nutrient_data_list:
            if nutrient_data['name'] in units.keys():
                nutrient_data['value'] *= decimal.Decimal(helper.unit_converter(
                    target_unit=units[nutrient_data['name']], from_unit=nutrient_data['unit']))
            NutritionalData.objects.create(
                parent_food=instance, **nutrient_data)

        instance.save()
        return instance


class UserMealContentSerializer(serializers.ModelSerializer):

    class Meta:
        model = UserMealRecordContent
        fields = '__all__'


class UserMealRecordSerializer(serializers.ModelSerializer):
    class SimpleUserMealContentSerializer(serializers.ModelSerializer):

        class Meta:
            model = UserMealRecordContent
            fields = ['id', 'food_data', 'amount_in_grams']

    meal_content = SimpleUserMealContentSerializer(many=True)

    class Meta:
        model = UserMealRecord
        fields = ['id', 'subuser', 'time', 'title', 'meal_content']

    def create(self, validated_data):

        meals_data = validated_data.pop('meal_content')
        if 'time' in validated_data:
            time = validated_data['time']

            try:
                time.strftime('%Y-%m-%d %H:%M:%S')
                meal_record = UserMealRecord.objects.create(**validated_data)
            except KeyError:
                meal_record = UserMealRecord.objects.create(
                    **validated_data, time=timezone.now().strftime('%Y-%m-%d %H:%M:%S'))
        else:
            meal_record = UserMealRecord.objects.create(
                **validated_data, time=timezone.now().strftime('%Y-%m-%d %H:%M:%S'))

        for meal_data in meals_data:

            food_data = meal_data.pop('food_data')
            food_instance = FoodData.objects.get(id=food_data.id)
            meal_content = UserMealRecordContent.objects.create(
                parent_record=meal_record, food_data=food_instance, **meal_data)
            food_instance.last_used = timezone.now()
            food_instance.save()

            meal_record.meal_content.add(meal_content)

        return meal_record

    def update(self, instance, validated_data):

        meals_data = validated_data.pop('meal_content')
        instance.meal_content.all().delete()

        for meal_data in meals_data:

            food_data = meal_data.pop('food_data')
            food_instance = FoodData.objects.get(id=food_data.id)
            meal_content = UserMealRecordContent.objects.create(
                parent_record=instance, food_data=food_instance, **meal_data)

            instance.meal_content.add(meal_content)

        instance.title = validated_data.pop('title')
        instance.time = validated_data.pop('time')
        instance.save()

        return instance


class RecipeTitleSerializer(serializers.ModelSerializer):
    class SimpleTagSerializer(serializers.ModelSerializer):
        class Meta:
            model = Tag
            fields = ['text']

    tags = SimpleTagSerializer(many=True)

    class Meta:
        model = Recipe
        fields = ['id', 'user', 'title', 'main_img', 'tags']


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
        fields = ['id', 'recipe', 'food_data',
                  'amount', 'unit']


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
       # food_data = FoodDataSerializer()

        class Meta:
            model = RecipeIngredient
            fields = ['food_data', 'amount', 'unit']

        def to_representation(self, instance):
            data = super().to_representation(instance)
            food_data = FoodDataSerializer(instance.food_data)
            data.pop('food_data')
            data['food_data'] = {
                'id': food_data.data['id'],
                'name': food_data.data['name'],
                'is_private': food_data.data['is_private']}

            return data

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
        fields = ['id', 'user', 'title', 'main_img',
                  'tags', 'ingredients', 'is_private', 'steps']
        #fields = '__all__'

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

        # recipe_nutrient_data = {}
        for ingredient_data in ingredients_data:
            food_data = ingredient_data.get('food_data')
            instance_list = FoodData.objects.filter(id=food_data.id)

            RecipeIngredient.objects.create(recipe=recipe, **ingredient_data)

        # RecipeNutritionalData.objects.create(recipe=recipe, )

        for step_number, step_data in enumerate(steps_data):
            RecipeStep.objects.create(recipe=recipe, **step_data)

        return recipe

    def update(self, instance, validated_data):
        tags_data = validated_data.pop('tags')
        ingredients_data = validated_data.pop('ingredients')
        steps_data = validated_data.pop('steps')

        if 'main_img' in validated_data:
            image = validated_data.pop('main_img')
            instance.main_img.delete()
            instance.main_img = image

        instance.tags.all().delete()
        for tag_data in tags_data:
            instance_list = Tag.objects.filter(text=tag_data.get('text'))
            if len(instance_list) == 0:
                instance.tags.add(Tag.objects.create(**tag_data))
            else:
                instance.tags.add(instance_list[0])

        instance.ingredients.all().delete()
        for ingredient_data in ingredients_data:
            ingeredient_id = ingredient_data.get('ingredient')
            instance_list = FoodData.objects.filter(id=ingeredient_id)
            RecipeIngredient.objects.create(recipe=instance, **ingredient_data)

        instance.steps.all().delete()
        for step_number, step_data in enumerate(steps_data):
            RecipeStep.objects.create(recipe=instance, **step_data)

        instance.save()
        return instance


class CommentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Comment
        fields = ['id', 'user', 'recipe', 'text']
