from django.db.models.expressions import result

from ..models.depot import Depot
from ..serializers.SKU_serializers import *
from rest_framework import status
from rest_framework.decorators import api_view
from ..models.SKU import SKU
from ..models.emplacement import Emplacement
from ..models.article import Article
from rest_framework.response import Response
from django.db.models import Count, Q, F, Case, When, FloatField, ExpressionWrapper

#path: create-sku
@api_view(['POST'])
def create_SKU(request):
    try:
        code_barre_produit = request.data.get("code_barre_produit")
        article_correspondant = request.data.get("article_correspondant")
        num_emplacement = request.data.get("num_emplacment")

        sku = SKU(
            code_barre_produit = code_barre_produit,
            article_correspondant = article_correspondant,
            num_emplacement = num_emplacement
        )

        sku.save()

        return Response({"success": True, "sku": SKUSerializer(sku).data}, status=status.HTTP_201_CREATED)

    except sku.DoesNotExist:
        return Response({"error": "Echec lors de la création de l'article"},
                    status=status.HTTP_204_NO_CONTENT,
                    )

#path: update-sku/<str:codebarre>
@api_view(['POST'])
def update_sku(request,codebarre):
    try:
        num_emplacement = request.data.get("num_emplacement")
        emplacement = Emplacement.objects.get(num_emplacement=num_emplacement)
        sku = SKU.objects.get(code_barre_produit=codebarre)

        sku.num_emplacement = emplacement

        sku.save()

        return Response({"success": True, "sku": SKUSerializer(sku).data}, status=status.HTTP_201_CREATED)

    except SKU.DoesNotExist:
        return Response({"error": "Echec lors de la création de l'article"},
                    status=status.HTTP_204_NO_CONTENT,
                    )

@api_view(['POST'])
def bulk_create(request,ref_interne):
    try:
        listeCodebarre = request.data.get('liste_codebarre')
        article = Article.objects.get(ref_interne= ref_interne.upper())
        skus = []
        for codebarre in listeCodebarre:
            sku = SKU(code_barre_produit=codebarre,
                      num_emplacement = None,
                      article_correspondant = article)
            skus.append(sku)
        SKU.objects.bulk_create(skus)

        article.set_quantite()
        article.save()


        return Response({"success": True, "nb_insert": len(listeCodebarre)}, status=status.HTTP_200_OK)

    except Exception as e:
        return Response({"error": "An unexpected error occurred: " + str(e)},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                    )

@api_view(['POST'])
def bulk_update(request, num_emplacement):
    try:
        listeCodebarre = request.data.get('liste_codebarre')
        if num_emplacement == "null":
            emplacement = None
        else:
            emplacement = Emplacement.objects.get(num_emplacement=num_emplacement)

        for codebarre in listeCodebarre:
            sku = SKU.objects.get(code_barre_produit=codebarre)
            sku.num_emplacement = emplacement
            sku.save()
            sku.article_correspondant.set_quantite_rayon()


        emplacements = Emplacement.objects.all()

        for emplacement in emplacements:
            emplacement.calcul_quantite()

        Emplacement.objects.bulk_update(emplacements,['quantite'])



        return Response({"success":True,"nb_insert":len(listeCodebarre)},status=status.HTTP_200_OK)

    except Exception as e:
        return Response({"error": "An unexpected error occurred: " + str(e)},
                        status=status.HTTP_500_INTERNAL_SERVER_ERROR
                        )

@api_view(['GET'])
def get_sku(request,codebarre):
    try:
        sku = SKU.objects.get(code_barre_produit=codebarre)

        return Response({"success": True,"sku":SKUSerializer(sku).data})

    except SKU.DoesNotExist:
        return Response({"success":False},
                        status=status.HTTP_204_NO_CONTENT,
                        )

    except Exception as e:
        return Response({"error": "An unexpected error occurred: " + str(e)},
                            status=status.HTTP_500_INTERNAL_SERVER_ERROR
                        )

