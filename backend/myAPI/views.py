from cgitb import lookup
from contextvars import Context
from datetime import datetime, timedelta
import json
import random
from os import stat
from .models import *
from .serializers import *
from django.http import Http404
from rest_framework.views import APIView
from django.db.models import Q
from rest_framework.response import Response
from rest_framework import status
from rest_framework import mixins
from rest_framework import generics
from rest_framework import viewsets
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.permissions import BasePermission, SAFE_METHODS
from django.shortcuts import get_object_or_404
from django.core.exceptions import ObjectDoesNotExist
from . import helper

from myAPI import serializers


def get_nutrient_keys():
    # reference to balance units
    dir = os.path.dirname(__file__)  # get current directory
    file_path = os.path.join(dir, 'Assets/gov_diet_recommendation_units.json')
    with open(file_path) as json_file:
        units = json.load(json_file)

    return_json = dict.fromkeys(units.keys(), decimal.Decimal(0))
    return return_json, units

# function to get a set of nutrient data for a single day


def userrecord_single(date_str, username, name):
    user_id = get_object_or_404(UserAccount, username=username).id
    date_obj = datetime.strptime(date_str, '%Y-%m-%d')
    subuser = get_object_or_404(Subuser, user=user_id, name=name)
    record_list = UserMealRecord.objects.filter(
        subuser=subuser, time__year=date_obj.year, time__month=date_obj.month, time__day=date_obj.day)

    return_json, units = get_nutrient_keys()

    # details of what food user had
    meal_content_list = UserMealRecordContent.objects.filter(
        parent_record__in=[record.id for record in record_list])

    for key in return_json.keys():
        for meal_content in meal_content_list:

            food_data = FoodData.objects.get(id=meal_content.food_data.id)

            nutrition_list = NutritionalData.objects.filter(
                parent_food=food_data.id, name=key)

            if len(nutrition_list) <= 0:
                continue
            #value * (meal_content.amount_in_grams / foodData['amount_in_grams'] ) * decimal.Decimal(_unit_converter(target_unit, from_unit))
            for nutrition_data in nutrition_list:
                if nutrition_data.name == key:
                    return_json[key] += decimal.Decimal(nutrition_data.value) * (meal_content.amount_in_grams /
                                                                                 food_data.amount_in_grams) * decimal.Decimal(helper.unit_converter(units[key], nutrition_data.unit))

    # details of what recipe user had
    recipe_content_list = UserMealRecipeContent.objects.filter(
        parent_record__in=[record.id for record in record_list])

    for recipe in recipe_content_list:
        return_json = recipe_nutrient(
            recipe_id=recipe.id, return_json=return_json)

    return_json['date'] = date_str
    return return_json


# function to get a set of nutrient data for a range of days
def userrecord_date_range(from_date, on_date, name, username):
    # https://stackoverflow.com/questions/16870663/how-do-i-validate-a-date-string-format-in-python
    try:
        start_date = datetime.strptime(from_date, '%Y-%m-%d')
    except ValueError:
        error = {"date format incorrect"}
        return {'error': error, 'status': 400}

    if on_date is not None:
        # https://stackoverflow.com/questions/16870663/how-do-i-validate-a-date-string-format-in-python
        try:
            target_date = datetime.strptime(on_date, '%Y-%m-%d')
        except ValueError:
            error = {"date format incorrect"}
            return {'error': error, 'status': 400}
    else:
        target_date = datetime.now()

    current_date = start_date
    date_container = []
    while current_date <= target_date:
        date_container.append(current_date.strftime('%Y-%m-%d'))
        current_date = current_date + timedelta(days=1)

    record_json_list = []

    for date in date_container:
        record_json_single = userrecord_single(
            date_str=date, username=username, name=name)
        record_json_list.append(record_json_single)

    # if empty after filter just return
    if len(record_json_list) <= 0:
        return record_json_list

    # the return data should be in the same format as usual return
    # but rather than array of object turn it into object of arrays
    data_json = record_json_list
    return_json = data_json.pop(0)

    # use the first entry and turn each value into array with that value only
    for key, value in return_json.items():
        return_json[key] = [value]

    # append the following data
    for data in data_json:
        for key, value in data.items():
            return_json[key].append(value)

    return return_json


