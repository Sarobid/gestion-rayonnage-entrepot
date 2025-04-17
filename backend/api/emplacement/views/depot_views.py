from rest_framework import status
from rest_framework.decorators import api_view,permission_classes
from rest_framework.response import Response

from ..models.article import Article
from ..serializers.depot_serializers import DepotSerializer
from ..models.depot import Depot
from django.db.models import Count, F
from rest_framework.exceptions import ValidationError
from django.db import IntegrityError
from rest_framework.permissions import IsAuthenticated
#path : create-depot
@api_view(['POST'])
def create_depot(request):
    try:
        num_depot = request.data.get('num_depot')
        nom_depot = request.data.get('nom_depot')
        contenu_depot = request.data.get('contenu')
        depot = Depot(num_depot=num_depot,nom_depot=nom_depot,contenu_depot=contenu_depot)

        depot.save()

        return Response({"success":True, "depot":DepotSerializer(depot).data},status=status.HTTP_201_CREATED)

    except IntegrityError:
        raise ValidationError("This unique_field value already exists in the database.")

    except Exception as e:
        return Response({"error": "An unexpected error occurred: " + str(e)},
                            status=status.HTTP_500_INTERNAL_SERVER_ERROR
                        )

#path : delete-depot/<int:id>
@api_view(['POST'])
def delete_depot(request, id):
    try:
        depot = Depot.objects.get(id=id)

        return Response({'success':True},status= status.HTTP_200_OK)

    except Depot.DoesNotExist:
        return Response({"success": True, "depot": "Aucun emplacement enregistré"},
                        status=status.HTTP_200_OK
                        )
    except Exception as e:
        return Response({"error": "An unexpected error occurred: " + str(e)},
                        status=status.HTTP_500_INTERNAL_SERVER_ERROR
                        )

#path : update-depot/<int:id>
@api_view(['POST'])
def update_depot(request,id):
    try:
        depot = Depot.objects.get(id=id)
        nom_depot = request.data.get('nom_depot')
        contenu_depot = request.data.get('contenu_depot')
        num_depot = request.data.get('num_depot')

        depot.num_depot = num_depot
        depot.nom_depot = nom_depot
        depot.contenu_depot = contenu_depot

        if nom_depot != None:
            depot.nom_depot = nom_depot

        if contenu_depot != None:
            depot.contenu_depot = contenu_depot

        depot.save()

        return Response({'success': True,"depot":DepotSerializer(depot).data}, status=status.HTTP_200_OK)

    except Depot.DoesNotExist:
        return Response({"success": True, "depot": "Aucun emplacement enregistré"},
                    status=status.HTTP_200_OK
                    )

    except Exception as e:
        return Response({"error": "An unexpected error occurred: " + str(e)},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                    )

#path : get-all-depot
@api_view(['GET'])
#@permission_classes([IsAuthenticated])
def get_all_depot(request):
    try:
        depot = Depot.objects.all().order_by('num_depot')
        return Response({'success': True,"depot":DepotSerializer(depot,many=True).data}, status=status.HTTP_200_OK)

    except Exception as e:
        return Response({"error": "An unexpected error occurred: " + str(e)},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                    )

#path : get-depot/<int:id>
@api_view(['GET'])
def get_specific_depot(request,id):
    try:
        depot = Depot.objects.get(id=id)

        return Response({'success': True, "depot": DepotSerializer(depot).data}, status=status.HTTP_200_OK)

    except Depot.DoesNotExist:
        return Response({'success':False,"msg":"Depot not existing"})

    except Exception as e:
        return Response({"error": "An unexpected error occurred: " + str(e)},
           status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

#path : delete-depot/<int:id>
@api_view(['POST'])
def delete_specific_depot(request,id):
    try:
        depot = Depot.objects.get(id=id)
        num_depot = depot.num_depot
        depot.delete()

        return Response({'success': True, "depot": "Dépot "+str(num_depot)+" supprimé avec succès"}, status=status.HTTP_200_OK)

    except Depot.DoesNotExist:
        return Response({'success':False,"msg":"Depot not existing"})

    except Exception as e:
        return Response({"error": "An unexpected error occurred: " + str(e)},
                   status=status.HTTP_500_INTERNAL_SERVER_ERROR
                   )

@api_view(['GET'])
def get_depot_informations(request,id):
    try:
        informations = Depot.objects.annotate(
            nb_couloir = Count('couloir',distinct=True),
            nb_rack    = Count('couloir__rack',distinct=True),
            nb_article = Count('couloir__rack__emplacement__sku',distinct=True),
        ).filter(id=id).values()

        emplacements = Depot.objects.filter(id=id, couloir__rack__emplacement__isnull = False).values('couloir__rack__emplacement__num_emplacement')
        liste_emplacements = []
        for emplacement in emplacements:
            liste_emplacements.append(emplacement['couloir__rack__emplacement__num_emplacement'])

        #articles = Article.objects.filter(sku__num_emplacement__in=liste_emplacements).values(
        #    'ref_interne', 'designation','sku__num_emplacement','sku__num_emplacement__quantite'
        #)
        articles_liste = Article.objects.filter(
            sku__num_emplacement__in=liste_emplacements
        ).distinct(
            'ref_interne'
        ).values(
            'ref_interne', 'designation', 'sku__num_emplacement', 'sku__num_emplacement__quantite'
        )

        articles = Article.objects.filter(
            sku__num_emplacement__in=liste_emplacements
        ).annotate(
            num_emplacement=F('sku__num_emplacement')
        ).distinct(
            'sku__num_emplacement'
        ).values(
            'ref_interne', 'designation', 'sku__num_emplacement', 'sku__num_emplacement__quantite'
        )



        return Response({"success":True,"result":informations,"articles":articles},status=status.HTTP_200_OK)

    except Exception as e:
        return Response({"error": "An unexpected error occurred: " + str(e)},
                   status=status.HTTP_500_INTERNAL_SERVER_ERROR
                   )

