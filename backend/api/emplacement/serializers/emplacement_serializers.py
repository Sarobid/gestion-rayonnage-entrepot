from rest_framework import serializers
from ..models.emplacement import Emplacement
class EmplacementSerializer(serializers.ModelSerializer):
    class Meta:
        model = Emplacement
        fields = '__all__'

class NumEmplacementSerializer(serializers.ModelSerializer):
    class Meta:
        model = Emplacement
        fields= ["num_emplacement"]

