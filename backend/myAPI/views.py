from cgitb import lookup
from .models import Comment, Ingredient, Recipe, RecipeStep, UserAccount, Tag, UserRecord
from .serializers import CommentSerializer, IngredientSerializer, RecipeSerializer, RecipeStepSerializer, UserAccountSerializer, TagSerializer, UserRecordsSerializer
from django.http import Http404
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework import mixins
from rest_framework import generics
from rest_framework import viewsets
from django.shortcuts import get_object_or_404

from myAPI import serializers

# Create your views here.

class UserAccountViewSet(viewsets.ModelViewSet):
    queryset = UserAccount.objects.all()
    serializer_class = UserAccountSerializer

class UserRecordViewSet(viewsets.ModelViewSet):
    queryset = UserRecord.objects.all()
    serializer_class = UserRecordsSerializer

class RecipeViewSet(viewsets.ModelViewSet):
    queryset = Recipe.objects.all()
    serializer_class = RecipeSerializer

class TagViewSet(viewsets.ModelViewSet):
    queryset = Tag.objects.all()
    serializer_class = TagSerializer

class RecipeStepViewSet(viewsets.ModelViewSet):
    queryset = RecipeStep.objects.all()
    serializer_class = RecipeStepSerializer

class CommentViewSet(viewsets.ModelViewSet):
    queryset = Comment.objects.all()
    serializer_class = CommentSerializer

class IngredientViewSet(viewsets.ModelViewSet):
    queryset = Ingredient.objects.all()
    serializer_class = IngredientSerializer




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