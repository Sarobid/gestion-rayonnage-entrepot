from django.urls import path
from rest_framework_simplejwt.views import (
    TokenObtainPairView,

)
from .views.SKU_views import *
from .views.achat_views import *
from .views.article_views import create_article, get_all_article, get_article, suggest_emplacement
from .views.couloir_views import *
from .views.depot_views import create_depot, update_depot, get_all_depot, get_specific_depot, \
    delete_specific_depot, get_depot_informations
from .views.mixte_view import sort_emplacement
from .views.rack_views import *
from .views.emplacement_views import *
from .views.loginView import *
from .views.odooView import *
from .views.RefreshTokenView import CustomRefreshToken

urlpatterns = [
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', CustomRefreshToken.as_view(), name='token_refresh'),
    path('create-depot',create_depot),
    path('delete-depot/<int:id>',delete_specific_depot),
    path('update-depot/<int:id>',update_depot),
    path('get-all-depot',get_all_depot),
    path('get-depot/<int:id>',get_specific_depot),
    path('get-depot-informations/<int:id>',get_depot_informations),

    path('couloir',get_all_couloir),
    path('couloir/<str:num_couloir>',get_single_couloir),
    path('create-couloir/<int:id_depot>',create_couloir),
    path('couloir/delete/<str:num_couloir>', delete_couloir),
    path('get-couloir-by-depot/<int:id_depot>', get_couloir_by_depot),

    path('rack/',get_all_rack),
    path('rack/<str:num_rack>',get_specific_rack),
    path('create-rack/<str:num_couloir>',create_rack),
    path('update-rack/<str:num_rack>',update_rack),
    path('rack/delete/<str:num_rack>',delete_rack),
    path('search-rack/<str:search_input>', search_rack),
    path('get-rack-by-couloir/<str:num_couloir>',get_rack_by_couloir),

    path('emplacement',get_all_emplacement),
    path('emplacement/<str:num_emplacement>', get_specific_emplacement),
    path('generate-emplacement/<str:num_rack>',generate_emplacement),
    path('add-part/<str:num_rack>',add_rack_part),
    path('add-part/<str:num_rack>',add_rack_part),
    path('add-part/<str:num_rack>',add_rack_part),
    path('insert-article/<str:num_emplacement>/<str:barcode>/<int:quantite>',insert_article),
    path('move-article/<str:num_emplacement>/<str:barcode>/<int:quantite>/<str:new_num_emplacement>',move_article),
    path('filter-emplacement/<str:num_rack>/<str:search_input>', filter_emplacement),
    path('update-emplacement-properties/<str:num_emplacement>',update_emplacement_properties),
    path('emplacement-vide', get_emplacements_vides),
    path('emplacement-vide-pourcentage/<int:limit>',get_vide_percentage_per_depot),
    path('suggest-emplacement/<str:ref_interne>/<int:limit>/<int:quantite>',suggest_emplacement),

    path('full-informations/<str:num_emplacement>',get_single_emplacement_full_information),
    path('get-by-rack/<str:num_rack>',get_emplacement_by_rack),
    path('delete-all',delete_all),

    path('create-article', create_article),
    path('get-all-article', get_all_article),
    path('get-article/<str:ref_interne>', get_article),

    path('create-sku', create_SKU),
    path('update-sku/<str:codebarre>',update_sku),
    path('get-sku/<str:codebarre>',get_sku),
    path('get-all-sku',get_all_sku),
    path('bulk-update-sku/<str:num_emplacement>',bulk_update),
    path('bulk-create/<str:ref_interne>',bulk_create),
    path('sku-info/<str:codebarre>',get_sku_info),
    path('get-oldest/<str:ref_interne>',get_oldest_emplacement),
    path('get-sku-emplacement/<str:ref_interne>',get_emplacement),
    path('sku/emplacement',get_sku_in_emplacement),
    path('sku/oldest_emplacement', get_old_articles_emplacement),

    path('save-achat',save_achat),
    path('get-all-achat',get_all_achat),
    path('proposition-emplacement/<str:num_depot>',sort_emplacement),

    path('login',authenticate),
    path('logout',logout),
    path('get-data',get_data),
    path('get-specific-article',get_specific_article),

    path('location/all',get_location_list)


]
