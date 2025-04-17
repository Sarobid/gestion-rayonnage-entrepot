from datetime import datetime
from ..serializers.achat_serializer import *
from ..models.achat import Achat
from ..models.article import Article
from ..models.emplacement import Emplacement
from ..models.rack import Rack
from ..models.couloir import Couloir
from django.db.models import Sum
from django.db.models.functions import ExtractYear
from django.utils import timezone
from ..models.depot import Depot
from rest_framework.response import Response
from rest_framework import status
from rest_framework.decorators import api_view
from ..utilities import *


# proposition-emplacement/<int:num_depot>
@api_view(['GET'])
def sort_emplacement(request,num_depot):
    try:
        liste_article = []
        liste_couloir = []
        liste_article_by_amount = []
        current_year = timezone.now().year

        article_par_depot = Depot.objects.select_related(
              'couloir__rack__emplacement__sku',
        ).filter(id=num_depot,couloir__rack__emplacement__sku__num_emplacement__isnull=False).values('couloir__rack__emplacement__sku__article_correspondant').distinct()

        if len(article_par_depot) == 0:
            return Response({"success": True, "result": article_par_depot}, status=status.HTTP_200_OK)

        for result in article_par_depot:
            liste_article.append(result["couloir__rack__emplacement__sku__article_correspondant"])

        article_by_amount = (Achat.objects
                                 .annotate(year=ExtractYear('date_achat'))
                                 .filter(year=current_year,ref_interne__in=liste_article)
                                 .values('ref_interne','ref_interne__designation')
                                 .annotate(total_article_annee=Sum('quantite'))
                                 .order_by('-total_article_annee')
                                 )

        for article in article_by_amount:
            liste_article_by_amount.append({"ref_interne": article['ref_interne'], "designation": article['ref_interne__designation']})

        couloir_depot = Couloir.objects.filter(id_depot=num_depot).values('num_couloir').order_by('nom_couloir')
        for couloir in couloir_depot:
            liste_couloir.append(couloir['num_couloir'])

        rack = Depot.objects.filter(couloir__num_couloir__in = liste_couloir,couloir__rack__num_rack__isnull=False).values('num_depot',
                                                                                     'couloir__num_couloir',
                                                                                     'couloir__nom_couloir',
                                                                                     'couloir__rack__num_rack',
                                                                                     'couloir__rack__num_rack_dans_couloir',
                                                                                     'couloir__rack__nb_rangee',
                                                                                     'couloir__rack__nb_niveau')

        sorted_rack,sorted_couloir = sort_array_by_priority(liste_couloir,rack)


        sorted_emplacement = sort_emplacements(sorted_rack,liste_article_by_amount)
        return Response({"success":True,"result":sorted_emplacement},status=status.HTTP_200_OK)

    except Exception as e:
        return Response({"error": "An unexpected error occurred: " + str(e)},
                        status=status.HTTP_500_INTERNAL_SERVER_ERROR
                        )
