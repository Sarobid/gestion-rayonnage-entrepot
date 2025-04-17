from rest_framework import serializers
from ..models.achat import Achat

class AchatSerializer(serializers.ModelSerializer):
    class Meta:
        model = Achat
        fields = '__all__'

