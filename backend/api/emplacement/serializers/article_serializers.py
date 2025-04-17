from rest_framework import serializers
from ..models.article import Article

class ArticleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Article
        fields = '__all__'

class EmplacementSuggestionSerializer(serializers.Serializer):
    num_depot = serializers.CharField()
    nom_couloir = serializers.CharField()
    num_emplacement = serializers.CharField()
    gaspillage = serializers.FloatField()
    quantite = serializers.IntegerField(required=False, allow_null=True)
