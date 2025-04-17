import string

from ..models.depot import Depot
from ..models.rack import Rack
from ..serializers.emplacement_serializers import *
from ..models.emplacement import Emplacement
from ..models.article import Article
from ..models.SKU import SKU
from django.db.models import Sum
from django.db.models import Q
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from ..utilities import set_next_letter
from django.db.models import Count, Q, F, Case, When, DecimalField, ExpressionWrapper
from django.core import serializers


#path : emplacement
@api_view(['GET'])
def get_all_emplacement(request):
    try:
        emplacements = Emplacement.objects.all().order_by('num_emplacement')

        return Response({"success":True,"emplacement":EmplacementSerializer(emplacements,many=True).data},
                            status=status.HTTP_200_OK
                        )

    except Emplacement.DoesNotExist:
         return Response({"success":True,"emplacement":"Aucun emplacement enregistré"},
                            status=status.HTTP_200_OK
                         )

    except Exception as e:
        return Response({"error": "An unexpected error occurred: " + str(e)},
                            status=status.HTTP_500_INTERNAL_SERVER_ERROR
                        )

#path : emplacement/<str:num_emplacement>
@api_view(['GET'])
def get_specific_emplacement(request,num_emplacement):
    try:
        emplacement = Emplacement.objects.get(num_emplacement=num_emplacement)

        return Response({"success": True, "emplacement": EmplacementSerializer(emplacement).data},
                            status=status.HTTP_200_OK
                        )

    except Emplacement.DoesNotExist:
        return Response({"success": False, "emplacement": "Aucun emplacement ayant ce numéro"},
                            status=status.HTTP_200_OK
                        )

    except Exception as e:
        return Response({"error": "An unexpected error occurred: " + str(e)},
                            status=status.HTTP_500_INTERNAL_SERVER_ERROR
                        )

#path : generate-emplacement/<str:num_rack>
@api_view(['POST'])
def generate_emplacement(request,num_rack):
    try:
        rack      = Rack.objects.get(num_rack=num_rack.upper())
        nb_rangee = rack.nb_rangee
        nb_niveau = rack.nb_niveau
        alphabet  = list(string.ascii_uppercase)
        liste_emplacements = []

        for i in range(nb_rangee):
            j = 0
            num_rangee = alphabet[i]

            while j < nb_niveau:
                num_niveau      = j
                num_emplacement = num_rack.upper()+num_rangee+str(num_niveau)
                emplacement     = Emplacement(num_emplacement=num_emplacement,
                                              num_rangee=num_rangee,
                                              num_niveau=num_niveau,
                                              num_rack=rack,
                                             )
                liste_emplacements.append(num_emplacement)
                emplacement.generate_qr()
                emplacement.setVolumeLibre()
                emplacement.setChargeLibre()
                emplacement.save()
                j += 1

        return Response({"success":True,"rackExist":True,"liste_emplacement": liste_emplacements},
                            status=status.HTTP_201_CREATED
                        )

    except Rack.DoesNotExist:
        return Response({"success":False,"rackExist":False})

    except Exception as e:
        return Response({"error": "An unexpected error occurred: " + str(e)},
                            status=status.HTTP_500_INTERNAL_SERVER_ERROR
                        )

