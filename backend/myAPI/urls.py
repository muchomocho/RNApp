from posixpath import basename
from django.urls import path, include
from . import views
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

# drf-nested-routers

router = DefaultRouter()
#router.register('useraccounts', views.UserAccountViewSet, basename='useraccounts')
#router.register('userdata', views.UserDataViewSet, basename='useraccounts-userdata')
#router.register('userprofile', views.UserProfileViewSet, basename='userprofile')
#router.register('userrecords', views.UserRecordViewSet, basename='userrecords')
#router.register('usermealrecords', views.UserMealRecordViewSet, basename='usermealrecords')
#router.register('recipetitles', views.RecipeTitleViewSet, basename='recipetitles')
#router.register('recipes', views.RecipeViewSet, basename='recipes')
#router.register('tags', views.TagViewSet, basename='tags')
#router.register('comments', views.CommentViewSet, basename='comments')
#router.register('recipesteps', views.RecipeStepViewSet, basename='recipesteps')
router.register('fooddata', views.FoodDataViewSet, basename='fooddata')
#router.register('recipeingredients', views.RecipeIngredientViewSet, basename='recipeingredients')

fooddata_url_base = 'api/fooddata/'
fooddata_url_detail = fooddata_url_base + '<int:id>/'

fooddata_urls = [
    path(fooddata_url_base, views.UserRecordViewSet.as_view({'get': 'list', 'post': 'create'}), name='fooddata'),
    path(fooddata_url_detail, views.UserRecordViewSet.as_view({
        'get': 'retrieve',
        'put': 'update',
        'delete': 'destroy'
        }), name='fooddata-detail'),
]

recipe_url_base = 'api/recipes/'
recipe_url_detail = recipe_url_base + '<int:pk>/'

recipetag_url_base  = recipe_url_detail + 'tags/'
recipetag_url_detail = recipetag_url_base + '<int:recipetag_id>/'

recipecomment_url_base  = recipe_url_detail + 'comments/'
recipecomment_url_detail = recipetag_url_base + '<int:recipecomment_id>/'

recipeingredient_url_base  = recipe_url_detail + 'ingredients/'
recipeingredient_url_detail = recipetag_url_base + '<int:ingredient_id>/'

recipeingredient_urls = [
    path(recipeingredient_url_base, views.RecipeIngredientViewSet.as_view({'get': 'list', 'post': 'create'}), name='recipecomment'),
    path(recipeingredient_url_detail, views.RecipeIngredientViewSet.as_view({
        'get': 'retrieve',
        'put': 'update',
        'delete': 'destroy'
        }), name='recipecomment-detail'),
]

recipecomment_urls = [
    path(recipecomment_url_base, views.CommentViewSet.as_view({'get': 'list', 'post': 'create'}), name='recipecomment'),
    path(recipecomment_url_detail, views.CommentViewSet.as_view({
        'get': 'retrieve',
        'put': 'update',
        'delete': 'destroy'
        }), name='recipecomment-detail'),
]

recipetag_urls = [
    path(recipetag_url_base, views.TagViewSet.as_view({'get': 'list', 'post': 'create'}), name='recipetag'),
    path(recipetag_url_detail, views.TagViewSet.as_view({
        'get': 'retrieve',
        'put': 'update',
        'delete': 'destroy'
        }), name='recipetag-detail'),
] 

recipe_urls = [
    path(recipe_url_base, views.RecipeViewSet.as_view({'get': 'list', 'post': 'create'}), name='recipe'),
    path(recipe_url_detail, views.RecipeViewSet.as_view({
        'get': 'retrieve',
        'put': 'update',
        'delete': 'destroy'
        }), name='recipe-detail'),
] + recipetag_urls + recipecomment_urls

useraccount_url_base = 'api/useraccounts/'
useraccount_url_detail = useraccount_url_base + '<str:username>/'

userdata_url_base = useraccount_url_detail + 'userdata/'
userdata_url_detail= userdata_url_base + '<str:name>/'

userrecord_url_base = userdata_url_detail + 'userrecord/'
userrecord_url_detail = userrecord_url_base + '<int:userrecord_id>/'

usermealrecord_url_base = userrecord_url_detail + 'usermealrecord/'
usermealrecord_url_detail = usermealrecord_url_base + '<int:usermealrecord_id>/'

usermealcontent_url_base = usermealrecord_url_detail + 'usermealcontent/'
usermealcontent_url_detail = usermealcontent_url_base + '<int:usermealcontent_id>/'

usermealcontent_urls = [
    path(usermealcontent_url_base, views.UserRecordViewSet.as_view({'get': 'list', 'post': 'create'}), name='usermealcontent'),
    path(usermealcontent_url_detail, views.UserRecordViewSet.as_view({
        'get': 'retrieve',
        'put': 'update',
        'delete': 'destroy'
        }), name='usermealcontent-detail'),
]

usermealrecord_urls = [
    path(usermealrecord_url_base, views.UserRecordViewSet.as_view({'get': 'list', 'post': 'create'}), name='usermealrecord'),
    path(usermealrecord_url_detail, views.UserRecordViewSet.as_view({
        'get': 'retrieve',
        'put': 'update',
        'delete': 'destroy'
        }), name='usermealrecord-detail'),
] + usermealcontent_urls

userrecord_urls = [
    path(userrecord_url_base, views.UserRecordViewSet.as_view({'get': 'list', 'post': 'create'}), name='userrecord'),
    path(userrecord_url_detail, views.UserRecordViewSet.as_view({
        'get': 'retrieve',
        'put': 'update',
        'delete': 'destroy'
        }), name='userrecord-detail'),
] + usermealrecord_urls

userdata_urls = [
    path(userdata_url_base, views.UserDataViewSet.as_view({'get': 'list', 'post': 'create'}), name='userdata'),
    path(userdata_url_detail, views.UserDataViewSet.as_view({
        'get': 'retrieve',
        'put': 'update',
        'delete': 'destroy'
        }), name='userdata-detail'),
    path(useraccount_url_detail + 'userprofile/', views.UserProfileViewSet.as_view({'get': 'retrieve'}), name='userprofile')
] + userrecord_urls

useraccount_urls = [
    path(useraccount_url_base, views.UserAccountViewSet.as_view({'get': 'list', 'post': 'create'}), name='useraccounts', ),
    path(useraccount_url_detail, views.UserAccountViewSet.as_view({
        'get': 'retrieve',
        'put': 'update',
        'delete': 'destroy'
        }), name='useraccounts-detail')
] + userdata_urls

urlpatterns = [
    #path('api/', include(router.urls)),
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    #path('useraccounts/<str:pk>/', views.UserAccountDetail.as_view()),
    #path('recipes/', views.RecipeList.as_view()),
    #path('recipess/<str:pk>/', views.RecipeDetail.as_view()),
] + useraccount_urls + recipe_urls