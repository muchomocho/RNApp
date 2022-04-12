from posixpath import basename
from django.urls import path, include
from . import views
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

# drf-nested-routers
from rest_framework_nested import routers

router = DefaultRouter()
router.register('useraccounts', views.UserAccountViewSet, basename='useraccounts')
router.register('userdata', views.UserDataViewSet, basename='useraccounts-userdata')
router.register('userprofile', views.UserProfileViewSet, basename='userprofile')
router.register('userrecords', views.UserRecordViewSet, basename='userrecords')
router.register('usermealrecords', views.UserMealRecordViewSet, basename='usermealrecords')
router.register('recipetitles', views.RecipeTitleViewSet, basename='recipetitles')
router.register('recipes', views.RecipeViewSet, basename='recipes')
router.register('tags', views.TagViewSet, basename='tags')
router.register('comments', views.CommentViewSet, basename='comments')
router.register('recipesteps', views.RecipeStepViewSet, basename='recipesteps')
router.register('fooddata', views.FoodDataViewSet, basename='fooddata')
router.register('recipeingredients', views.RecipeIngredientViewSet, basename='recipeingredients')




user_data_urls = [
    path('api/useraccounts/<str:username>/userdata/', views.UserDataViewSet.as_view({'get': 'list', 'post': 'create'}), name='userdata'),
    path('api/useraccounts/<str:username>/userdata/<str:name>', views.UserDataViewSet.as_view({
        'get': 'retrieve',
        'put': 'update',
        'delete': 'destroy'
        }), name='userdata'),
    path('api/useraccounts/<str:username>/userprofile/', views.UserProfileViewSet.as_view({'get': 'list'}))
]

user_urls = [
    path('api/useraccounts/', views.UserAccountViewSet.as_view({'get': 'list', 'post': 'create'}), name='useraccounts', ),
    path('api/useraccounts/<str:username>/', views.UserAccountViewSet.as_view({
        'get': 'retrieve',
        'put': 'update',
        'delete': 'destroy'
        }), name='useraccounts-detail')
] + user_data_urls

urlpatterns = [
    #path('api/', include(router.urls)),
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    #path('useraccounts/<str:pk>/', views.UserAccountDetail.as_view()),
    #path('recipes/', views.RecipeList.as_view()),
    #path('recipess/<str:pk>/', views.RecipeDetail.as_view()),
] + user_urls