#path : add-part/<str:num_rack>(?nb_rangee=<int:nb_rangee>&nb_niveau=<int:nb_niveau>)
@api_view(['GET'])
def add_rack_part(request,num_rack):
    try:
        alphabet                = list(string.ascii_uppercase)
        rack                    = Rack.objects.get(num_rack=num_rack.upper())
        existing_emplacement    = Emplacement.objects.filter(num_rack=num_rack.upper())
        increment_rangee_value  = int(request.query_params.get('nb_rangee'))
        increment_niveau_value  = int(request.query_params.get('nb_niveau'))

        if increment_rangee_value > 0 and  increment_niveau_value == 0:
            last_rangee = existing_emplacement.order_by('-num_rangee').first().num_rangee
            nb_niveau   = rack.nb_niveau

            for i in range(increment_rangee_value):
                j = 0
                num_rangee = set_next_letter(last_rangee)
                last_rangee = num_rangee

                while j < nb_niveau:
                    num_niveau      = j
                    num_emplacement = num_rack.upper()+num_rangee+str(num_niveau)
                    emplacement     = Emplacement(num_emplacement=num_emplacement,
                                                  num_rangee=num_rangee,
                                                  num_niveau=num_niveau,
                                                  num_rack=rack,
                                                  )
                    emplacement.generate_qr()                              
                    emplacement.save()
                    j += 1

            rack.nb_rangee += increment_rangee_value
            rack.save()

            return Response({"success":True}, status=status.HTTP_201_CREATED)

        if increment_niveau_value > 0 and increment_rangee_value == 0:
            last_niveau = existing_emplacement.order_by('-num_niveau').first().num_niveau
            nb_rangee   = rack.nb_rangee
            num_niveau  = last_niveau

            i = 0
            while i < increment_niveau_value:
                num_niveau += 1
                for j in range(nb_rangee):
                    num_rangee      = alphabet[j]
                    num_emplacement = num_rack.upper()+num_rangee+str(num_niveau)
                    emplacement     = Emplacement(num_emplacement=num_emplacement,
                                                  num_rangee=num_rangee,
                                                  num_niveau=num_niveau,
                                                  num_rack=rack,
                                                  )
                    emplacement.generate_qr()                              
                    emplacement.save()
                i += 1

            rack.nb_niveau += increment_niveau_value
            rack.save()

            return Response({"success":True}, status=status.HTTP_201_CREATED)

        if increment_niveau_value > 0 and increment_rangee_value > 0:
            rangee = existing_emplacement.order_by('-num_rangee','-num_niveau').first()
            last_rangee = rangee.num_rangee
            last_niveau = rangee.num_niveau
            nb_rangee   = rack.nb_rangee + increment_rangee_value
            nb_niveau   = rack.nb_niveau + increment_niveau_value

            for i in range(nb_rangee):
                num_rangee = alphabet[i]
                j = 0
                num_niveau = last_niveau + 1
                while j < increment_niveau_value:
                    num_emplacement = num_rack.upper() + num_rangee + str(num_niveau)
                    emplacement     = Emplacement(num_emplacement=num_emplacement,
                                                  num_rangee=num_rangee,
                                                  num_niveau=num_niveau,
                                                  num_rack=rack, )
                    emplacement.generate_qr()                              
                    emplacement.save()
                    num_niveau += 1
                    j += 1

            k = 0
            while k <= last_niveau:
                num_niveau = k

                for i in range(increment_rangee_value):
                    num_rangee = set_next_letter(last_rangee)
                    num_emplacement = num_rack.upper() + num_rangee + str(num_niveau)
                    emplacement = Emplacement(num_emplacement=num_emplacement,
                                              num_rangee=num_rangee,
                                              num_niveau=num_niveau,
                                              num_rack=rack)
                    emplacement.generate_qr()
                    emplacement.save()
                k += 1
            rack.nb_rangee += increment_rangee_value
            rack.nb_niveau += increment_niveau_value
            rack.save()
            return Response({"success": True},
                                status=status.HTTP_201_CREATED
                            )

    except Emplacement.DoesNotExist:
        return Response({"error":"Erreur mors de l'insertion d'un emplacement"})

    except Rack.DoesNotExist:
        return Response({"success":False,"rack":"Aucun rack correspondant"})

    except Exception as e :
        return Response({"error": "An unexpected error occurred: " + str(e)},
                            status=status.HTTP_500_INTERNAL_SERVER_ERROR
                        )
#path : insert-article/<str:num_emplacement>/<str:barcode>/<int:quantite>)
@api_view(['POST'])
def insert_article(request,num_emplacement,barcode,quantite):
    try:
        emplacement = Emplacement.objects.get(num_emplacement= num_emplacement)
        emplacement_barcode = emplacement.barcode_article
        same_barcode = False

        if emplacement_barcode == barcode:
            same_barcode = True

        emplacement.update_quantite(num_emplacement,barcode,quantite)
        emplacement.save()
        return Response({"success": True,"same_barcode":same_barcode},
                        status=status.HTTP_200_OK
                        )
    except Emplacement.DoesNotExist:
        return Response({"success":False,"emplacement":"Cet emplacement n'existe pas"})

    except Exception as e :
        return Response({"error": "An unexpected error occurred: " + str(e)},
                            status=status.HTTP_500_INTERNAL_SERVER_ERROR
                        )