def recipe_nutrient(recipe_id, return_json=None):
    recipe = get_object_or_404(Recipe, id=recipe_id)
    ingredients_list = RecipeIngredient.objects.filter(recipe=recipe)
    is_missing_value = False

    if return_json is None:
        return_json, units = get_nutrient_keys()
    else:
        _, units = get_nutrient_keys()

    for ingredient in ingredients_list:
        food_data_list = FoodData.objects.filter(id=ingredient.id)
        if food_data_list.length <= 0:
            is_missing_value = True
            continue
        food_data = food_data_list[0]
        nutrients_list = NutritionalData.objects.filter(
            parent_food__in=food_data)
        if ingredient.unit not in ['g', 'mg', 'microg']:
            is_missing_value = True
            continue
        for key in return_json.keys():
            for nutrient in nutrients_list:
                if nutrient.name == key:
                    if nutrient.name == 'energy_kj' and nutrient.unit != 'kj':
                        is_missing_value = True
                        continue
                    elif nutrient.name == 'energy_kcal' and nutrient.unit != 'kcal':
                        is_missing_value = True
                        continue
                    elif nutrient.unit not in ['g', 'mg', 'microg']:
                        is_missing_value = True
                        continue

                    return_json[key] += decimal.Decimal(nutrient.value) * \
                        (ingredient.quantity / food_data.amount_in_grams) * (helper.unit_converter(ingredient.unit, 'g')) * \
                        decimal.Decimal(helper.unit_converter(
                            units[key], nutrient.unit))

        return_json['is_missing_value'] = is_missing_value
        return return_json

# Create your views here.


"""
django rest framework simple jwt 
+ 
django rest frame work permissions
"""


class UserAccountPermission(BasePermission):
    message = 'Editing is for owner only'

    def has_object_permission(self, request, view, obj):
        print(obj.username)
        print(request.user.username)

        """
         useraccount attributes can be seen with such as GET
        """
        if request.method in SAFE_METHODS:
            return True

        """
        All other methods are for their owners, needs authentication
        if anonymous, there are nothing to authenticate so is false
        """
        if request.user.is_anonymous:
            return False

        """
        if authentication is passed through the user id of the db entry and the user id of the authentication token is compared
        """

        return obj.username == request.user.username


"""
django rest framework tutorials
"""


class UserAccountViewSet(viewsets.ModelViewSet):
    permission_classes = [UserAccountPermission]
    queryset = UserAccount.objects.all()
    serializer_class = UserAccountSerializer
    lookup_field = 'username'

    def retrieve(self, request, username):
        if request.user.is_authenticated:
            queryset = UserAccount.objects.all()
            userccount = get_object_or_404(queryset, username=username)
            serializer = UserAccountSerializer(userccount)
            return Response(serializer.data)
        content = {'requires log in to see'}
        return Response(content, status=status.HTTP_401_UNAUTHORIZED)

    def update(self, request, *args, **kwargs):
        if request.user.is_authenticated and request.user.username == kwargs['username']:
            queryset = UserAccount.objects.all()
            userccount = get_object_or_404(
                queryset, username=kwargs['username'])
            request.data['username'] = kwargs['username']
            serializer = UserAccountSerializer(userccount, data=request.data)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        content = {'requires log in to see'}
        return Response(content, status=status.HTTP_401_UNAUTHORIZED)

    def create(self, request):
        serializer = UserAccountSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    """
    def list(self, request):
        if request.user.is_authenticated:
            serializer = UserAccountSerializer(self.queryset.filter(username=request.user.username), many=True)
            return Response(serializer.data)
        content = {'requires log in to see'}
        return Response(content, status=status.HTTP_401_UNAUTHORIZED)

    
    def list(self, request):
        if request.user.is_authenticated:
            queryset = UserAccount.objects.all()
            serializer = UserAccountSerializer(queryset, many=True)
            return Response(serializer.data)
        content = {'requires authentication to see'}
        return Response(content, status=status.HTTP_401_UNAUTHORIZED)
    """


