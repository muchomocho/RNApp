from posixpath import basename
from django.urls import path, include
from . import views
import os
from healthydiet import settings
from django.conf.urls.static import static
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

# url for fooddata
# model : `~myAPi.FoodData`
fooddata_url_base = 'api/fooddata/'
fooddata_url_detail = fooddata_url_base + '<int:id>/'

fooddata_urls = [
    path(fooddata_url_base, views.FoodDataViewSet.as_view(
        {'get': 'list', 'post': 'create'}), name='fooddata'),
    path(fooddata_url_detail, views.FoodDataViewSet.as_view({
        'get': 'retrieve',
        'put': 'update',
        'delete': 'destroy'
    }), name='fooddata-detail'),
]

# url for recipe
# model : `~myAPI.Recipes`
recipe_url_base = 'api/recipes/'
recipe_url_detail = recipe_url_base + '<int:pk>/'


recipe_urls = [
    path(recipe_url_base, views.RecipeViewSet.as_view(
        {'get': 'list', 'post': 'create'}), name='recipe'),
    path(recipe_url_detail, views.RecipeViewSet.as_view({
        'get': 'retrieve',
        'put': 'update',
        'delete': 'destroy'
    }), name='recipe-detail'),
]

# url for recipe tags, extended from recipe url
# model : `~myAPI.RecipeTag`
recipetag_url_base = recipe_url_detail + 'tags/'
recipetag_url_detail = recipetag_url_base + '<int:recipetag_id>/'

recipetag_urls = [
    path(recipetag_url_base, views.TagViewSet.as_view(
        {'get': 'list', 'post': 'create'}), name='recipetag'),
    path(recipetag_url_detail, views.TagViewSet.as_view({
        'get': 'retrieve',
        'put': 'update',
        'delete': 'destroy'
    }), name='recipetag-detail'),
]

# url for recipe comment, extended from recipe url,
# list gives all comment for particular recipe
# model : `~myAPI.RecipeComment`
recipecomment_url_base = recipe_url_detail + 'comments/'
recipecomment_url_detail = recipetag_url_base + '<int:recipecomment_id>/'

recipecomment_urls = [
    path(recipecomment_url_base, views.CommentViewSet.as_view(
        {'get': 'list', 'post': 'create'}), name='recipecomment'),
    path(recipecomment_url_detail, views.CommentViewSet.as_view({
        'get': 'retrieve',
        'put': 'update',
        'delete': 'destroy'
    }), name='recipecomment-detail'),
]

# url for recipe ingredients
# list gives all ingredients for a particular recipe
# ingredients are derived from fooddata if it exists
# model : `~myAPI.RecipeIngredient`
recipeingredient_url_base = recipe_url_detail + 'ingredients/'
recipeingredient_url_detail = recipetag_url_base + '<int:ingredient_id>/'

recipeingredient_urls = [
    path(recipeingredient_url_base, views.RecipeIngredientViewSet.as_view(
        {'get': 'list', 'post': 'create'}), name='recipecomment'),
    path(recipeingredient_url_detail, views.RecipeIngredientViewSet.as_view({
        'get': 'retrieve',
        'put': 'update',
        'delete': 'destroy'
    }), name='recipecomment-detail'),
]

# append all urls for recipe
recipe_urls += recipetag_urls + recipecomment_urls + recipeingredient_urls

# url for useraccounts, single get is specified by username
# model : `~myAPI.UserAccount`
useraccount_url_base = 'api/useraccounts/'
useraccount_url_detail = useraccount_url_base + '<str:username>/'

useraccount_urls = [
    path(useraccount_url_base, views.UserAccountViewSet.as_view(
        {'get': 'list', 'post': 'create'}), name='useraccounts', ),
    path(useraccount_url_detail, views.UserAccountViewSet.as_view({
        'get': 'retrieve',
        'put': 'update',
        'delete': 'destroy'
    }), name='useraccounts-detail')
]

# url for subusers, single entity specified by username + name of subuser (name is unique per subuser per useraccount)
# model : `~myAPI.UserData`
userdata_url_base = useraccount_url_detail + 'userdata/'
userdata_url_detail = userdata_url_base + '<str:name>/'

userdata_urls = [
    path(userdata_url_base, views.UserDataViewSet.as_view(
        {'get': 'list', 'post': 'create'}), name='userdata'),
    path(userdata_url_detail, views.UserDataViewSet.as_view({
        'get': 'retrieve',
        'put': 'update',
        'delete': 'destroy'
    }), name='userdata-detail'),
    path(useraccount_url_detail + 'userprofile/',
         views.UserProfileViewSet.as_view({'get': 'retrieve'}), name='userprofile')
]

# model : `~myAPI.UserMealRecord`
# gets a formatted version of meal record nutrition data
userrecord_url_base = userdata_url_detail + 'userrecord/'
userrecord_url_detail = userrecord_url_base + '<str:date>/'
userrecord_url_date_range = userrecord_url_detail + 'from/<str:from>/'
recipe_url_recommendation = userdata_url_detail + 'reciperecommendation/'

userrecord_urls = [
    path(userrecord_url_date_range, views.UserRecordViewSet.as_view(
        {'get': 'list'}), name='userrecord-daterange'),
    path(userrecord_url_detail, views.UserRecordViewSet.as_view({
        'get': 'retrieve',
    }), name='userrecord-detail'),
    path(recipe_url_recommendation, views.RecipeRecommendationViewSet.as_view(
        {'get': 'list'}), name='recipe-recommendation')
]

# model : `~myAPI.UserMealRecord`
usermealrecord_url_base = userdata_url_detail + 'usermealrecord/'
usermealrecord_url_detail = usermealrecord_url_base + '<int:usermealrecord_id>/'

usermealrecord_urls = [
    path(usermealrecord_url_base, views.UserMealRecordViewSet.as_view(
        {'get': 'list', 'post': 'create'}), name='usermealrecord'),
    path(usermealrecord_url_detail, views.UserMealRecordViewSet.as_view({
        'get': 'retrieve',
        'put': 'update',
        'delete': 'destroy'
    }), name='usermealrecord-detail'),
]

# append the urls
useraccount_urls += userdata_urls + userrecord_urls + usermealrecord_urls

urlpatterns = [
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]\
    + useraccount_urls\
    + recipe_urls\
    + fooddata_urls\
    + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
