from cgitb import lookup
from contextvars import Context
from datetime import datetime, timedelta
from email import message
import json
from os import stat
import re
import string
from tracemalloc import start
from .models import *
from .serializers import *
from django.http import Http404
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework import mixins
from rest_framework import generics
from rest_framework import viewsets
from rest_framework.permissions import BasePermission, SAFE_METHODS
from django.shortcuts import get_object_or_404

from myAPI import serializers

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
        queryset = UserAccount.objects.all()
        userccount = get_object_or_404(queryset, username=username)
        serializer = UserAccountSerializer(userccount)
        return Response(serializer.data)
    
    def update(self, request, username):
        print(username)
        queryset = UserAccount.objects.all()
        userccount = get_object_or_404(queryset, username=username)
        request.data['username'] = username
        serializer = UserAccountSerializer(userccount, data=request.data)
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
class UserRecordPermission(BasePermission):
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
    permission_classes = [UserRecordPermission]
    queryset = UserDayRecord.objects.all()
    serializer_class = UserDayRecordSerializer

    """
    requires login to view data and shows the logged in user's only
    """
    def list(self, request, *args, **kwargs):
        if request.user.is_authenticated:
            name = kwargs['name']
            from_date = request.query_params.get('from', None)
            nutrition_type = request.query_params.get('nutrition', None)
            on_date = request.query_params.get('date', None)

            # if date is specified, turn the data into array of data
            if from_date is not None:
                return self.__date_range_helper(from_date, on_date, name, request.user.username)

            if on_date is not None:
                return self.__date_helper(on_date, name, request.user.username)

            
            serializer = UserDayRecordSerializer(self.queryset.filter(user=request.user, name=name), many=True)
                
            return Response(serializer.data)
        content = {'requires log in to see'}
        return Response(content, status=status.HTTP_401_UNAUTHORIZED)


    def __date_range_helper(self, from_date, on_date, name, username):
        # https://stackoverflow.com/questions/16870663/how-do-i-validate-a-date-string-format-in-python
        try:
            start_date = datetime.strptime(from_date, '%Y-%m-%d')
        except ValueError:
            error = {"date format incorrect"}
            return Response(error, status=status.HTTP_400_BAD_REQUEST)
        
        if on_date is not None:
        # https://stackoverflow.com/questions/16870663/how-do-i-validate-a-date-string-format-in-python
            try:
                target_date = datetime.strptime(on_date, '%Y-%m-%d')
            except ValueError:
                error = {"date format incorrect"}
                return Response(error, status=status.HTTP_400_BAD_REQUEST)
        else:
            target_date = datetime.now()

        current_date = start_date
        date_container = []
        while current_date <= target_date:
            date_container.append(current_date.strftime('%Y-%m-%d'))
            current_date = current_date + timedelta(days=1)
        print(date_container)
        
        
        serializer = UserDayRecordSerializer(self.queryset.filter(user=username, name=name, 
            date__range=[start_date, target_date]), many=True)
        

        # if empty after filter just return
        if len(serializer.data) <= 0:
            return Response(serializer.data)

        # the return data should be in the same format as usual return
        # but rather than array of object turn it into object of arrays
        data_json = serializer.data.copy()
        return_json = data_json.pop(0)

        # use the first entry and turn each value into array with that value only
        for key, value in return_json.items():
            if key == 'name' or key == 'user':
                    continue
            return_json[key] = [value]

        # append the following data
        for data in data_json:
            for key, value in data.items():
                if key == 'name' or key == 'user':
                    continue
                return_json[key].append(value)

        return Response(return_json)

    def __date_helper(self, on_date, name, username):
        # https://stackoverflow.com/questions/16870663/how-do-i-validate-a-date-string-format-in-python
        try:
            target_date = datetime.strptime(on_date, '%Y-%m-%d')
        except ValueError:
            error = {"date format incorrect"}
            return Response(error, status=status.HTTP_400_BAD_REQUEST)
        
        if name is None:
            serializer = UserDayRecordSerializer(self.queryset.filter(user=username, 
            date=target_date), many=True)
        else:
            serializer = UserDayRecordSerializer(self.queryset.filter( 
            date=target_date), many=True)

        if len(serializer.data) > 0:
            return Response(serializer.data[0])
        return Response({})


    """
    def retrieve(self, request, *args, **kwargs):
        if request.user.is_authenticated:
            serializer = UserRecordsSerializer(self.queryset.get(user=request.user.username, date=request.date))
            return Response(serializer.data)
        content = {'requires log in to see'}
        return Response(content, status=status.HTTP_401_UNAUTHORIZED)
    """
    def create(self, request, *args, **kwargs):
        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UserMealRecordViewSet(viewsets.ModelViewSet):
    permission_classes = [UserRecordPermission]
    queryset = UserMealRecord.objects.all()
    serializer_class = UserMealRecordSerializer
   
   
    def list(self, request):
        record = request.query_params.get('record', None)
        if request.user.is_authenticated and record is not None:
            serializer = self.serializer_class(self.queryset.filter(day_record=record), many=True)
            
            # for index_rec, meal_record in enumerate(serializer.data):
            #     for index_cont, meal_content in enumerate(meal_record['meal_content']):
            #         food_data_id = meal_content.pop('food_data')
            #         food_data = FoodDataSerializer(FoodData.objects.get(id=food_data_id)).data
            #         serializer.data[index_rec]['meal_content'][index_cont]['food_data'] = food_data

            return Response(serializer.data)
        return Response([])
    
    def create(self, request):
        
        record = self.__recordHelper(request=request)
        self.__foodHelper(request)
        # add the record data to the request data, so the data is valid for serializer to process
        request.data['day_record'] = int(record.id)
        serializer = self.serializer_class(data=request.data)

        # rest is taken care of by serializer
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def __recordHelper(self, request):
        # check date format, if its not in the right format default it (today)
        data = json.loads(request.body)
        
        if 'time' in data:
            try :
                time_object = datetime.strptime(data['time'], '%Y-%m-%d %H:%M:%S')
            except AttributeError:
                time_object = datetime.now()
        else:
            time_object = datetime.now()
        
        time = time_object.strftime('%Y-%m-%d %H:%M%S')
        date = time_object.strftime('%Y-%m-%d')

        # get all records with the date
        records_list = UserDayRecord.objects.filter(date=date)

        # if there is no record, create one
        if len(records_list) == 0:
            record = UserDayRecord.objects.create(user=request.user, name=request.query_params.get('name'), date=date)
        else:
            # if there is one, use the record as the parent for this meal record data
            record = records_list[0]
        
        return record

    def __foodHelper(self, request):
        for meal_content in request.data['meal_content']:
            if not isinstance(meal_content['food_data'], int):
                # if food data was sent instead of id, create it first
                food_data_json = meal_content.pop('food_data')
                user = None
                if 'owner' in food_data_json:
                    owner = food_data_json.pop('owner')
                    if isinstance(owner, int):
                        user_list = UserAccount.objects.filter(id=owner)
                    elif isinstance(owner, str):
                        user_list = UserAccount.objects.filter(username=owner)
                    else:
                        return False
                    
                    if len(user_list) == 1:
                        user = user_list[0]
                else:
                    return False

                food_data = FoodData.objects.create(owner=user, **food_data_json)
                meal_content['food_data'] = food_data.id


