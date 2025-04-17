from ..utilities import set_next_letter
from ..serializers.couloir_serializers import *
from rest_framework import status
from rest_framework.decorators import api_view
from ..models.couloir import Couloir
from rest_framework.response import Response
from ..models.depot import Depot

#path: couloir
@api_view(['GET'])
def get_all_couloir(request):
    try:
        couloirs = Couloir.objects.all().order_by('num_couloir')
        return Response( {"success":True, "couloir":CouloirSerializer(couloirs,many=True).data},
                            status=status.HTTP_200_OK
                       )
    except Exception as e:
        return Response({"error": "An unexpected error occurred: " + str(e)},
                            status=status.HTTP_500_INTERNAL_SERVER_ERROR
                        )

#path: couloir/<str:num_couloir>
@api_view(['GET'])
def get_single_couloir(request,num_couloir):
    try:
        couloir = Couloir.objects.get(num_couloir=num_couloir.upper())
        return Response({"success":True,"couloir":CouloirSerializer(couloir).data},
                            status=status.HTTP_200_OK
                        )
    except Couloir.DoesNotExist:
        return Response({"error": "Aucun enregistrement de ce nom"},
                            status=status.HTTP_204_NO_CONTENT,
                        )
    except Exception as e:
        return Response({"error": "An unexpected error occurred: " + str(e)},
                            status=status.HTTP_500_INTERNAL_SERVER_ERROR
                        )

#path: create-couloir/<int:num_depot>
@api_view(['POST'])
def create_couloir(request, id_depot):
    existing_couloirs = Couloir.objects.filter(id_depot=id_depot)
    depot = Depot.objects.get(id=id_depot)
    num_depot = depot.num_depot

    try:
        if existing_couloirs.exists():
            last_couloir_nom = existing_couloirs.order_by('-nom_couloir').first().nom_couloir
            nom_couloir      = set_next_letter(last_couloir_nom)
        else:
            nom_couloir = "A"

        num_couloir = str(num_depot)+nom_couloir
        couloir     = Couloir(id_depot=depot,num_couloir=num_couloir,num_depot=num_depot,nom_couloir=nom_couloir)
        couloir.save()

        return Response({"success":True,"couloir":CouloirSerializer(couloir).data},
                            status=status.HTTP_201_CREATED
                        )
    except Exception as e:
        return Response({"error": "An unexpected error occurred: " + str(e)},
                            status=status.HTTP_500_INTERNAL_SERVER_ERROR
                        )

#path: couloir/delete/<str:num_couloir>
@api_view(['POST'])
def delete_couloir(request,num_couloir):
    try:
        couloir = Couloir.objects.get(num_couloir=num_couloir.upper())
        couloir.delete()
        return Response({"success": "Enregistrement supprimé avec succes", "deleted_id": num_couloir},
                            status=status.HTTP_200_OK
                        )
    except Couloir.DoesNotExist:
        return Response({"error": "Aucun enregistrement de ce nom"},
                            status=status.HTTP_204_NO_CONTENT
                        )
    except Exception as e:
        return Response({"error": "An unexpected error occurred: " + str(e)},
                            status=status.HTTP_500_INTERNAL_SERVER_ERROR
                        )
#path : get-couloir-by-depot/<int:num_depot>
@api_view(['GET'])
def get_couloir_by_depot(request,id_depot):
    try:
        couloir = Couloir.objects.filter(id_depot=id_depot).order_by('num_couloir')
        return Response({"success": True,"couloir":CouloirSerializer(couloir,many=True).data,"count":couloir.count()},status=status.HTTP_200_OK)

    except Couloir.DoesNotExist:
        return Response({"error": "Aucun enregistrement de ce nom"},
                        status=status.HTTP_204_NO_CONTENT
                        )
    except Exception as e:
        return Response({"error": "An unexpected error occurred: " + str(e)},
                        status=status.HTTP_500_INTERNAL_SERVER_ERROR
                        )

