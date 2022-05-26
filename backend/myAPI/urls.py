from django.urls import path, include
from . import views
from healthydiet import settings
from django.conf.urls.static import static
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
recipe_url_detail = recipe_url_base + '<int:recipe_id>/'
recipe_url_nutrients = recipe_url_base + '<int:recipe_id>/nutrients/'

recipe_urls = [
    path(recipe_url_base, views.RecipeViewSet.as_view(
        {'get': 'list', 'post': 'create'}), name='recipe'),
    path(recipe_url_detail, views.RecipeViewSet.as_view({
        'get': 'retrieve',
        'put': 'update',
        'delete': 'destroy'
    }), name='recipe-detail'),
    path(recipe_url_nutrients, views.RecipeNutrientViewSet.as_view(
        {'get': 'retrieve'}), name='recipe-nutrient'),
]

# url for recipe tags, extended from recipe url
# model : `~myAPI.RecipeTag`
recipetag_url_base = recipe_url_detail + 'tags/'
recipetag_url_detail = recipetag_url_base + '<int:recipetag_id>/'

recipetag_urls = [
    path(recipetag_url_base, views.RecipeTagViewSet.as_view(
        {'get': 'list', 'post': 'create'}), name='recipetag'),
    path(recipetag_url_detail, views.RecipeTagViewSet.as_view({
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
    path(recipecomment_url_base, views.RecipeCommentViewSet.as_view(
        {'get': 'list', 'post': 'create'}), name='recipecomment'),
    path(recipecomment_url_detail, views.RecipeCommentViewSet.as_view({
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
# model : `~myAPI.subuser`
subuser_url_base = useraccount_url_detail + 'subuser/'
subuser_url_detail = subuser_url_base + '<str:subuser_id>/'

subuser_urls = [
    path(subuser_url_base, views.SubuserViewSet.as_view(
        {'get': 'list', 'post': 'create'}), name='subuser'),
    path(subuser_url_detail, views.SubuserViewSet.as_view({
        'get': 'retrieve',
        'put': 'update',
        'delete': 'destroy'
    }), name='subuser-detail'),
    path(useraccount_url_detail + 'userprofile/',
         views.UserProfileViewSet.as_view({'get': 'retrieve'}), name='userprofile')
]

request_from_url = useraccount_url_detail + 'request-from/'
request_to_url = useraccount_url_detail + 'request-to/'
request_from_url_detail = request_from_url + '<request_id>/'
request_to_url_detail = request_to_url + '<request_id>/'

userrequest_urls = [
    path(request_from_url, views.UserShareRequestReceivedViewSet.as_view(
        {'get': 'list'}), name='request-from'),
    path(request_to_url, views.UserShareRequestSentViewSet.as_view(
        {'get': 'list', 'post': 'create'}), name='request-to'),
    path(request_from_url_detail, views.UserShareRequestReceivedViewSet.as_view(
        {'delete': 'destroy'}), name='request-from'),
    path(request_to_url_detail, views.UserShareRequestSentViewSet.as_view(
        {'delete': 'destroy'}), name='request-to'),
]

share_url = useraccount_url_detail + 'share/'
usershare_urls = [
    path(share_url, views.UserShareViewSet.as_view(
        {'post': 'create'}), name='share'),
]

# model : `~myAPI.UserMealRecord`
# gets a formatted version of meal record nutrition data
userrecord_url_base = subuser_url_detail + 'userrecord/'
userrecord_url_detail = userrecord_url_base + '<str:date>/'
userrecord_url_date_range = userrecord_url_detail + 'from/<str:from>/'

recipe_url_recommendation = subuser_url_detail + 'reciperecommendation/'

recipe_url_personal = useraccount_url_detail + 'myrecipes/'
recipe_url_personal_detail = recipe_url_personal + '<int:myrecipe_id>/'

fooddata_url_personal = useraccount_url_detail + 'myfooddata/'
fooddata_url_personal_detail = fooddata_url_personal + '<int:myfood_id>/'

userrecord_urls = [
    path(userrecord_url_date_range, views.UserRecordViewSet.as_view(
        {'get': 'list'}), name='userrecord-daterange'),
    path(userrecord_url_detail, views.UserRecordViewSet.as_view({
        'get': 'retrieve',
    }), name='userrecord-detail'),
    path(recipe_url_recommendation, views.RecipeRecommendationViewSet.as_view(
        {'get': 'list'}), name='recipe-recommendation'),
    path(recipe_url_personal, views.PersonalRecipeViewSet.as_view(
        {'get': 'list'}), name='recipe-personal'),
    path(fooddata_url_personal, views.PersonalFoodDataViewSet.as_view(
        {'get': 'list'}), name='food-personal'),
    path(recipe_url_personal_detail, views.PersonalRecipeViewSet.as_view(
        {'delete': 'destroy'}), name='recipe-personal-delete'),
    path(fooddata_url_personal_detail, views.PersonalFoodDataViewSet.as_view(
        {'delete': 'destroy'}), name='food-personal-delete')
]

# model : `~myAPI.UserMealRecord`
usermealrecord_url_base = subuser_url_detail + 'usermealrecord/'
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
useraccount_urls += subuser_urls + userrecord_urls + usermealrecord_urls

urlpatterns = [
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]\
    + useraccount_urls\
    + userrequest_urls \
    + usershare_urls \
    + recipe_urls\
    + fooddata_urls\
    + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