class UserMealRecordPermission(BasePermission):
    message = 'Editing and viewing is for owner only'

    def has_object_permission(self, request, view, obj):
        """
        All other methods are for their owners, needs authentication
        if anonymous, there are nothing to authenticate so is false
        """
        if request.method == 'POST' and not request.user.is_anonymous:
            return True

        """
        if authentication is passed through the user id of the db entry and the user id of the authentication token is compared
        obj.username returns the useraccount obj instance, therefore to match actual username string value it is obj.username.username
        """
        return obj.user.username == request.user.username


class UserRecordViewSet(viewsets.ModelViewSet):
    permission_classes = [UserMealRecordPermission]
    queryset = UserMealRecord.objects.all()
    #serializer_class = UserRecordSerializer

    """
    requires login to view data and shows the logged in user's only
    """

    def retrieve(self, request, *args, **kwargs):

        if request.user.is_authenticated and request.user.username == kwargs['username']:
            return_json = userrecord_single(
                kwargs['date'], kwargs['username'], kwargs['name'])
            if 'error' in return_json.keys():
                return Response(return_json['error'], status.HTTP_400_BAD_REQUEST)
            return Response(return_json)
        content = {'requires log in to see'}
        return Response(content, status=status.HTTP_401_UNAUTHORIZED)

    def list(self, request, *args, **kwargs):
        if request.user.is_authenticated:
            name = kwargs['name']
            from_date = kwargs['from']
            nutrition_type = request.query_params.get('nutrition', None)
            to_date = kwargs['date']

            # if date is specified, turn the data into array of data
            return_json = userrecord_date_range(
                from_date, to_date, name, request.user.username)
            if 'error' in return_json.keys():
                return Response(return_json['error'], status.HTTP_400_BAD_REQUEST)
            return Response(return_json)

        content = {'requires log in to see'}
        return Response(content, status=status.HTTP_401_UNAUTHORIZED)