#path : move-article/<str:num_emplacement>/<str:barcode>/<int:quantite>/<str:new_num_emplacement>)
@api_view(['POST'])
def move_article(request,num_emplacement,quantite,new_num_emplacement):
    try:
        old_emplacement = Emplacement.objects.get(num_emplacement=num_emplacement)
        old_emplacement_quantite = old_emplacement.quantite
        reste_quantite = old_emplacement_quantite - quantite
        if(reste_quantite < 0):
            return Response({"success": False,"emplacement": "Article à déplacer insuffisant"},
                            status=status.HTTP_200_OK
                            )
        old_emplacement.quantite = reste_quantite

        if reste_quantite == 0:
            old_emplacement.barcode_article = ""

        old_emplacement.save()


        new_emplacement = Emplacement.objects.get(num_emplacement=new_num_emplacement)
        new_emplacement_barcode = new_emplacement.barcode_article
        same_barcode = False

        if ((new_emplacement_barcode != None) or new_emplacement_barcode == "") and new_emplacement_barcode == barcode:
            same_barcode = True
        else:
            new_emplacement.quantite = quantite

        new_emplacement.update_quantite(quantite=quantite)
        new_emplacement.save()


        return Response({"success": True, "old": num_emplacement,
                         "new": new_num_emplacement,
                         "same_barcode":same_barcode,
                         "emplacement_old":EmplacementSerializer(old_emplacement).data,
                         "new_emplacement":EmplacementSerializer(new_emplacement).data},
                        status=status.HTTP_200_OK
                        )

    except Exception as e:
        return Response({"error": "An unexpected error occurred: " + str(e)},
                        status=status.HTTP_500_INTERNAL_SERVER_ERROR
                        )

#path: full-informations/<str:num_emplacement>
@api_view(['GET'])
def get_single_emplacement_full_information(request,num_emplacement):
    try:
        emplacement = Emplacement.objects.get(num_emplacement=num_emplacement)
        rangee = emplacement.num_rangee
        niveau = emplacement.num_niveau
        charge_max= emplacement.charge_libre
        capacite_max = emplacement.volume_libre
        quantite = emplacement.quantite

        rack    = emplacement.num_rack.num_rack_dans_couloir
        couloir = emplacement.num_rack.num_couloir.nom_couloir
        depot   = emplacement.num_rack.num_couloir.num_depot

        informations = {
            "emplacement" : num_emplacement,
            "charge": charge_max,
            "capacite" : capacite_max,
            "rangee": rangee,
            "niveau" : niveau,
            "rack" : rack,
            "couloir": couloir,
            "depot" : depot,
            "quantite" : quantite
        }

        return Response({"success":True,"informations": informations},status= status.HTTP_200_OK)
    except Exception as e:
        return Response({"error": "An unexpected error occurred: " + str(e)},
                        status=status.HTTP_500_INTERNAL_SERVER_ERROR
                        )

#path : get-by-rack/<str:num_rack>
@api_view(['GET'])
def get_emplacement_by_rack(request,num_rack):
    try:
        emplacement = Emplacement.objects.filter(num_rack=num_rack).order_by('num_rangee','num_niveau')

        return Response({"success":True,"emplacement":EmplacementSerializer(emplacement,many=True).data},status= status.HTTP_200_OK)

    except Emplacement.DoesNotExist:
        return Response({"success": False, "emplacement": "Cet emplacement n'existe pas"})

    except Exception as e:
        return Response({"error": "An unexpected error occurred: " + str(e)},
                        status=status.HTTP_500_INTERNAL_SERVER_ERROR
                        )

@api_view(['GET'])
def delete_all(request):
    try:
        Emplacement.objects.all().delete()
        return Response({"success": False, "emplacement": "Cet emplacement n'existe pas"})

    except Exception as e:
        return Response({"error": "An unexpected error occurred: " + str(e)},
                        status=status.HTTP_500_INTERNAL_SERVER_ERROR
                        )

