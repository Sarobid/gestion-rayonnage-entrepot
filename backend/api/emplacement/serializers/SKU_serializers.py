from rest_framework import serializers
from ..models.SKU import SKU

class SKUSerializer(serializers.ModelSerializer):
    class Meta:
        model = SKU
        fields = '__all__'