class UserMealRecordViewSet(viewsets.ModelViewSet):
    permission_classes = [UserMealRecordPermission]
    queryset = UserMealRecord.objects.all()
    serializer_class = UserMealRecordSerializer

    def __food_data_helper(self, data):
        for index, meal_content in enumerate(data['meal_content']):
            food_data_obj = FoodData.objects.get(id=meal_content['food_data'])
            food_serializer = FoodDataSerializer(food_data_obj)
            food_data = food_serializer.data
            food_data.pop('nutrient_data')
            data['meal_content'][index]['food_data'] = food_data

        return data

    def retrieve(self, request, *args, **kwargs):
        user = get_object_or_404(
            UserAccount.objects.all(), username=kwargs['username'])
        subuser = get_object_or_404(
            Subuser.objects.all(), name=kwargs['name'], user=user.id)
        meal_record = get_object_or_404(
            UserMealRecord, id=kwargs['usermealrecord_id'])
        serializer = self.serializer_class(meal_record)

        return_data = self.__food_data_helper(serializer.data)

        return Response(return_data)

    def list(self, request, *args, **kwargs):
        user = get_object_or_404(
            UserAccount.objects.all(), username=kwargs['username'])
        subuser = get_object_or_404(
            Subuser.objects.all(), name=kwargs['name'], user=user.id)

        date = request.query_params.get('date', None)

        return_data = []
        if date is not None:
            try:
                date_obj = datetime.strptime(date, '%Y-%m-%d')
            except ValueError:
                error = {"date format incorrect"}
                return Response(error, status=status.HTTP_400_BAD_REQUEST)
            serializer = self.serializer_class(self.queryset.filter(
                subuser=subuser, time__year=date_obj.year, time__month=date_obj.month, time__day=date_obj.day).order_by('time'), many=True)

        else:
            serializer = self.serializer_class(
                self.queryset.filter(subuser=subuser), many=True)

        for data in serializer.data:
            return_data.append(self.__food_data_helper(data))

        return Response(return_data)

    def create(self, request, *args, **kwargs):

        isFoodDataCreationSuccess = self.__food_get_or_create(
            request, kwargs['username'])

        if not isFoodDataCreationSuccess:
            return Response("requires fooddata", status=status.HTTP_400_BAD_REQUEST)

        user = get_object_or_404(
            UserAccount.objects.all(), username=kwargs['username'])
        subuser = get_object_or_404(
            Subuser.objects.all(), name=kwargs['name'], user=user.id)
        request.data['subuser'] = subuser.id
        serializer = self.serializer_class(data=request.data)

        # rest is taken care of by serializer
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def update(self, request, *args, **kwargs):
        isFoodDataCreationSuccess = self.__food_get_or_create(
            request, kwargs['username'])

        if not isFoodDataCreationSuccess:
            return Response("requires fooddata", status=status.HTTP_400_BAD_REQUEST)

        meal_record = get_object_or_404(
            self.queryset, id=kwargs['usermealrecord_id'])
        print('hey', request.data)
        serializer = self.serializer_class(meal_record, data=request.data)

        # rest is taken care of by serializer
        if serializer.is_valid():

            serializer.save()
            print(serializer.data)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def destroy(self, request, usermealrecord_id, *args, **kwargs):
        meal_record = get_object_or_404(UserMealRecord, id=usermealrecord_id)
        meal_record.delete()
        return Response('{ success }', status=status.HTTP_200_OK)

    def __food_get_or_create(self, request, username):
        for meal_content in request.data['meal_content']:
            if not isinstance(meal_content['food_data'], int):
                if 'id' in meal_content['food_data'] and len(FoodData.objects.filter(id=meal_content['food_data']['id'])) > 0:
                    meal_content['food_data'] = meal_content['food_data']['id']
                    continue

                # if food data was sent instead of id, create it first
                food_data_json = meal_content.pop('food_data')
                user = None
                if 'uploader' in food_data_json:
                    uploader = food_data_json.pop('uploader')
                    if isinstance(uploader, int):
                        user = get_object_or_404(UserAccount, id=uploader)
                    elif isinstance(uploader, str):
                        user = get_object_or_404(
                            UserAccount, username=uploader)
                    else:
                        return False
                else:
                    user = get_object_or_404(UserAccount, username=username)

                food_data = FoodData.objects.create(
                    uploader=user, **food_data_json)
                meal_content['food_data'] = food_data.id
        return True


class SubuserPermission(BasePermission):
    message = 'editing is for owner only'
    print('yo')

    def has_view_permission(self, request, obj):
        if obj is None:
            return False
        return obj.user.username == request.user.username

    def has_object_permission(self, request, view, obj):
        """
        All other methods are for their owners, needs authentication
        if anonymous, there are nothing to authenticate so is false
        """

        if request.method == 'POST' and not request.user.is_anonymous:
            return True

        """
        if authentication is passed through the user id of the db entry and the user id of the authentication token is compared
        obj.user returns the useraccount obj instance, therefore to match actual username string value it is obj.username.username
        """
        print(obj.user.username == request.user.username)
        return obj.user.username == request.user.username


class SubuserViewSet(viewsets.ModelViewSet):
    permission_classes = [SubuserPermission]
    queryset = Subuser.objects.all()
    serializer_class = SubuserSerializer

    def create(self, request, *args, **kwargs):

        if request.user.is_authenticated and request.user.username == kwargs['username']:
            request.data['user'] = [request.user.id]
            serializer = SubuserSerializer(
                data=request.data, context={'request': request})

            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        message = {'requires log in'}
        return Response(message, status=status.HTTP_401_UNAUTHORIZED)

    def list(self, request, *args, **kwargs):

        if request.user.is_authenticated and request.user.username == kwargs['username']:
            serializer = SubuserSerializer(
                self.queryset.filter(user=request.user), many=True)
            subuser = self.queryset.get(
                user=request.user, name=kwargs['name'])
            serializer = SubuserSerializer(subuser)

            return Response(serializer.data)
        content = {'requires log in to see'}
        return Response(content, status=status.HTTP_401_UNAUTHORIZED)

    def retrieve(self, request, *args, **kwargs):
        if request.user.is_authenticated and request.user.username == kwargs['username']:

            subuser = self.queryset.get(
                user=request.user, name=kwargs['name'])
            serializer = SubuserSerializer(subuser)

            return Response(serializer.data)
        content = {'requires log in to see'}
        return Response(content, status=status.HTTP_401_UNAUTHORIZED)


