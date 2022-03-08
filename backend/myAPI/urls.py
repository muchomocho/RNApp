from posixpath import basename
from django.urls import path, include
from . import views
from rest_framework.routers import DefaultRouter

router = DefaultRouter()
router.register('useraccounts', views.UserAccountViewSet, basename='useraccounts')
router.register('userrecords', views.UserRecordViewSet, basename='userrecords')
router.register('recipes', views.RecipeViewSet, basename='recipes')
router.register('tags', views.TagViewSet, basename='tags')
router.register('comments', views.CommentViewSet, basename='comments')
router.register('recipesteps', views.RecipeStepViewSet, basename='recipesteps')
router.register('ingredients', views.IngredientViewSet, basename='ingredients')

urlpatterns = [
    path('api/', include(router.urls)),
    #path('useraccounts/', views.UserAccountList.as_view()),
    #path('useraccounts/<str:pk>/', views.UserAccountDetail.as_view()),
    #path('recipes/', views.RecipeList.as_view()),
    #path('recipess/<str:pk>/', views.RecipeDetail.as_view()),
]