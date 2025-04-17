from ..models.emplacement import Emplacement
from ..serializers.article_serializers import *
from rest_framework import status
from rest_framework.decorators import api_view
from ..models.depot import Depot
from ..models.emplacement import Emplacement
from ..utilities import calculate_waste_approximity
from rest_framework.response import Response
from django.db.models import F, FloatField, ExpressionWrapper, Case, When, IntegerField

#path: create-article
@api_view(['POST'])
def create_article(request):
    try:
        ref_interne         = request.data.get("ref_interne")
        designation         = request.data.get("designation")
        prix_article        = request.data.get("prix_article")
        poids_article       = request.data.get("poids_article")
        volume_article      = request.data.get("volume_article")
        quantite_en_stock   = request.data.get("quantite_en_stock")

        article = Article(
            ref_interne         = ref_interne.upper(),
            designation         = designation,
            prix_article        = prix_article,
            poids_article       = poids_article,
            volume_article      = volume_article,
            quantite_en_stock   = quantite_en_stock
        )

        article.save()

        return Response({"success":True,"article":ArticleSerializer(article).data},status=status.HTTP_201_CREATED)

    except Article.DoesNotExist:
        return Response({"error": "Echec lors de la création de l'article"},
                        status=status.HTTP_204_NO_CONTENT,
                        )

    except Exception as e:
        return Response({"error": "An unexpected error occurred: " + str(e)},
                        status=status.HTTP_500_INTERNAL_SERVER_ERROR
                        )

@api_view(['GET'])
def get_all_article(request):
    try:
        articles = Article.objects.all()

        return  Response({"success":True,"article": ArticleSerializer(articles,many=True).data})

    except Article.DoesNotExist:
        return Response({"error": "Echec lors de la création de l'article"},
                        status=status.HTTP_204_NO_CONTENT,
                        )

    except Exception as e:
        return Response({"error": "An unexpected error occurred: " + str(e)},
                        status=status.HTTP_500_INTERNAL_SERVER_ERROR
                        )

@api_view(['GET'])
def get_article(request,ref_interne):
    try:
        article = Article.objects.get(ref_interne=ref_interne)

        return  Response({"success":True,"article": ArticleSerializer(article).data})

    except Article.DoesNotExist:
        return Response({"error": "Echec lors de la création de l'article"},
                        status=status.HTTP_204_NO_CONTENT,
                        )

    except Exception as e:
        return Response({"error": "An unexpected error occurred: " + str(e)},
                        status=status.HTTP_500_INTERNAL_SERVER_ERROR
                        )
#suggest-emplacement/<str:ref_interne>/<int:limit>/<int:quantite>
@api_view(['GET'])
def suggest_emplacement(request,ref_interne,limit,quantite):
    try:
        article = Article.objects.get(ref_interne=ref_interne)
        articlePoids = article.poids_article
        articleVolume = article.volume_article

        cases = Depot.objects.select_related(
            'couloir__rack__emplacement',
        ).filter(
            couloir__rack__emplacement__quantite=0,
        couloir__rack__emplacement__num_emplacement__isnull=False).values(
            'num_depot',
            'couloir__nom_couloir',
            'couloir__rack__charge_max_case',
            'couloir__rack__volume_case',
            'couloir__rack__emplacement__num_emplacement'
        )
        results = calculate_waste_approximity(quantite=quantite,articlePoids=articlePoids,articleVolume=articleVolume,cases=cases)
        if (limit > 0 ):
            results= results[:limit]
        return Response({"success":True,"suggestions":EmplacementSuggestionSerializer(results,many=True).data},status=status.HTTP_200_OK)

    except Exception as e:
        return Response({"error": "An unexpected error occurred: " + str(e)},
                        status=status.HTTP_500_INTERNAL_SERVER_ERROR
                        )