class UserDataPermission(BasePermission):
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
        return obj.user.username == request.user.username

class UserDataViewSet(viewsets.ModelViewSet):
    permission_classes = [UserDataPermission]
    queryset = UserData.objects.all()
    serializer_class = UserDataSerializer

    def create(self, request, *args, **kwargs):
 
        if request.user.is_authenticated and request.user.username == kwargs['username']:
            request.data['user'] = request.user
            serializer = UserDataSerializer(data=request.data, context={'request': request})
            if len(UserDataSerializer(self.queryset.filter(user=request.user, name=request.data['name']), many=True).data) > 0:
                message = {'sub user with the same name exists'}
                return Response(message, status=status.HTTP_400_BAD_REQUEST)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        message = {'requires log in'}
        return Response(message, status=status.HTTP_401_UNAUTHORIZED)

    def list(self, request, *args, **kwargs):
        
        if request.user.is_authenticated and request.user.username == kwargs['username']:
            serializer = UserDataSerializer(self.queryset.filter(user=request.user), many=True)
            print(serializer.data)
            return Response(serializer.data)
        content = {'requires log in to see'}
        return Response(content, status=status.HTTP_401_UNAUTHORIZED)
    
    def retrieve(self, request, *args, **kwargs):
        if request.user.is_authenticated and request.user.username == kwargs['username']:
            print(kwargs['name'])
            serializer = UserDataSerializer(self.queryset.get(user=request.user, name=kwargs['name']))
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
            serializer = UserProfileSerializer(self.queryset.get(username=request.user.username))
            return Response(serializer.data)
        content = {'requires log in to see'}
        return Response(content, status=status.HTTP_401_UNAUTHORIZED)

    def list(self, request, *args, **kwargs):
        if request.user.is_authenticated:
            serializer = UserProfileSerializer(self.queryset.filter(username=request.user.username), many=True)
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
            serializer = self.serializer_class(self.queryset.filter(title__contains=search_query), many=True)
        return Response(serializer.data)

