from posixpath import basename
from django.urls import path, include
from . import views
from rest_framework.routers import DefaultRouter

router = DefaultRouter()
router.register('recipes', views.RecipeViewSet, basename='recipes')

urlpatterns = [
    path('api/', include(router.urls)),
    #path('useraccounts/', views.UserAccountList.as_view()),
    #path('useraccounts/<str:pk>/', views.UserAccountDetail.as_view()),
    #path('recipes/', views.RecipeList.as_view()),
    #path('recipess/<str:pk>/', views.RecipeDetail.as_view()),
]