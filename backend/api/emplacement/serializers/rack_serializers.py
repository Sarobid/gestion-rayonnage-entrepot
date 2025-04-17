from rest_framework import serializers
from ..models.rack import Rack


class RackSerializer(serializers.ModelSerializer):
    class Meta:
        model = Rack
        fields = '__all__'