class UserProfilePermission(BasePermission):
    message = 'editing is for owner only'

    def has_object_permission(self, request, view, obj):
        """
        All other methods are for their owners, needs authentication
        if anonymous, there are nothing to authenticate so is false
        """

        if request.method == 'POST' and not request.user.is_anonymous:
            return True

        """
        if authentication is passed through the user id of the db entry and the user id of the authentication token is compared
        obj.user returns the useraccount obj instance, therefore to match actual username string value it is obj.username.username
        """
        return obj.username == request.user.username


class UserProfileViewSet(viewsets.ModelViewSet):
    permission_classes = [UserProfilePermission]
    queryset = UserAccount.objects.all()
    serializer_class = UserProfileSerializer
    lookup_field = 'username'

    def retrieve(self, request, *args, **kwargs):
        if request.user.is_authenticated:
            serializer = UserProfileSerializer(
                self.queryset.get(username=request.user.username))
            return Response(serializer.data)
        content = {'requires log in to see'}
        return Response(content, status=status.HTTP_401_UNAUTHORIZED)

    def list(self, request, *args, **kwargs):
        if request.user.is_authenticated and request.user.username == kwargs['username']:
            serializer = UserProfileSerializer(self.queryset.filter(
                username=request.user.username), many=True)
            return Response(serializer.data)
        content = {'requires log in to see'}
        return Response(content, status=status.HTTP_401_UNAUTHORIZED)


class RecipeTitleViewSet(viewsets.ModelViewSet):
    queryset = Recipe.objects.all()
    serializer_class = RecipeTitleSerializer

    # https://docs.djangoproject.com/en/4.0/topics/db/queries/
    def list(self, request, *args, **kwargs):
        search_query = request.query_params.get('title', None)
        print(search_query)
        if search_query is None:
            serializer = self.serializer_class(self.queryset, many=True)
        else:
            serializer = self.serializer_class(
                self.queryset.filter(title__contains=search_query), many=True)
        return Response(serializer.data)


class RecipeViewSet(viewsets.ModelViewSet):
    queryset = Recipe.objects.all()
    serializer_class = RecipeSerializer
    parser_classes = [JSONParser, MultiPartParser, FormParser]

    def create(self, request, format=None, *args, **kwargs):
        print(request.data)
        serializer = RecipeSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def retrieve(self, request, *args, **kwargs):

        recipe = get_object_or_404(self.queryset, id=kwargs['recipe_id'])
        if recipe.is_hidden:
            return Response(status.HTTP_404_NOT_FOUND)
        if recipe.is_private:
            return Response(status.HTTP_401_UNAUTHORIZED)
        serializer = RecipeSerializer(recipe)
        return Response(serializer.data)

    # https://docs.djangoproject.com/en/4.0/topics/db/queries/
    def list(self, request, *args, **kwargs):
        search_query = request.query_params.get('title', None)

        if search_query is not None:
            query_together = Q()
            search_query_as_list = search_query.split(' ')
            for query in search_query_as_list:
                print(query)
                query_together |= Q(title__contains=query)

            recipe = self.queryset.filter(
                is_private=False, is_hidden=False) & self.queryset.filter(query_together)

        else:
            recipe = self.queryset.filter(is_private=False, is_hidden=False)
        serializer = RecipeSerializer(
            recipe.order_by('last_used')[:30], many=True)
        return Response(serializer.data)


