from ..serializers.rack_serializers import RackSerializer
from ..models.rack import Rack
from ..models.couloir import Couloir
from django.db.models import Q
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response


#path : rack
@api_view(['GET'])
def get_all_rack(request):
    try:
        racks = Rack.objects.all()

        if not racks.exists():
            return Response({"success": True,"racks": "aucun rack trouvé"},
                                status= status.HTTP_200_OK
                            )

        return Response({"success": True,"racks":RackSerializer(racks,many=True).data},
                            status= status.HTTP_200_OK
                        )

    except Rack.DoesNotExist:
        return Response({"error": "An unexpected error occurred"},
                            status=status.HTTP_500_INTERNAL_SERVER_ERROR
                        )

#path : rack/<str:num_rack>
@api_view(['GET'])
def get_specific_rack(request,num_rack):
    try:
        rack = Rack.objects.get(num_rack=num_rack.upper())
        return Response({"success": True, "rack": RackSerializer(rack).data},
                            status= status.HTTP_200_OK
                        )

    except Rack.DoesNotExist:
        return Response({"success": True, "racks": "aucun rack ayant ce numéro"},
                            status=status.HTTP_200_OK
                        )

    except Exception as e:
        return Response({"error": "An unexpected error occurred: " + str(e)},
                            status=status.HTTP_500_INTERNAL_SERVER_ERROR
                        )

#path : create-rack/<str:num_couloir>
@api_view(['POST'])
def create_rack(request,num_couloir):
    try:
       couloirs        = Couloir.objects.all()
       existing_racks  = Rack.objects.filter(num_couloir=num_couloir.upper())
       related_couloir = Couloir.objects.get(num_couloir=num_couloir.upper())

       if couloirs.exists():
           if existing_racks.exists():
               last_rack_num          = existing_racks.order_by('-num_rack_dans_couloir').first().num_rack_dans_couloir
               num_rack_dans_couloir  = last_rack_num
               num_rack_dans_couloir += 1
           else :
               num_rack_dans_couloir  = 1

           num_rack = num_couloir.upper()+str(num_rack_dans_couloir)
           nb_niveau = request.data.get('nb_niveau')
           nb_rangee = request.data.get('nb_rangee')
           charge_max = request.data.get('charge_max')
           hauteur_case = request.data.get('hauteur_case')
           largeur_case = request.data.get('largeur_case')
           profondeur_case = request.data.get('profondeur_case')
           rack     = Rack(num_rack=num_rack,
                           num_couloir=related_couloir,
                           num_rack_dans_couloir=num_rack_dans_couloir,
                           nb_niveau=nb_niveau,
                           nb_rangee=nb_rangee,
                           charge_max = charge_max,
                           hauteur_case = hauteur_case,
                           largeur_case = largeur_case,
                           profondeur_case = profondeur_case
                           )
           rack.calcul_nb_case()
           rack.calcul_capacite_case()
           rack.calcul_charge_max_case()
           rack.save()

           return Response({"success":True,"rack":RackSerializer(rack).data},
                            status=status.HTTP_201_CREATED
                           )
       else:
            return Response({"error": "Il n'existe pas encore de couloir", "couloirExist": False})

    except Couloir.DoesNotExist:
        return Response({"error":"Ce couloir n'existe pas"})

    except Exception as e:
        return Response({"error": "An unexpected error occurred: " + str(e)},
                            status=status.HTTP_500_INTERNAL_SERVER_ERROR
                        )

#path : update-rack/<str:num_rack>
@api_view(['POST'])
def update_rack(request,num_rack):
    try:
        nb_rangee       = request.data.get('nb_rangee')
        nb_niveau       = request.data.get('nb_niveau')
        charge_max      = request.data.get('charge_max')
        hauteur_case    = request.data.get('hauteur_case')
        largeur_case    = request.data.get('largeur_case')
        profondeur_case = request.data.get('profondeur_case')

        rack = Rack.objects.get(num_rack=num_rack.upper())
        rack.nb_rangee       = nb_rangee
        rack.nb_niveau       = nb_niveau
        rack.charge_max      = charge_max
        rack.hauteur_case    = hauteur_case
        rack.largeur_case    = largeur_case
        rack.profondeur_case = profondeur_case

        rack.calcul_nb_case()
        rack.calcul_capacite_case()
        rack.calcul_charge_max_case()
        rack.save()

        return Response({"success": "Rack modifie","rack": RackSerializer(rack).data},
                            status= status.HTTP_200_OK
                        )

    except Rack.DoesNotExist:
        return Response({"error": "Ce rack n'existe pas","rackExists":False})

    except Exception as e:
        return Response({"error": "An unexpected error occurred: " + str(e)},
                            status=status.HTTP_500_INTERNAL_SERVER_ERROR
                        )

#path : rack/delete/<str:num_rack>
@api_view(['POST'])
def delete_rack(request,num_rack):
    try:
        rack = Rack.objects.get(num_rack=num_rack.upper())
        rack.delete()
        return Response({"success": "Rack suprimé"},
                            status= status.HTTP_200_OK
                        )

    except Rack.DoesNotExist:
        return Response({"error": "Ce rack n'existe pas", "rackExists": False})

    except Exception as e:
        return Response({"error": "An unexpected error occurred: " + str(e)},
                            status=status.HTTP_500_INTERNAL_SERVER_ERROR
                        )

#path : search-rack/<str:search_input>
@api_view(['GET'])
def search_rack(request,search_input):
    try:
        racks = Rack.objects.filter(Q(num_rack__icontains=search_input) | Q(num_couloir__num_couloir__icontains=search_input))

        if not racks.exists():
            return Response({"success": True, "data": "aucun rack trouvé"},
                            status=status.HTTP_200_OK)

        return Response({"success":True,"data":RackSerializer(racks,many=True).data},
                            status=status.HTTP_200_OK
                        )

    except Exception as e:
        return Response({"error": "An unexpected error occurred: " + str(e)},
                        status=status.HTTP_500_INTERNAL_SERVER_ERROR
                        )
#path : get-rack-by-couloir/<str:num_couloir>
@api_view(['GET'])
def get_rack_by_couloir(request,num_couloir):
    try:
        racks = Rack.objects.all().filter(num_couloir= num_couloir)
        return Response({
            "success":True,"racks":RackSerializer(racks,many=True).data},status=status.HTTP_200_OK)

    except Exception as e:
        return Response({"error": "An unexpected error occurred: " + str(e)},
                        status=status.HTTP_500_INTERNAL_SERVER_ERROR
                        )