class RecipeViewSet(viewsets.ModelViewSet):
    queryset = Recipe.objects.all()
    serializer_class = RecipeSerializer

    def create(self, request, *args, **kwargs):
        serializer = RecipeSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    # https://docs.djangoproject.com/en/4.0/topics/db/queries/
    def list(self, request, *args, **kwargs):
        search_query = request.query_params.get('title', None)
        
        if search_query is None:
            serializer = self.serializer_class(self.queryset, many=True)
        else:
            serializer = self.serializer_class(self.queryset.filter(title__contains=search_query), many=True)
        
        # for i, data in enumerate(serializer.data):
        #     ingredients = data['ingredients']
        #     for j, ingredient in enumerate(ingredients):
        #         ingredient_food_id = ingredient['ingredient']
        #         food_data = FoodData.objects.get(id=ingredient_food_id)
        #         serializer.data[i]['ingredients'][j]['name'] = food_data.name
        return Response(serializer.data)

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

class NutritionalViewSet(viewsets.ModelViewSet):
    queryset = NutritionalData.objects.all()
    serializer_class = NutritionalData

class RecipeIngredientViewSet(viewsets.ModelViewSet):
    queryset = RecipeIngredient.objects.all()
    serializer_class = RecipeIngredientSerializer


'''
class RecipeViewSet(viewsets.ViewSet):

    def list(self, request):
        recipe = Recipe.objects.all()
        serializer = RecipeSerializer(recipe, many=True)
        return Response(serializer.data)

    def create(self, request):
        serializer = RecipeSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def retrieve(self, request, pk=None):
        queryset = Recipe.objects.all()
        recipe = get_object_or_404(queryset, pk=pk)
        serializer = RecipeSerializer(recipe)
        return Response(serializer.data)

    def update(self, request, pk=None):
        recipe = Recipe.objects.get(pk=pk)
        serializer = RecipeSerializer(recipe, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def partial_update(self, request, pk=None):
        pass

    def destroy(self, request, pk=None):
        recipe = Recipe.objects.get(pk=pk)
        recipe.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)



class UserAccountList(mixins.ListModelMixin, mixins.CreateModelMixin, generics.GenericAPIView):
    queryset = UserAccount.objects.all()
    serializer_class = UserAccountModelSerializer

    def get(self, request, *args, **kwargs):
        return self.list(request, *args, **kwargs)

    def post(self, request, *args, **kwargs):
        return self.create(request, *args, **kwargs)

class UserAccountDetail(mixins.RetrieveModelMixin,
                    mixins.UpdateModelMixin,
                    mixins.DestroyModelMixin,
                    generics.GenericAPIView):
    queryset = UserAccount.objects.all()
    serializer_class = UserAccountModelSerializer

    #lookup_field = 'id'

    def get(self, request, pk):
        return self.retrieve(request, pk=pk)

    def put(self, request, pk):
        return self.update(request, pk=pk)

    def delete(self, request, pk):
        return self.destroy(request, pk=pk)


class UserAccountList(APIView):
    def get(self, request, format=None):
        useraccount = UserAccount.objects.all()
        serializer = UserAccountModelSerializer(useraccount, many=True)
        return Response(serializer.data)

    def post(self, request, format=None):
        serializer = UserAccountModelSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class UserAccountDetail(APIView):
    """
    Retrieve, update or delete a snippet instance.
    """
    def get_object(self, pk):
        try:
            return UserAccount.objects.get(pk=pk)
        except UserAccount.DoesNotExist:
            raise Http404

    def get(self, request, pk, format=None):
        useraccount = self.get_object(pk)
        serializer = UserAccountModelSerializer(useraccount)
        return Response(serializer.data)

    def put(self, request, pk, format=None):
        useraccount = self.get_object(pk)
        serializer = UserAccountModelSerializer(useraccount, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk, format=None):
        useraccount = self.get_object(pk)
        useraccount.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

@api_view(['GET', 'POST'])
def useraccount_list(request):
    if request.method == 'GET':
        useraccount = UserAccount.objects.all()
        serializer = UserAccountModelSerializer(useraccount, many=True)
        return Response(serializer.data)
    
    elif request.method == 'POST':
        serializer = UserAccountModelSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return JsonResponse(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'PUT', 'DELETE'])
def useraccount_detail(request, pk):
    """
    Retrieve, update or delete a code snippet.
    """
    try:
        useraccount = UserAccount.objects.get(pk=pk)
    except UserAccount.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        serializer = UserAccountModelSerializer(useraccount)
        return Response(serializer.data)

    elif request.method == 'PUT':
        data = JSONParser().parse(request)
        serializer = UserAccountModelSerializer(useraccount, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'DELETE':
        useraccount.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
'''