# class RecipeNutrientViewSet(viewsets.ModelViewSet):
#     queryset = Recipe.objects.all()

#     def retrieve(self, request, *args, **kwargs):
#         # with django syntax the calculation across different models are bit tricky so raw sql is used
#         # sql injection should be considered when using raw, according to django documentation

#         sql = sql_sub_inner = '''
#                 (SELECT recipe.id, ingredient.id, ingredient.food_data_id, ingredient.ingredient_quantity, ingredient.ingredient_unit, food_data.id, food_data.amount_in_grams, nutrition.id, nutrition.value, nutrition.unit, nutrition.name,
#                 MAX(ingredient.ingredient_quantity / food_data.amount_in_grams *
#                 (CASE
#                 WHEN ingredient.ingredient_unit = 'g' THEN 1
#                 WHEN ingredient.ingredient_unit = 'mg' THEN 1/1000
#                 WHEN ingredient.ingredient_unit = 'microg' THEN 1/1000000
#                 ELSE 0
#                 END
#                 ) *
#                 nutrition.value)
#                 FROM myAPI_recipe AS recipe
#                 LEFT JOIN myAPI_recipeingredient AS ingredient
#                 ON recipe.id = ingredient.recipe_id
#                 LEFT JOIN myAPI_fooddata as food_data
#                 ON ingredient.food_data_id = food_data.id
#                 LEFT JOIN myAPI_nutritionaldata AS nutrition
#                 WHERE
#         '''
#         recipe_max_id = Recipe.objects.raw(sql)


