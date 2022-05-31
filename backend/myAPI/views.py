from datetime import datetime, timedelta
import json
import random

from django.http import Http404
from .models import *
from .serializers import *
from django.db import transaction
from django.db.models import Avg, Q
from rest_framework.response import Response
from rest_framework import status
from rest_framework import viewsets
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.permissions import BasePermission, SAFE_METHODS
from django.shortcuts import get_object_or_404
from django.core.exceptions import ObjectDoesNotExist
from . import helper
import dotenv
from dotenv import load_dotenv, find_dotenv
load_dotenv(find_dotenv())


def get_nutrient_keys():
    # reference to balance units
    dir = os.path.dirname(__file__)  # get current directory
    file_path = os.path.join(dir, 'Assets/gov_diet_recommendation_units.json')
    with open(file_path) as json_file:
        units = json.load(json_file)

    return_json = dict.fromkeys(units.keys(), decimal.Decimal(0))
    return return_json, units

# function to get a set of nutrient data for a single day


def userrecord_single(date_str, username, subuser_id):
    user = get_object_or_404(UserAccount, username=username)
    date_obj = datetime.strptime(date_str, '%Y-%m-%d')
    subuser = get_subuser_allow_view(user=user, subuser_id=subuser_id)
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
            # value * (meal_content.amount_in_grams / foodData['amount_in_grams'] ) * decimal.Decimal(_unit_converter(target_unit, from_unit))
            for nutrition_data in nutrition_list:
                if nutrition_data.name == key:
                    return_json[key] += decimal.Decimal(nutrition_data.value) * (meal_content.amount_in_grams /
                                                                                 food_data.amount_in_grams) * decimal.Decimal(helper.unit_converter(units[key], nutrition_data.unit))

    # details of what recipe user had
    recipe_content_list = UserMealRecipeContent.objects.filter(
        parent_record__in=[record.id for record in record_list])

    for recipe_content in recipe_content_list:
        return_json = recipe_nutrient(
            recipe_id=recipe_content.recipe_id, return_json=return_json, user=user)

    return_json['date'] = date_str

    return return_json


# function to get a set of nutrient data for a range of days
def userrecord_date_range(from_date, on_date, subuser_id, username):
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
            date_str=date, username=username, subuser_id=subuser_id)
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
            if key in return_json.keys():
                return_json[key].append(value)

    return return_json


def recipe_nutrient(recipe_id, return_json=None, user=None):
    if user is None:
        recipe = get_object_or_404(
            Recipe, id=recipe_id, is_private=False, is_hidden=False)
    else:
        recipe = get_object_or_404(Recipe, id=recipe_id)

    ingredients_list = RecipeIngredient.objects.filter(recipe=recipe)

    is_missing_value = False

    if return_json is None:
        return_json, units = get_nutrient_keys()
    else:
        _, units = get_nutrient_keys()

    for ingredient in ingredients_list:
        food_data_list = FoodData.objects.filter(id=ingredient.food_data.id)
        if len(food_data_list) <= 0:
            is_missing_value = True
            continue
        food_data = food_data_list[0]

        nutrients_list = NutritionalData.objects.filter(
            parent_food=food_data)

        if ingredient.unit not in ['g', 'mg', 'microg']:
            is_missing_value = True
            continue
        for key in return_json.keys():
            for nutrient in nutrients_list:
                if nutrient.name == key:
                    if nutrient.name == 'energy_kj' and nutrient.unit.lower() != 'kj'.lower():

                        is_missing_value = True
                        continue
                    elif nutrient.name == 'energy_kcal' and nutrient.unit.lower() != 'kcal'.lower():

                        is_missing_value = True
                        continue
                    elif nutrient.name.lower() not in [name.lower() for name in ['energy_kj', 'energy_kcal']] and nutrient.unit.lower() not in [unit.lower() for unit in ['g', 'mg', 'microg']]:

                        is_missing_value = True
                        continue

                    return_json[key] += decimal.Decimal(nutrient.value) * \
                        (ingredient.amount / food_data.amount_in_grams) * (helper.unit_converter('g', ingredient.unit)) * \
                        decimal.Decimal(helper.unit_converter(
                            units[key], nutrient.unit))

    return_json['is_missing_value'] = is_missing_value

    return return_json


def get_subuser_allow_view(user, subuser_id):
    if len(user.subuser.all().filter(id=subuser_id)) == 0 and \
            len(user.recordable_subuser.filter(id=subuser_id)) == 0 and \
            len(user.viewable_subuser.filter(id=subuser_id)) == 0:
        return False

    subuser = get_object_or_404(Subuser, id=subuser_id)
    return subuser


def get_subuser_allow_record(user, subuser_id):
    if len(user.subuser.all().filter(id=subuser_id)) == 0 and \
            len(user.recordable_subuser.filter(id=subuser_id)) == 0:
        return False

    subuser = get_object_or_404(Subuser, id=subuser_id)
    return subuser


def get_subuser_allow_all(user, subuser_id):
    if len(user.subuser.all().filter(id=subuser_id)) == 0:
        return False

    subuser = get_object_or_404(Subuser, id=subuser_id)
    return subuser


