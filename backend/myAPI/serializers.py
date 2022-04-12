import decimal
import unicodedata
from wsgiref import validate
from rest_framework import serializers
from .models import *
import json
import os

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


class UserDataSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserData
        fields = '__all__'

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
        fields = '__all__'
        # fields = ['id', 'owner', 'owner_name']

    def create(self, validated_data):
        nutrient_data_list = validated_data.pop('nutrient_data')
        food_data = FoodData.objects.create(**validated_data)
        
        for nutrient_data in nutrient_data_list:
            NutritionalData.objects.create(parent_food=food_data, **nutrient_data)
        
        return food_data
        

class UserDayRecordSerializer(serializers.ModelSerializer):

    class SimpleRecipeRecordSerializer(serializers.ModelSerializer):
        class Meta:
            model = Recipe
            fields = ['id', 'title']

    class SimpleUserMealRecordSerializer(serializers.ModelSerializer):
        class Meta:
            model = UserMealRecord
            fields = ['id', 'time', 'title']

    # meal_record = SimpleUserMealRecordSerializer(many=True)
    class Meta:
        model = UserDayRecord
        
        fields = [
            'id', 'user', 'name', 'date',
            'energy_kcal', 'energy_kj',

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
        
    #fields = '__all__'

    def create(self, validated_data):
        instance = self.Meta.model(**validated_data)
        instance.save()
        return instance
    
    def update(self, instance, validated_data):
        for (key, value) in validated_data.items():
            if key not in ['user', 'date', 'name', 'meal_record'] and key in instance.keys():
                setattr(instance, key, value)
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
        fields = ['id', 'day_record', 'time', 'title', 'meal_content']
    
    def create(self, validated_data):

        meals_data = validated_data.pop('meal_content')
        if 'time' in validated_data:
            time = validated_data['time']
   
            try:
                time.strftime('%Y-%m-%d %H:%M:%S')
                meal_record = UserMealRecord.objects.create(**validated_data)
            except KeyError:
                meal_record = UserMealRecord.objects.create(**validated_data, time=timezone.now().strftime('%Y-%m-%d %H:%M:%S'))
        else:
            meal_record = UserMealRecord.objects.create(**validated_data, time=timezone.now().strftime('%Y-%m-%d %H:%M:%S'))

        for meal_data in meals_data:

            food_data = meal_data.pop('food_data')
            instance = FoodData.objects.get(id=food_data.id)
            meal_content = UserMealRecordContent.objects.create(parent_record=meal_record, food_data=instance, **meal_data)
            
            meal_record.meal_content.add(meal_content)

        print(validated_data['day_record'].id)
        user_day_record = UserDayRecord.objects.get(id=validated_data['day_record'].id)
        user_day_record.meal_record.add(meal_record)
        self.__record_update_helper(validated_data['day_record'].id)

        return meal_record
    

    def __record_update_helper(self, record_id):

        user_day_record = UserDayRecord.objects.get(id=record_id)
        #instance = UserDayRecordSerializer(user_day_record)
        meal_record_list = UserMealRecord.objects.filter(day_record=user_day_record)

        print('name', meal_record_list)

        # reference to balance units
        dir = os.path.dirname(__file__)  # get current directory
        file_path = os.path.join(dir, 'Assets/gov_diet_recommendation_units.json')
        with open(file_path) as json_file:
            units = json.load(json_file)

        def _unit_converter(target_unit, from_unit): 
            if target_unit.lower() == from_unit.lower():
                return 1
            def _unit_multiplier(unit):
                if unit == 'g':
                    return 1
                if unit == 'mg':
                    return decimal.Decimal(1000)
                if unit == 'microg':
                    return decimal.Decimal(1e+6)
                else: 
                    return False
  
            return _unit_multiplier(target_unit) / _unit_multiplier(from_unit)

        new_nutrition_data = {}
        for meal_record in meal_record_list:
            for meal_content in UserMealRecordContent.objects.filter(parent_record=meal_record):
                for nutrient_data in NutritionalData.objects.filter(parent_food=FoodData.objects.get(id=meal_content.food_data.id)):
                    name = nutrient_data.name
                    value = nutrient_data.value
                    from_unit = nutrient_data.unit
                    if name in units:
                        target_unit = units[name]
                        if name in new_nutrition_data:
                            new_nutrition_data[name] += value * (meal_content.amount_in_grams / 100 ) * decimal.Decimal(_unit_converter(target_unit, from_unit))
                        else:
                            new_nutrition_data[name] = value * (meal_content.amount_in_grams / 100 ) * decimal.Decimal(_unit_converter(target_unit, from_unit))     
        print('ay')
        print('r', user_day_record)

        for field in user_day_record._meta.get_fields():
            if field.name not in ['id', 'user', 'date', 'name', 'meal_record']:
                print('field', field.name)
                decimal.getcontext().prec = 9
                if field.name in new_nutrition_data:
                    print(decimal.Decimal(new_nutrition_data[field.name]))
                    setattr(user_day_record, field.name, decimal.Decimal(new_nutrition_data[field.name]))
                else:
                    setattr(user_day_record, field.name, decimal.Decimal())
        
        for field in user_day_record._meta.get_fields():
            print('f', field.name)
            print(getattr(user_day_record, field.name))

        class Test(serializers.ModelSerializer):
            class Meta:
                model = UserDayRecord
                fields = '__all__'   
        #print('data',Test(user_day_record).data)
        user_day_record.save()


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
            ingeredient_id = ingredient_data.get('ingredient')
            instance_list = FoodData.objects.filter(id=ingeredient_id)
            RecipeIngredient.objects.create(recipe=recipe, **ingredient_data)
            
        for step_number, step_data in enumerate(steps_data):
            RecipeStep.objects.create(recipe=recipe, **step_data)

        return recipe
    

class CommentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Comment
        fields = ['id', 'user', 'recipe', 'text']
