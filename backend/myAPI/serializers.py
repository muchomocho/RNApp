from rest_framework import serializers
from .models import Recipe, UserAccount

'''
class UserAccountSerializer(serializers.Serializer):
    user_ID = serializers.CharField(max_length=30)
    email = serializers.EmailField()


    def create(self, validated_data):
        return UserAccount.objects.create(validated_data)

    
    def update(self, instance, validated_data):
        instance.user_ID = validated_data.get('title', instance.user_ID)
        instance.email = validated_data.get('email', instance.email)
'''

class UserAccountModelSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserAccount
        fields = ['user_ID', 'email']

class RecipeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Recipe
        fields = ['id', 'user_ID', 'title', 'main_image_url']