@api_view(['GET'])
def get_all_sku(request):
    try:
        sku= SKU.objects.all()

        return Response({"success": True, "sku": SKUSerializer(sku,many=True).data})

    except SKU.DoesNotExist:
        return Response({"success": False},
                    status=status.HTTP_204_NO_CONTENT,
                    )

    except Exception as e:
        return Response({"error": "An unexpected error occurred: " + str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )

#path: sku-info/<str:codebarre>
@api_view(['GET'])
def get_sku_info(request,codebarre):
    try:
        article = Article.objects.filter(sku__code_barre_produit=codebarre).first()
        article_poids =  article.poids_article
        article_volume = article.volume_article
        article_quantite = article.quantite_en_stock
        informations = {
            'poids' : article_poids,
            'volume' : article_volume,
            'quantite' : article_quantite
        }

        return Response({"success":True,"article": informations},status=status.HTTP_200_OK)

    except Article.DoesNotExist:
        return Response({"success": False},
                        status=status.HTTP_204_NO_CONTENT,
                        )

    except Exception as e:
        return Response({"success":False,"error": "An unexpected error occurred: " + str(e)},
                        status=status.HTTP_500_INTERNAL_SERVER_ERROR
                        )

@api_view(['GET'])
def get_oldest_emplacement(request,ref_interne):
    try:
        emplacements = SKU.objects.filter(article_correspondant=ref_interne,num_emplacement__isnull=False).values('num_emplacement','num_emplacement__quantite','date_arrivage').order_by('date_arrivage').distinct()

        return Response({"success":True,"result": emplacements},status=status.HTTP_200_OK)

    except Exception as e:
        return Response({"error": "An unexpected error occurred: " + str(e)},
                        status=status.HTTP_500_INTERNAL_SERVER_ERROR
                        )
#get-sku-emplacement/<str:ref_interne>
@api_view(['GET'])
def get_emplacement(request,ref_interne):
    try:
        emplacements = SKU.objects.filter(article_correspondant=ref_interne,num_emplacement__isnull=False).values('num_emplacement','num_emplacement__quantite').distinct()

        return Response({"success":True,"result":emplacements},status=status.HTTP_200_OK)

    except Exception as e:
        return Response({"error": "An unexpected error occurred: " + str(e)},
                        status=status.HTTP_500_INTERNAL_SERVER_ERROR
                        )

#sku/emplacement
@api_view(['POST'])
def get_sku_in_emplacement(request):
    try:
        num_emplacements = request.data.get('num_emplacements')
        skus = SKU.objects.filter(num_emplacement__in=num_emplacements).values('code_barre_produit')

        return Response({"success": True,"skus": skus},status=status.HTTP_200_OK)


    except Exception as e:
        return Response({"error": "An unexpected error occurred: " + str(e)},
                        status=status.HTTP_500_INTERNAL_SERVER_ERROR
                        )

from ..optimisation import *

# sku/oldest_emplacement
@api_view(['POST'])
def get_old_articles_emplacement(request):
    try:
        ref_article = request.data.get('ref_interne')
        nb_articles_demande = request.data.get('nb_articles')

        emplacements = Depot.objects.select_related(
             'couloir__rack__emplacement__sku',
        ).filter(
            couloir__rack__emplacement__sku__article_correspondant=ref_article,
            couloir__rack__emplacement__sku__num_emplacement__isnull=False
        ).values(
            'num_depot',
            'nom_depot',
            'couloir__nom_couloir',
            'couloir__rack__num_rack_dans_couloir',
            'couloir__rack__emplacement__num_rangee',
            'couloir__rack__largeur_case',
            'couloir__rack__emplacement__num_emplacement',
            'couloir__rack__emplacement__quantite',
            'couloir__rack__emplacement__sku__date_arrivage',
        ).order_by(
            'couloir__rack__emplacement__sku__date_arrivage',
            'couloir__rack__emplacement__sku__num_emplacement'
        ).distinct()

        emplacement_necessaire_pour_quantite = []
        quantites_manquantes = 0

        if len(emplacements) <= 0:
            return Response({"success": True, "result": emplacement_necessaire_pour_quantite,
                             "insuffisance": abs(quantites_manquantes)}, status=status.HTTP_200_OK)

        somme_quantite = 0
        for emplacement in emplacements:
             somme_quantite = somme_quantite + emplacement['couloir__rack__emplacement__quantite']
             emplacement_necessaire_pour_quantite.append(emplacement)

             if somme_quantite >= nb_articles_demande:
                 break

        if somme_quantite < nb_articles_demande:
            quantites_manquantes = somme_quantite - nb_articles_demande

        filtered_data = filter_data(emplacement_necessaire_pour_quantite)

        routes = []
        for depot in filtered_data:
            route= []
            for emplacement in depot['emplacements']:
                emplacement['longueur_rack_prec'] = 0

                if emplacement['num_rack_dans_couloir'] > 1:
                    longueur_rack_prec = 0
                    racks = Depot.objects.select_related(
                         'couloir__rack',
                    ).filter(
                        couloir__rack__num_rack_dans_couloir__lt = emplacement['num_rack_dans_couloir'],
                        num_depot = depot['depot'],
                        couloir__nom_couloir = emplacement['couloir']
                    ).annotate(
                        longueur_rack= ExpressionWrapper(F('couloir__rack__largeur_case') * F('couloir__rack__nb_rangee')

                        , output_field = FloatField())
                    ).values(
                        'longueur_rack'
                    )

                    for rack in racks:
                        longueur_rack_prec = longueur_rack_prec + rack['longueur_rack']

                    emplacement['longueur_rack_prec'] = longueur_rack_prec

            route = get_shortest_path(depot['emplacements'])
            routes.append(route)

        arranged_liste = arrange_result_and_data(result = routes,liste_emplacement= filtered_data)
        print(arranged_liste)


        return Response({"success": True, "result": arranged_liste,"insuffisance":abs(quantites_manquantes)}, status=status.HTTP_200_OK)

    except Exception as e:
        return Response({"error": "An unexpected error occurred: " + str(e)},
                        status=status.HTTP_500_INTERNAL_SERVER_ERROR
                        )