def verify_secret_header(func):
    APP_SERVER_KEY = os.environ['RNAPP_DJANGO_SERVER_KEY']

    def inner(self, request, *args, **kwargs):
        if 'app-server-key' not in request.headers or request.headers['app-server-key'] != APP_SERVER_KEY:
            return Response('key is required', status=status.HTTP_400_BAD_REQUEST)

        return func(self, request, *args, **kwargs)

    return inner


# Create your views here.
"""
django rest framework simple jwt
+
django rest frame work permissions
"""


class UserAccountPermission(BasePermission):
    message = 'Editing is for owner only'

    def has_object_permission(self, request, view, obj):
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

    @verify_secret_header
    def retrieve(self, request, username):
        if request.user.is_authenticated:
            queryset = UserAccount.objects.all()
            userccount = get_object_or_404(queryset, username=username)
            serializer = UserAccountSerializer(userccount)
            return Response(serializer.data)
        content = {'requires log in to see'}
        return Response(content, status=status.HTTP_401_UNAUTHORIZED)

    @verify_secret_header
    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)

    @verify_secret_header
    @transaction.atomic()
    def update(self, request, *args, **kwargs):

        if request.user.is_authenticated and request.user.username == kwargs['username']:
            queryset = UserAccount.objects.all()

            if not self.queryset.filter(username=kwargs['username']).exists():
                return Response('does not exist', status=status.HTTP_404_NOT_FOUND)
            userccount = self.queryset.select_for_update().get(
                username=kwargs['username'])
            request.data['username'] = kwargs['username']
            serializer = UserAccountSerializer(userccount, data=request.data)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data, status=status.HTTP_200_OK)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        content = {'requires log in to see'}
        return Response(content, status=status.HTTP_401_UNAUTHORIZED)

    @verify_secret_header
    def create(self, request):
        serializer = UserAccountSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


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
    # serializer_class = UserRecordSerializer

    """
    requires login to view data and shows the logged in user's only
    """

    @verify_secret_header
    def retrieve(self, request, *args, **kwargs):
        # check user is authenticated
        if not request.user.is_authenticated or request.user.username != kwargs['username']:
            content = {'requires log in to see'}
            return Response(content, status=status.HTTP_401_UNAUTHORIZED)

        subuser = get_subuser_allow_view(
            user=request.user, subuser_id=kwargs['subuser_id'])
        # check the account has privilage to view this account
        if not subuser:
            return Response('this data cannot be viewed on this account.', status=status.HTTP_401_UNAUTHORIZED)

        return_json = userrecord_single(
            kwargs['date'], kwargs['username'], kwargs['subuser_id'])
        if 'error' in return_json.keys():
            return Response(return_json['error'], status.HTTP_400_BAD_REQUEST)
        return Response(return_json)

    @verify_secret_header
    def list(self, request, *args, **kwargs):
       # check user is authenticated
        if not request.user.is_authenticated or request.user.username != kwargs['username']:
            content = {'requires log in to see'}
            return Response(content, status=status.HTTP_401_UNAUTHORIZED)

        subuser = get_subuser_allow_view(
            user=request.user, subuser_id=kwargs['subuser_id'])
        # check the account has privilage to view this account
        if not subuser:
            return Response('this data cannot be viewed on this account.', status=status.HTTP_401_UNAUTHORIZED)

        from_date = kwargs['from']
        nutrition_type = request.query_params.get('nutrition', None)
        to_date = kwargs['date']

        # if date is specified, turn the data into array of data
        return_json = userrecord_date_range(
            from_date, to_date, kwargs['subuser_id'], request.user.username)
        if 'error' in return_json.keys():
            return Response(return_json['error'], status.HTTP_400_BAD_REQUEST)
        return Response(return_json)


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

    @verify_secret_header
    def retrieve(self, request, *args, **kwargs):
        # check user is authenticated
        if not request.user.is_authenticated or request.user.username != kwargs['username']:
            return Response({'requires log in to see'}, status=status.HTTP_401_UNAUTHORIZED)

        subuser = get_subuser_allow_view(
            user=request.user, subuser_id=kwargs['subuser_id'])
        # check the account has privilage to view this account
        if not subuser:
            return Response('this data cannot be viewed on this account.', status=status.HTTP_401_UNAUTHORIZED)

        user = get_object_or_404(
            UserAccount.objects.all(), username=kwargs['username'])

        meal_record = get_object_or_404(
            UserMealRecord, id=kwargs['usermealrecord_id'])
        serializer = self.serializer_class(meal_record)

        return_data = self.__food_data_helper(serializer.data)

        return Response(return_data)

    @verify_secret_header
    def list(self, request, *args, **kwargs):
        # check user is authenticated
        if not request.user.is_authenticated or request.user.username != kwargs['username']:
            return Response({'requires log in to see'}, status=status.HTTP_401_UNAUTHORIZED)

        subuser = get_subuser_allow_view(
            user=request.user, subuser_id=kwargs['subuser_id'])
        # check the account has privilage to view this account
        if not subuser:
            return Response('this data cannot be viewed on this account.', status=status.HTTP_401_UNAUTHORIZED)

        user = get_object_or_404(
            UserAccount.objects.all(), username=kwargs['username'])

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

    @verify_secret_header
    def create(self, request, *args, **kwargs):
        # check user is authenticated
        if not request.user.is_authenticated or request.user.username != kwargs['username']:
            return Response({'requires log in to see'}, status=status.HTTP_401_UNAUTHORIZED)

        subuser = get_subuser_allow_record(
            user=request.user, subuser_id=kwargs['subuser_id'])
        # check the account has privilage to view this account
        if not subuser:
            return Response('this data cannot be viewed on this account.', status=status.HTTP_401_UNAUTHORIZED)

        isFoodDataCreationSuccess = self.__food_get_or_create(
            request, kwargs['username'])

        if not isFoodDataCreationSuccess:
            return Response("requires fooddata", status=status.HTTP_400_BAD_REQUEST)

        if len(request.data['meal_content']) == 0 and len(request.data['recipe_meal_content']) == 0:
            return Response("requires at least some food or recipe data", status=status.HTTP_400_BAD_REQUEST)

        request.data['subuser'] = subuser.id
        serializer = self.serializer_class(data=request.data)

        # rest is taken care of by serializer
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @verify_secret_header
    @transaction.atomic()
    def update(self, request, *args, **kwargs):
        # check user is authenticated
        if not request.user.is_authenticated or request.user.username != kwargs['username']:
            return Response({'requires log in to see'}, status=status.HTTP_401_UNAUTHORIZED)

        isFoodDataCreationSuccess = self.__food_get_or_create(
            request, kwargs['username'])

        if not isFoodDataCreationSuccess:
            return Response("requires fooddata", status=status.HTTP_400_BAD_REQUEST)

        if not self.queryset.filter(id=kwargs['usermealrecord_id']).exists():
            return Response('does not exist', status=status.HTTP_404_NOT_FOUND)
        meal_record = self.queryset.select_for_update().get(
            id=kwargs['usermealrecord_id'])

        subuser = get_subuser_allow_record(
            user=request.user, subuser_id=kwargs['subuser_id'])
        # check the account has privilage to view this account
        if not subuser or meal_record.subuser.id != subuser.id:
            return Response('this data cannot be viewed on this account.', status=status.HTTP_401_UNAUTHORIZED)

        serializer = self.serializer_class(meal_record, data=request.data)

        # rest is taken care of by serializer
        if serializer.is_valid():

            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @verify_secret_header
    def destroy(self, request, usermealrecord_id, *args, **kwargs):
        # check user is authenticated
        if not request.user.is_authenticated or request.user.username != kwargs['username']:
            return Response({'requires log in to see'}, status=status.HTTP_401_UNAUTHORIZED)

        subuser = get_subuser_allow_all(
            user=request.user, subuser_id=kwargs['subuser_id'])
        # check the account has privilage to view this account
        if not subuser:
            return Response('this data cannot be viewed on this account.', status=status.HTTP_401_UNAUTHORIZED)

        meal_record = get_object_or_404(
            UserMealRecord, id=usermealrecord_id)

        if meal_record.subuser.id != subuser.id:
            return Response({'only owner can delete', status.HTTP_401_UNAUTHORIZED})

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

        return obj.user.username == request.user.username