#path: filter-emplacement/<str: num_rack>/<str:search_input>
@api_view(['GET'])
def filter_emplacement(request,search_input,num_rack):
    try:
        emplacements = Emplacement.objects.filter((Q(num_emplacement__icontains=search_input) | Q(num_rack=num_rack)))

        return Response({"success":True,"emplacement":EmplacementSerializer(emplacements,many=True).data})

    except Exception as e:
        return Response({"error": "An unexpected error occurred: " + str(e)},
                        status=status.HTTP_500_INTERNAL_SERVER_ERROR
                        )

@api_view(['POST'])
def update_volume_occupee(request,quantite,num_emplacement):
    try:
        emplacement = Emplacement.objects.get(num_emplacement=num_emplacement)
        emplacement.update_quantite(quantite)
        emplacement.save()
        return Response({"success": True, "emplacement": EmplacementSerializer(emplacement).data})

    except Exception as e:
        return Response({"error": "An unexpected error occurred: " + str(e)},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                    )

#path : update-volume/<str:num_emplacement>
@api_view(['POST'])
def update_emplacement_properties(request,num_emplacement):
    try:
        volume_occupee = Article.objects.filter(sku__num_emplacement=num_emplacement).aggregate(sum=Sum('volume_article'))['sum']
        charge_occupee = Article.objects.filter(sku__num_emplacement=num_emplacement).aggregate(sum=Sum('poids_article'))['sum']
        emplacement    = Emplacement.objects.get(num_emplacement=num_emplacement)

        if volume_occupee == None:
            volume_occupee = 0

        emplacement.volume_occupe = volume_occupee
        emplacement.charge_occupee = charge_occupee
        emplacement.calcul_capacite_libre()
        emplacement.calcul_charge_libre()
        emplacement.calcul_quantite()
        emplacement.save()

        return Response({"success": True},status=status.HTTP_200_OK)

    except Exception as e:
        return Response({"error": "An unexpected error occurred: " + str(e)},
                        status=status.HTTP_500_INTERNAL_SERVER_ERROR
                        )

#path: emplacement-vide
@api_view(['GET'])
def get_emplacements_vides(request):
    try:
        emplacements = Emplacement.objects.filter(quantite=0).count()

        return Response({"success":True,"emplacements":emplacements},status=status.HTTP_200_OK)

    except Exception as e:
        return Response({"error": "An unexpected error occurred: " + str(e)},
                        status=status.HTTP_500_INTERNAL_SERVER_ERROR
                        )

# emplacements-vide-pourcentage/<int:limit>
@api_view(['GET'])
def get_vide_percentage_per_depot(request,limit):
    try:
        if limit == 0:
            results = (
                Depot.objects.annotate(
                    total_count=Count('couloir__rack__emplacement'),
                    full_count=Count('couloir__rack__emplacement', filter=Q(couloir__rack__emplacement__quantite__gt=0)),
                    percentage=ExpressionWrapper(
                        Case(
                            When(total_count__gt=0, then=F('full_count') * 100.0 / F('total_count')),
                            default=0,
                            output_field=DecimalField(),
                        ),
                        output_field=DecimalField(),
                    ),
                ).values('num_depot', 'total_count', 'full_count', 'percentage').order_by('percentage')
            )
        else:
            results = (
                Depot.objects.annotate(
                    total_count=Count('couloir__rack__emplacement'),
                    full_count=Count('couloir__rack__emplacement',
                                     filter=Q(couloir__rack__emplacement__quantite__gt=0)),
                    percentage=ExpressionWrapper(
                        Case(
                            When(total_count__gt=0, then=F('full_count') * 100.0 / F('total_count')),
                            default=0,
                            output_field=DecimalField(),
                        ),
                        output_field=DecimalField(),
                    ),
                ).values('num_depot', 'total_count', 'full_count', 'percentage').order_by('percentage')
            )[:limit]
        return Response({"success":True,"result":results,"count":len(results)},status=status.HTTP_200_OK)

    except Exception as e:
        return Response({"error": "An unexpected error occurred: " + str(e)},
                        status=status.HTTP_500_INTERNAL_SERVER_ERROR
                        )
