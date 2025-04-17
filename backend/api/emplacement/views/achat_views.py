from datetime import datetime
from ..serializers.achat_serializer import *
from ..models.achat import Achat
from ..models.article import Article
from rest_framework.response import Response
from rest_framework import status
from rest_framework.decorators import api_view

# save-achat
@api_view(['POST'])
def save_achat(request):
    try:
        ref_interne = request.data.get('ref_interne')
        quantite = request.data.get('quantite')
        date_string = request.data.get('date_achat')
        date = datetime.strptime(date_string,'%Y-%m-%d').date()
        article = Article.objects.get(ref_interne=ref_interne)
        achat = Achat(
            ref_interne = article,
            quantite = quantite,
            date_achat = date
        )

        achat.save()

        return Response({"success":True,"achat":AchatSerializer(achat).data},status=status.HTTP_201_CREATED)

    except Article.DoesNotExist:
        return Response({"success":False,"error": "Cet article n'existe pas"},
                        status=status.HTTP_204_NO_CONTENT,
                        )


    except Exception as e:
        return Response({"error": "An unexpected error occurred: " + str(e)},
                        status=status.HTTP_500_INTERNAL_SERVER_ERROR
                        )

# get-all-achat
@api_view(['GET'])
def get_all_achat(request):
    try:
        achat = Achat.objects.all()

        return Response({"success":True,"achat":AchatSerializer(achat,many=True).data},status=status.HTTP_200_OK)


    except Exception as e:
        return Response({"error": "An unexpected error occurred: " + str(e)},
                        status=status.HTTP_500_INTERNAL_SERVER_ERROR
                        )