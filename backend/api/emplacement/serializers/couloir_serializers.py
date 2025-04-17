from rest_framework import serializers
from ..models.couloir import Couloir

class CouloirSerializer(serializers.ModelSerializer):
    class Meta:
        model = Couloir
        fields = '__all__'

class CreateCouloirSerializer(serializers.ModelSerializer):
    class Meta:
        model = Couloir
        fields= '_all__'

