from posixpath import basename
from django.urls import path, include
from . import views
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

router = DefaultRouter()
router.register('useraccounts', views.UserAccountViewSet, basename='useraccounts')
router.register('userdata', views.UserDataViewSet, basename='userdata')
router.register('userprofile', views.UserProfileViewSet, basename='userprofile')
router.register('userrecords', views.UserRecordViewSet, basename='userrecords')
router.register('recipetitles', views.RecipeTitleViewSet, basename='recipetitles')
router.register('recipes', views.RecipeViewSet, basename='recipes')
router.register('tags', views.TagViewSet, basename='tags')
router.register('comments', views.CommentViewSet, basename='comments')
router.register('recipesteps', views.RecipeStepViewSet, basename='recipesteps')
router.register('ingredients', views.IngredientViewSet, basename='ingredients')
router.register('recipeingredients', views.RecipeIngredientViewSet, basename='recipeingredients')

urlpatterns = [
    path('api/', include(router.urls)),
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    #path('useraccounts/', views.UserAccountList.as_view()),
    #path('useraccounts/<str:pk>/', views.UserAccountDetail.as_view()),
    #path('recipes/', views.RecipeList.as_view()),
    #path('recipess/<str:pk>/', views.RecipeDetail.as_view()),
]