class RecipeRecommendationViewSet(viewsets.ModelViewSet):
    queryset = Recipe.objects.all()
    serializer_class = RecipeSerializer

    def list(self, request, *args, **kwargs):
        # if user is not logged in recommendation cannot be given
        if not request.user.is_authenticated:
            content = {'requires log in to see'}
            return Response(content, status=status.HTTP_401_UNAUTHORIZED)

        # get the data for subuser logged in
        subuser_name = kwargs['name']
        subuser_obj = Subuser.objects.get(
            user=request.user, name=subuser_name)
        age = str(helper.age_map(subuser_obj.age))
        gender = helper.genderMap(subuser_obj.gender)

        if not gender == 'O':

            from_date = (datetime.now() - timedelta(days=6)
                         ).strftime('%Y-%m-%d')
            on_date = None
            record = userrecord_date_range(
                from_date=from_date, on_date=on_date, username=request.user.username, name=subuser_name)

            # reference to recommendation
            dir = os.path.dirname(__file__)  # get current directory
            file_path = os.path.join(
                dir, 'Assets/gov_diet_recommendation.json')
            with open(file_path) as json_file:
                gov_recommendation = json.load(json_file)

            record_avg_percent = []
            for key, value in record.items():
                if key == 'date' or key == 'salt' or key == 'free_sugars' or key == 'fat' or key == 'saturated_fat':
                    continue
                record_avg = sum(value) / len(value)
                record_avg_percent.append(
                    (key, decimal.Decimal(gov_recommendation[age][gender][key]) / record_avg) if record_avg > 0 else (key, 0))

            sorted_percent = sorted(
                record_avg_percent, key=lambda percent: percent[1])

            less_than = ['salt', 'free_sugars', 'fat', 'saturated_fat']
            sql_sub_inner = '''
                    (SELECT recipe.id, ingredient.id, ingredient.food_data_id, ingredient.ingredient_quantity, ingredient.ingredient_unit, food_data.id, food_data.amount_in_grams, nutrition.id, nutrition.value, nutrition.unit, nutrition.name, 
                    MAX(ingredient.ingredient_quantity / food_data.amount_in_grams * 
                    (CASE 
                    WHEN ingredient.ingredient_unit = 'g' THEN 1
                    WHEN ingredient.ingredient_unit = 'mg' THEN 1/1000
                    WHEN ingredient.ingredient_unit = 'microg' THEN 1/1000000
                    ELSE 0
                    END
                    ) *
                    nutrition.value)
                    FROM myAPI_recipe AS recipe 
                    LEFT JOIN myAPI_recipeingredient AS ingredient
                    ON recipe.id = ingredient.recipe_id
                    LEFT JOIN myAPI_fooddata as food_data
                    ON ingredient.food_data_id = food_data.id
                    LEFT JOIN myAPI_nutritionaldata AS nutrition
                    WHERE 
                    (nutrition.name = 'salt' AND nutrition.value <= {salt_value})  OR 
                    (nutrition.name = 'free_sugars' AND nutrition.value <= {sugar_value}) OR
                    (nutrition.name = 'fat' AND nutrition.value <= {fat_value}) OR
                    (nutrition.name = 'energy_kj' AND nutrition.value <= {energy_kj_value}) OR
                    (nutrition.name = 'energy_kcal' AND nutrition.value <= {energy_kcal_value}) OR
                    (nutrition.name = 'saturated_fat' AND nutrition.value <= {sat_fat_value})) 
            '''.format(
                salt_value=gov_recommendation[age][gender]['salt'],
                sugar_value=gov_recommendation[age][gender]['free_sugars'],
                fat_value=gov_recommendation[age][gender]['fat'],
                energy_kcal_value=gov_recommendation[age][gender]['energy_kcal'],
                energy_kj_value=gov_recommendation[age][gender]['energy_kj'],
                sat_fat_value=gov_recommendation[age][gender]['saturated_fat'],
            )

            recipe_recommended = []
            for element in random.shuffle(sorted_percent[:5])[:3]:
                print(element[0])
                recipe_max_id = Recipe.objects.raw(
                    '''
                    SELECT recipe_outer.id FROM
                    (SELECT recipe_inner.id, ingredient.id, ingredient.food_data_id, ingredient.ingredient_quantity, ingredient.ingredient_unit, food_data.id, food_data.amount_in_grams, nutrition.id, nutrition.value, nutrition.unit, nutrition.name, 
                    MAX(ingredient.ingredient_quantity / food_data.amount_in_grams * 
                    (CASE 
                    WHEN ingredient.ingredient_unit = 'g' THEN 1
                    WHEN ingredient.ingredient_unit = 'mg' THEN 1/1000
                    WHEN ingredient.ingredient_unit = 'microg' THEN 1/1000000
                    ELSE 0
                    END
                    ) *
                    nutrition.value)
                    FROM {sql_sub_inner} AS recipe_inner
                    LEFT JOIN myAPI_recipeingredient AS ingredient
                    ON recipe_inner.id = ingredient.recipe_id
                    LEFT JOIN myAPI_fooddata as food_data
                    ON ingredient.food_data_id = food_data.id
                    LEFT JOIN myAPI_nutritionaldata AS nutrition
                    WHERE nutrition.name = '{name}') AS recipe_outer
                    '''.format(sql_sub_inner=sql_sub_inner, name=element[0]))

                try:
                    recipe_max_nutrition_name = Recipe.objects.get(
                        id=recipe_max_id[0].id)
                    serializer = RecipeSerializer(
                        recipe_max_nutrition_name)
                    data = serializer.data
                    data['high_in'] = element[0]
                    recipe_recommended.append(data)
                except ObjectDoesNotExist:
                    pass

            return Response(recipe_recommended)

        return Response(status=status.HTTP_400_BAD_REQUEST)


class PersonalRecipeViewSet(viewsets.ModelViewSet):
    queryset = Recipe.objects.all()
    serializer_class = RecipeSerializer

    def list(self, request, *args, **kwargs):
        search_query = request.query_params.get('title', None)

        if request.user is not None and kwargs['username'] == request.user.username:
            recipe = self.queryset.filter(
                user=request.user, is_hidden=False)

            if search_query is not None:
                query_together = Q()
                search_query_clean = search_query.split(' ')
                for query in search_query_clean:
                    query_together |= Q(title__contains=query)

                recipe &= self.queryset.filter(query_together)

            serializer = RecipeSerializer(
                recipe.order_by('last_used')[:30], many=True)
            return Response(serializer.data)
        return Response(status=status.HTTP_401_UNAUTHORIZED)

    def destroy(self, request, *args, **kwargs):
        # due to possibilty of data being used in the past data is not completely deleted, only disallows future usage and deletes image, but data is still referenced in records
        recipe = get_object_or_404(
            self.queryset, owner=kwargs['username'], id=kwargs['myrecipe_id'])
        recipe.main_img.delete()
        recipe.is_hidden = True
        recipe.save()
        return Response(status=status.HTTP_200_OK)