class SubuserViewSet(viewsets.ModelViewSet):
    # permission_classes = [SubuserPermission]
    queryset = Subuser.objects.all()
    serializer_class = SubuserSerializer

    @verify_secret_header
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

    @verify_secret_header
    @transaction.atomic()
    def update(self, request, *args, **kwargs):
        if request.user.is_authenticated and request.user.username == kwargs['username']:
            if not self.queryset.filter(id=kwargs['subuser_id']).exists():
                return Response('does not exist', status=status.HTTP_404_NOT_FOUND)
            subuser = self.queryset.select_for_update().get(
                id=kwargs['subuser_id'])
            serializer = SubuserSerializer(subuser,
                                           data=request.data, context={'request': request})

            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data, status=status.HTTP_200_OK)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        message = {'requires log in'}
        return Response(message, status=status.HTTP_401_UNAUTHORIZED)

    @verify_secret_header
    def list(self, request, *args, **kwargs):
        if request.user.is_authenticated and request.user.username == kwargs['username']:
            subusers = self.queryset.filter(user=request.user) |\
                request.user.recordable_subuser.all() |\
                request.user.viewable_subuser.all()

            serializer = SubuserSerializer(subusers, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        content = {'requires log in to see'}
        return Response(content, status=status.HTTP_401_UNAUTHORIZED)

    @verify_secret_header
    def retrieve(self, request, *args, **kwargs):
        if request.user.is_authenticated and request.user.username == kwargs['username']:

            subuser = get_subuser_allow_view(
                user=request.user, subuser_id=kwargs['subuser_id'])
            serializer = SubuserSerializer(subuser)

            return Response(serializer.data, status=status.HTTP_200_OK)
        content = {'requires log in to see'}
        return Response(content, status=status.HTTP_401_UNAUTHORIZED)

    @verify_secret_header
    def destroy(self, request, *args, **kwargs):
        if not request.user.is_authenticated \
                or request.user.username != kwargs['username']:
            return Response('requires log in', status=status.HTTP_401_UNAUTHORIZED)

        subuser = get_subuser_allow_all(
            user=request.user, subuser_id=kwargs['subuser_id'])

        if not subuser:
            return Response('you are not allowed to delete this subuser', status=status.HTTP_401_UNAUTHORIZED)

        subuser.delete()
        return Response('subuser deleted', status=status.HTTP_200_OK)


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

    @verify_secret_header
    def retrieve(self, request, *args, **kwargs):
        if request.user.is_authenticated and request.user.username == kwargs['username']:
            serializer = UserProfileSerializer(request.user)
            return Response(serializer.data, status=status.HTTP_200_OK)
        content = {'requires log in to see'}
        return Response(content, status=status.HTTP_401_UNAUTHORIZED)


class RecipeTitleViewSet(viewsets.ModelViewSet):
    queryset = Recipe.objects.all()
    serializer_class = RecipeTitleSerializer

    # https://docs.djangoproject.com/en/4.0/topics/db/queries/
    @verify_secret_header
    def list(self, request, *args, **kwargs):
        search_query = request.query_params.get('title', None)

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

    @verify_secret_header
    def create(self, request, format=None, *args, **kwargs):

        serializer = RecipeSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @verify_secret_header
    def retrieve(self, request, *args, **kwargs):

        recipe = get_object_or_404(self.queryset, id=kwargs['recipe_id'])

        if recipe.is_hidden:
            return Response(status=status.HTTP_404_NOT_FOUND)
        if recipe.is_private and (request.user.is_authenticated and request.user != recipe.user):
            return Response(status=status.HTTP_401_UNAUTHORIZED)
        serializer = RecipeSerializer(recipe)

        return Response(serializer.data)

    # https://docs.djangoproject.com/en/4.0/topics/db/queries/
    @verify_secret_header
    def list(self, request, *args, **kwargs):
        search_query = request.query_params.get('title', None)

        if search_query is not None:
            query_together = Q()
            search_query_as_list = search_query.split(' ')
            for query in search_query_as_list:
                query_together |= Q(title__icontains=query) | Q(
                    tags__text__icontains=query)

            recipe = self.queryset.filter(
                is_private=False, is_hidden=False) & self.queryset.filter(query_together)

        else:
            recipe = self.queryset.filter(is_private=False, is_hidden=False)

        serializer = RecipeTitleSerializer(
            recipe.extra(select={'length': 'Length(title)'}).order_by('-last_used')[:30], many=True)

        return Response(serializer.data)

    @verify_secret_header
    @transaction.atomic()
    def update(self, request, *args, **kwargs):
        if request.user.is_authenticated:
            if not self.queryset.filter(id=kwargs['recipe_id']).exists():
                return Response('does not exist', status=status.HTTP_404_NOT_FOUND)
            recipe = self.queryset.select_for_update().get(
                id=kwargs['recipe_id'])
            if recipe.user != request.user:
                return Response({'editing is for owner only'}, status=status.HTTP_401_UNAUTHORIZED)

            serializer = self.serializer_class(recipe, data=request.data)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        content = {'requires log in to see'}
        return Response(content, status=status.HTTP_401_UNAUTHORIZED)

    @verify_secret_header
    def destroy(self, request, *args, **kwargs):
        return super().destroy(request, *args, **kwargs)


class RecipeNutrientViewSet(viewsets.ModelViewSet):
    queryset = Recipe.objects.all()
    serializer_class = RecipeSerializer

    @verify_secret_header
    def retrieve(self, request, *args, **kwargs):
        return Response(recipe_nutrient(recipe_id=kwargs['recipe_id'], user=request.user))


class RecipeTagViewSet(viewsets.ModelViewSet):
    queryset = RecipeTag.objects.all()
    serializer_class = RecipeTagSerializer


class RecipeIngredientViewSet(viewsets.ModelViewSet):
    queryset = RecipeIngredient.objects.all()
    serializer_class = RecipeIngredientSerializer


class RecipeRatingViewSet(viewsets.ModelViewSet):
    queryset = RecipeRating.objects.all()
    serializer_class = RecipeRatingSerializer

    @verify_secret_header
    def create(self, request, *args, **kwargs):
        if not request.user.is_authenticated:
            return Response('need login')

        recipe = get_object_or_404(Recipe, id=kwargs['recipe_id'])
        if RecipeRating.objects.filter(user=request.user).exists():
            recipe.ratings.filter(user=request.user).delete()
        serializer = self.serializer_class(data=request.data)

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @verify_secret_header
    def retrieve(self, request, *args, **kwargs):
        recipe = get_object_or_404(Recipe, id=kwargs['recipe_id'])
        rating = recipe.ratings.all().aggregate(Avg('score'))
        if rating is None:
            rating = 0
        rating['score__avg'] = round(rating['score__avg'], 2)

        return Response(rating, status=status.HTTP_200_OK)


class RecipeRecommendationViewSet(viewsets.ModelViewSet):
    queryset = Recipe.objects.all()
    serializer_class = RecipeSerializer

    @verify_secret_header
    def list(self, request, *args, **kwargs):
        # if user is not logged in recommendation cannot be given
        if not request.user.is_authenticated:
            content = {'requires log in to see'}
            return Response(content, status=status.HTTP_401_UNAUTHORIZED)

        # get the data for subuser logged in
        subuser = get_subuser_allow_view(
            user=request.user, subuser_id=kwargs['subuser_id'])
        if not subuser:
            return Response('this useraccount cannot view this subuser', status=status.HTTP_401_UNAUTHORIZED)

        age = str(helper.age_map(
            helper.get_age_from_dob(subuser.date_of_birth)))
        gender = helper.genderMap(subuser.gender)

        if gender == 'O' or gender == 'other':
            return Response([])

        from_date = (datetime.now() - timedelta(days=6)
                     ).strftime('%Y-%m-%d')
        on_date = None
        record = userrecord_date_range(
            from_date=from_date, on_date=on_date, username=request.user.username, subuser_id=subuser.id)

        # reference to recommendation
        dir = os.path.dirname(__file__)  # get current directory
        file_path = os.path.join(
            dir, 'Assets/gov_diet_recommendation.json')
        with open(file_path) as json_file:
            gov_recommendation = json.load(json_file)

        record_avg_percent = []
        for key, value in record.items():
            if key == 'date' or key == 'salt' or key == 'energy_kcal' or key == 'energy_kj' or key == 'free_sugars' or key == 'fat' or key == 'saturated_fat':
                continue
            record_avg = sum(value) / len(value)
            record_avg_percent.append(
                (key, decimal.Decimal(gov_recommendation[age][gender][key]) / record_avg) if record_avg > 0 else (key, 0))

        sorted_percent = sorted(
            record_avg_percent, key=lambda percent: percent[1])

        sql_sub_inner2 = '''
                SELECT
                recipe_inner_wrapper.recipe_id_inner,
                recipe_inner_wrapper.recipe_title_inner,
                recipe_inner_wrapper.nut_name_inner,
                recipe_inner_wrapper.total_inner
                FROM
                (
                SELECT
                recipe_inner.recipe_id_inner,
                recipe_inner.recipe_title_inner,
                recipe_inner.nut_name_inner,
                SUM(recipe_inner.real_nut_val) AS total_inner
                FROM
                (
                SELECT 
                recipe_inner.id as recipe_id_inner, 
                recipe_inner.title as recipe_title_inner,
                recipe_inner.is_private as recipe_private_inner, 
                recipe_inner.is_hidden as recipe_hidden_inner, 
                recipe_inner.username as recipe_username_inner,
                ingredient_inner.id as ingredient_id_inner, 
                ingredient_inner.food_data_id as ingredient_food_inner, 
                ingredient_inner.amount as ingredient_amount_inner, 
                ingredient_inner.unit as ingredient_unit_inner, 
                food_data_inner.id as food_id_inner, 
                food_data_inner.amount_in_grams as food_amount_inner, 
                nutrition_inner.id as nut_id_inner, 
                nutrition_inner.value as nut_val_inner, 
                nutrition_inner.unit as nut_unit_inner, 
                nutrition_inner.name as nut_name_inner, 
                ((ingredient_inner.amount*1.0 / food_data_inner.amount_in_grams* 1.0) * 
                (CASE 
                WHEN ingredient_inner.unit = 'g' THEN 1
                WHEN ingredient_inner.unit = 'mg' THEN 1/1000
                WHEN ingredient_inner.unit = 'microg' THEN 1/1000000
                ELSE 0
                END
                ) *
                nutrition_inner.value) AS real_nut_val
                FROM "myAPI_recipe" AS recipe_inner
                LEFT JOIN "myAPI_recipeingredient" AS ingredient_inner
                ON recipe_inner.id = ingredient_inner.recipe_id
                LEFT JOIN "myAPI_fooddata" AS food_data_inner
                ON ingredient_inner.food_data_id = food_data_inner.id
                LEFT JOIN "myAPI_nutritionaldata" AS nutrition_inner
                ON food_data_inner.id = nutrition_inner.parent_food_id
                LEFT JOIN "myAPI_useraccount" AS useraccount_inner
                ON recipe_inner.username = useraccount_inner.username
                WHERE 
                recipe_inner.is_hidden = FALSE AND
                (recipe_inner.is_private = FALSE OR (recipe_inner.is_private = TRUE AND recipe_inner.username = '{username}'))
                GROUP BY
                recipe_inner.id, 
                recipe_inner.is_private, 
                recipe_inner.is_hidden, 
                recipe_inner.username,
                ingredient_inner.id, 
                ingredient_inner.food_data_id, 
                ingredient_inner.amount, 
                ingredient_inner.unit, 
                food_data_inner.id, 
                food_data_inner.amount_in_grams, 
                nutrition_inner.id, 
                nutrition_inner.value, 
                nutrition_inner.unit, 
                nutrition_inner.name
                ) 
                AS recipe_inner
                GROUP BY 
                recipe_inner.recipe_id_inner,
                recipe_inner.recipe_title_inner,
                recipe_inner.nut_name_inner   
                )
                AS recipe_inner_wrapper
                WHERE
                (
                (recipe_inner_wrapper.nut_name_inner = 'salt' AND recipe_inner_wrapper.total_inner >= {salt})  OR
                (recipe_inner_wrapper.nut_name_inner = 'free_sugars' AND recipe_inner_wrapper.total_inner >= {free_sugars}) OR
                (recipe_inner_wrapper.nut_name_inner = 'fat' AND recipe_inner_wrapper.total_inner >= {fat}) OR
                (recipe_inner_wrapper.nut_name_inner = 'energy_kj' AND recipe_inner_wrapper.total_inner >= {energy_kj}) OR
                (recipe_inner_wrapper.nut_name_inner = 'energy_kcal' AND recipe_inner_wrapper.total_inner >= {energy_kcal}) OR
                (recipe_inner_wrapper.nut_name_inner = 'saturated_fat' AND recipe_inner_wrapper.total_inner >= {saturated_fat})
                )
        '''.format(
            username=kwargs['username'],
            salt=gov_recommendation[age][gender]['salt'],
            free_sugars=gov_recommendation[age][gender]['free_sugars'],
            fat=gov_recommendation[age][gender]['fat'],
            energy_kcal=gov_recommendation[age][gender]['energy_kcal'],
            energy_kj=gov_recommendation[age][gender]['energy_kj'],
            saturated_fat=gov_recommendation[age][gender]['saturated_fat'],
        )

        recipe_recommended = []
        random.shuffle(sorted_percent[:5])
        for element in sorted_percent[:3]:
            sql_sub_inner = '''
            SELECT
            recipe.recipe_id_middle as recipe_id_middle,
            recipe.recipe_title_middle as recipe_title_middle,
            recipe.nut_name_middle as nut_name_middle,
            SUM(recipe.actual_nut_val) as recipe_total
            FROM
            (
                SELECT 
                recipe.id as recipe_id_middle, 
                recipe.is_private as recipe_private_middle, 
                recipe.is_hidden as recipe_hidden_middle, 
                recipe.title as recipe_title_middle,
                recipe.username as recipe_username_middle,
                ingredient.id as ingredient_id_middle, 
                ingredient.food_data_id as ingredient_food_middle, 
                ingredient.amount as ingredient_amount_middle, 
                ingredient.unit as ingredient_unit_middle, 
                food_data.id as food_id_middle, 
                food_data.amount_in_grams as food_amount_middle, 
                nutrition.id as nut_id_middle, 
                nutrition.value as nut_val_middle, 
                nutrition.unit as nut_unit_middle, 
                nutrition.name as nut_name_middle, 
                ((ingredient.amount*1.0 / food_data.amount_in_grams* 1.0) * 
                (CASE 
                WHEN ingredient.unit = 'g' THEN 1
                WHEN ingredient.unit = 'mg' THEN 1/1000
                WHEN ingredient.unit = 'microg' THEN 1/1000000
                ELSE 0
                END
                ) *
                nutrition.value) AS actual_nut_val
                FROM "myAPI_recipe" AS recipe 
                LEFT JOIN "myAPI_recipeingredient" AS ingredient
                ON recipe.id = ingredient.recipe_id
                LEFT JOIN "myAPI_fooddata" as food_data
                ON ingredient.food_data_id = food_data.id
                LEFT JOIN "myAPI_nutritionaldata" AS nutrition
                ON food_data.id = nutrition.parent_food_id
                LEFT JOIN "myAPI_useraccount" AS useraccount
                ON recipe.username = useraccount.username
                WHERE 
                recipe.is_hidden = FALSE AND
                (recipe.is_private = FALSE OR (recipe.is_private = TRUE AND recipe.username = '{username}')) AND
                nutrition.name = '{name}' AND
                recipe.id NOT IN
                (
                    SELECT 
                    recipe_inner_wrapper.recipe_id_inner
                    FROM 
                    (
                        {sql_sub_inner2}
                    ) AS recipe_inner_wrapper
                )
                GROUP BY
                recipe.id, 
                recipe.is_private, 
                recipe.is_hidden, 
                recipe.username,
                ingredient.id, 
                ingredient.food_data_id, 
                ingredient.amount, 
                ingredient.unit, 
                food_data.id, 
                food_data.amount_in_grams, 
                nutrition.id, 
                nutrition.value, 
                nutrition.unit, 
                nutrition.name
            )
            AS recipe
            GROUP BY
            recipe.recipe_id_middle,
            recipe.recipe_title_middle,
            recipe.nut_name_middle
            '''.format(
                username=kwargs['username'],
                sql_sub_inner2=sql_sub_inner2,
                name=element[0]
            )
            recipe_max_id = Recipe.objects.raw(
                '''
                SELECT
                recipe.id
                FROM
                (
                    SELECT 
                    recipe_outer.recipe_id_middle AS id,
                    recipe_outer.recipe_title_middle,
                    recipe_outer.nut_name_middle,
                    recipe_outer.recipe_total
                    FROM
                    ({sql_sub_inner}) 
                    AS recipe_outer
                    GROUP BY 
                    recipe_outer.recipe_id_middle,
                    recipe_outer.recipe_title_middle,
                    recipe_outer.nut_name_middle,
                    recipe_outer.recipe_total
                    ORDER BY
                    recipe_outer.recipe_total
                    DESC
                    LIMIT 1
                )
                AS recipe
                '''.format(sql_sub_inner=sql_sub_inner))

            if len(recipe_max_id) > 0:
                recipe_max_nutrition_name = Recipe.objects.get(
                    id=recipe_max_id[0].id)
                serializer = RecipeSerializer(
                    recipe_max_nutrition_name)
                data = serializer.data
                data['high_in'] = element[0]
                recipe_recommended.append(data)

        return Response(recipe_recommended)


class PersonalRecipeViewSet(viewsets.ModelViewSet):
    queryset = Recipe.objects.all()
    serializer_class = RecipeSerializer

    @verify_secret_header
    def list(self, request, *args, **kwargs):
        search_query = request.query_params.get('title', None)

        if request.user is not None and kwargs['username'] == request.user.username:
            recipe = self.queryset.filter(
                user=request.user, is_hidden=False)

            if search_query is not None:
                query_together = Q()
                search_query_clean = search_query.split(' ')
                for query in search_query_clean:
                    query_together |= Q(title__icontains=query) | Q(
                        tags__text__icontains=query)

                recipe &= self.queryset.filter(query_together)

            serializer = RecipeTitleSerializer(
                recipe.extra(select={'length': 'Length(title)'}).order_by('-last_used')[:30], many=True)
            return Response(serializer.data)
        return Response(status=status.HTTP_401_UNAUTHORIZED)

    @verify_secret_header
    def destroy(self, request, *args, **kwargs):
        # due to possibilty of data being used in the past data is not completely deleted, only disallows future usage and deletes image, but data is still referenced in records
        if not request.user.is_authenticated or request.user.username != kwargs['username']:
            return Response('only owner can delete.', status=status.HTTP_401_UNAUTHORIZED)

        recipe = get_object_or_404(
            self.queryset, user=request.user, id=kwargs['myrecipe_id'])
        recipe.main_img.delete()
        recipe.is_hidden = True
        recipe.save()
        return Response('deleted', status=status.HTTP_200_OK)


class RecipeCommentViewSet(viewsets.ModelViewSet):
    queryset = RecipeComment.objects.all()
    serializer_class = RecipeCommentSerializer

    @verify_secret_header
    def create(self, request, *args, **kwargs):
        parent_recipe = get_object_or_404(Recipe, id=kwargs['recipe_id'])

        # comment = RecipeComment.objects.create(
        #     recipe=parent_recipe, data=request.data)
        # parent_recipe.comment.add(comment)
        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @verify_secret_header
    def list(self, request, *args, **kwargs):
        parent_recipe = get_object_or_404(Recipe, id=kwargs['recipe_id'])

        comment = RecipeComment.objects.filter(recipe=parent_recipe)
        serializer = self.serializer_class(comment, many=True)

        return Response(serializer.data, status=status.HTTP_200_OK)

    @verify_secret_header
    def destroy(self, request, *args, **kwargs):
        if not request.user.is_authenticated:
            return Response(status=status.HTTP_401_UNAUTHORIZED)
        comment = get_object_or_404(
            RecipeComment, id=kwargs['recipecomment_id'])
        serializer = self.serializer_class(comment)
        comment.delete()

        return Response(serializer.data, status=status.HTTP_200_OK)


class PersonalRecipeCommentViewSet(viewsets.ModelViewSet):
    queryset = RecipeComment.objects.all()
    serializer_class = RecipeCommentSerializer

    @verify_secret_header
    def list(self, request, *args, **kwargs):
        user = get_object_or_404(UserAccount, username=kwargs['username'])

        comment = RecipeComment.objects.filter(user=user)
        serializer = self.serializer_class(comment, many=True)

        return Response(serializer.data, status=status.HTTP_200_OK)


class FoodDataViewSet(viewsets.ModelViewSet):
    queryset = FoodData.objects.all()
    serializer_class = FoodDataSerializer
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    @verify_secret_header
    def retrieve(self, request, *args, **kwargs):
        food_data = get_object_or_404(self.queryset, id=kwargs['id'])
        if food_data.is_hidden:
            return Response(status.HTTP_404_NOT_FOUND)

        if food_data.is_private and request.user != food_data.uploader:
            return Response(status.HTTP_401_UNAUTHORIZED)
        serializer = FoodDataSerializer(food_data)
        return Response(serializer.data)

    @verify_secret_header
    def list(self, request, *args, **kwargs):
        search_query = request.query_params.get('name', None)

        # https://docs.djangoproject.com/en/4.0/ref/models/expressions/
        # https://stackoverflow.com/questions/4824759/django-query-using-contains-each-value-in-a-list
        # https://stackoverflow.com/questions/12804801/django-how-to-sort-queryset-by-number-of-character-in-a-field
        if search_query is not None:
            query_together = Q()
            search_query_clean = search_query.split(' ')
            for query in search_query_clean:
                query_together |= Q(name__icontains=query)

            food_data = self.queryset.filter(
                is_private=False, is_hidden=False) & self.queryset.filter(query_together)

        else:
            food_data = self.queryset.filter(
                is_private=False, is_hidden=False)

        serializer = SimpleFoodDataSerializer(
            food_data.extra(select={'length': 'Length(name)'}).order_by('-last_used', 'length'), many=True)
        return Response(serializer.data)

    @verify_secret_header
    def create(self, request, *args, **kwargs):
        if request.user.is_authenticated == False:
            return Response({'you need to log in to upload.'}, status.HTTP_401_UNAUTHORIZED)

        if request.user.username != request.data['uploader']:
            return Response({'uploader must be the username of the account uploading.'}, status.HTTP_401_UNAUTHORIZED)
        serializer = FoodDataSerializer(
            data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status.HTTP_400_BAD_REQUEST)

    @verify_secret_header
    @transaction.atomic()
    def update(self, request, *args, **kwargs):
        if request.user.is_authenticated == False:
            return Response({'you need to log in to upload.'}, status.HTTP_401_UNAUTHORIZED)
        if not self.queryset.filter(id=kwargs['id']).exists():
            return Response('does not exist', status=status.HTTP_404_NOT_FOUND)
        food_data = self.queryset.select_for_update().get(id=kwargs['id'])
        if food_data.is_hidden:
            return Response({'not found.'}, status.HTTP_404_UNAUTHORIZED)
        if food_data.uploader != request.user:
            return Response({'you are not the owner.'}, status.HTTP_401_UNAUTHORIZED)

        serializer = FoodDataSerializer(
            food_data, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response({'not found.'}, status.HTTP_404_UNAUTHORIZED)


class PersonalFoodDataViewSet(viewsets.ModelViewSet):
    queryset = FoodData.objects.all()
    serializer_class = FoodDataSerializer

    @verify_secret_header
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
            food_data.extra(select={'length': 'Length(name)'}).order_by('-last_used', 'length'), many=True)
        return Response(serializer.data)

    @verify_secret_header
    def destroy(self, request, *args, **kwargs):
        # due to possibilty of data being used in the past data is not completely deleted, only disallows future usage and deletes image, but data is still referenced in records
        if not request.user.is_authenticated or request.user.username != kwargs['username']:
            return Response('only owner can delete.', status=status.HTTP_401_UNAUTHORIZED)

        food_data = get_object_or_404(
            self.queryset, uploader=kwargs['username'], id=kwargs['myfood_id'])
        food_data.main_img.delete()
        food_data.is_hidden = True
        food_data.save()
        return Response(status=status.HTTP_200_OK)


class UserRequestViewSet(viewsets.ModelViewSet):
    queryset = UserShareRequest.objects.all()
    serializer_class = UserShareRequestSerializer

    @verify_secret_header
    def destroy(self, request, *args, **kwargs):
        if not request.user.is_authenticated:
            return Response('requries login', status=status.HTTP_401_UNAUTHORIZED)

        share_request = get_object_or_404(
            UserShareRequest, id=kwargs['request_id'])

        if request.user.username != share_request.request_received_from.username and request.user.username != share_request.request_sent_to.username:
            return Response('action not allowed.', status=status.HTTP_401_UNAUTHORIZED)

        share_request.delete()
        return Response('deleted', status=status.HTTP_200_OK)


class UserShareRequestReceivedViewSet(UserRequestViewSet):

    @verify_secret_header
    def list(self, request, *args, **kwargs):
        if not request.user.is_authenticated:
            return Response('requries login', status=status.HTTP_401_UNAUTHORIZED)

        share_requests = self.queryset.filter(
            request_sent_to=request.user)

        serializer = self.serializer_class(share_requests, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class UserShareRequestSentViewSet(UserRequestViewSet):

    @verify_secret_header
    def create(self, request, *args, **kwargs):
        if not request.user.is_authenticated or request.user.username != kwargs['username']:
            return Response('requires log in', status=status.HTTP_401_UNAUTHORIZED)

        if request.user.username == request.data['request_sent_to']:
            return Response('cannot request yourself', status=status.HTTP_400_BAD_REQUEST)

        if not UserAccount.objects.filter(username=request.data['request_sent_to']).exists():
            return Response('request useraccount does not exist', status=status.HTTP_400_BAD_REQUEST)

        if UserShareRequest.objects.filter(request_received_from=request.user, request_sent_to=request.data['request_sent_to']).exists():
            return Response('request already made', status=status.HTTP_400_BAD_REQUEST)

        serializer = UserShareRequestSerializer(
            data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @verify_secret_header
    def list(self, request, *args, **kwargs):
        if not request.user.is_authenticated:
            return Response('requries login', status=status.HTTP_401_UNAUTHORIZED)

        share_requests = self.queryset.filter(
            request_received_from=request.user)
        serializer = self.serializer_class(share_requests, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class UserShareViewSet(viewsets.ModelViewSet):
    queryset = UserAccount.objects.all()
    serializer_class = UserAccountSerializer

    @verify_secret_header
    def create(self, request, *args, **kwargs):
        if not request.user.is_authenticated or request.user.username != kwargs['username']:
            return Response('not allowed on this account', status=status.HTTP_401_UNAUTHORIZED)

        to_user = get_object_or_404(
            UserAccount, username=request.data['share_with_user'])

        if 'recordable_subuser' in request.data:
            for subuser_id in request.data['recordable_subuser']:
                subuser = get_object_or_404(Subuser, id=subuser_id)
                to_user.recordable_subuser.add(subuser)

        if 'viewable_subuser' in request.data:
            for subuser_id in request.data['viewable_subuser']:
                subuser = get_object_or_404(Subuser, id=subuser_id)
                to_user.viewable_subuser.add(subuser)

        requests = UserShareRequest.objects.filter(request_received_from=to_user,
                                                   request_sent_to=request.user)

        if requests.exists():
            for req in requests:
                req.delete()

        return Response('success', status=status.HTTP_200_OK)