class TagViewSet(viewsets.ModelViewSet):
    queryset = Tag.objects.all()
    serializer_class = TagSerializer


class RecipeStepViewSet(viewsets.ModelViewSet):
    queryset = RecipeStep.objects.all()
    serializer_class = RecipeStepSerializer


class CommentViewSet(viewsets.ModelViewSet):
    queryset = Comment.objects.all()
    serializer_class = CommentSerializer


class FoodDataViewSet(viewsets.ModelViewSet):
    queryset = FoodData.objects.all()
    serializer_class = FoodDataSerializer
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def retrieve(self, request, *args, **kwargs):
        food_data = get_object_or_404(self.queryset, id=kwargs['id'])
        if food_data.is_hidden:
            return Response(status.HTTP_404_NOT_FOUND)
        if food_data.is_private:
            return Response(status.HTTP_401_UNAUTHORIZED)
        serializer = FoodDataSerializer(food_data)
        return Response(serializer.data)

    def list(self, request, *args, **kwargs):
        search_query = request.query_params.get('name', None)

        # https://docs.djangoproject.com/en/4.0/ref/models/expressions/
        # https://stackoverflow.com/questions/4824759/django-query-using-contains-each-value-in-a-list
        if search_query is not None:
            query_together = Q()
            search_query_clean = search_query.split(' ')
            for query in search_query_clean:
                query_together |= Q(name__contains=query)

            food_data = self.queryset.filter(
                is_private=False, is_hidden=False) & self.queryset.filter(query_together)

        else:
            food_data = self.queryset.filter(
                is_private=False, is_hidden=False)
        serializer = SimpleFoodDataSerializer(
            food_data.order_by('last_used'), many=True)
        return Response(serializer.data)

    def create(self, request, *args, **kwargs):
        print(request.data)
        return super().create(request, *args, **kwargs)


class PersonalFoodDataViewSet(viewsets.ModelViewSet):
    queryset = FoodData.objects.all()
    serializer_class = FoodDataSerializer

    def list(self, request, *args, **kwargs):
        search_query = request.query_params.get('name', None)

        # https://docs.djangoproject.com/en/4.0/ref/models/expressions/
        # https://stackoverflow.com/questions/4824759/django-query-using-contains-each-value-in-a-list
        if search_query is not None:

            query_together = Q()
            search_query_clean = search_query.split(' ')
            for query in search_query_clean:
                query_together |= Q(name__contains=query)

            food_data = self.queryset.filter(
                uploader=kwargs['username'], is_hidden=False) & self.queryset.filter(query_together)

        else:

            food_data = self.queryset.filter(
                uploader=kwargs['username'], is_hidden=False)
        serializer = SimpleFoodDataSerializer(
            food_data.order_by('last_used'), many=True)
        return Response(serializer.data)

    def destroy(self, request, *args, **kwargs):
        # due to possibilty of data being used in the past data is not completely deleted, only disallows future usage and deletes image, but data is still referenced in records
        food_data = get_object_or_404(
            self.queryset, owner=kwargs['username'], id=kwargs['myfood_id'])
        food_data.main_img.delete()
        food_data.is_hidden = True
        food_data.save()
        return Response(status=status.HTTP_200_OK)


class NutritionalViewSet(viewsets.ModelViewSet):
    queryset = NutritionalData.objects.all()
    serializer_class = NutritionalData


class RecipeIngredientViewSet(viewsets.ModelViewSet):
    queryset = RecipeIngredient.objects.all()
    serializer_class = RecipeIngredientSerializer
