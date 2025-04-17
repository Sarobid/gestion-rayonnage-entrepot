import jwt
from rest_framework import status
from rest_framework.decorators import api_view,permission_classes
from rest_framework.response import Response
from ..models.odoo_client import OdooClient
from django.conf import settings


def get_credentials(request):
    access_token = request.COOKIES.get('access-token')
    if access_token == None:
        return  Response({"success":False,"msg": "Token invalid or expired"})

    decoded_token = jwt.decode(access_token, settings.SECRET_KEY, algorithms=['HS256'])

    return decoded_token['odooUser'], decoded_token['odooPwd']

#get-data
@api_view(['GET'])
def get_data(request):
            odoo_client = OdooClient(
                username="admin",
                password="admin",
            )
            if not odoo_client.authenticate():
                return Response({"status": "failure", "message": "Authentication failed"},
                                status=status.HTTP_401_UNAUTHORIZED)

            data = odoo_client.call_method(
                model="product.template",
                method="search_read",
                domain=[],
                fields=["default_code","name", "volume","weight","qty_available","barcode"]
            )
            return Response({"status": "success", "data": data}, status=status.HTTP_200_OK)

# get-specific-article/<str:ref_interne>
@api_view(['GET'])
def get_specific_article(request):

    user,pwd = get_credentials(request)

    try:
        ref_interne = request.query_params.get('ref_interne')
        odoo_client = OdooClient(
            username=user,
            password=pwd,
        )
        if not odoo_client.authenticate():
            return Response({"status": "failure", "message": "Authentication failed", "user": user, "pwd":pwd},
                            status=status.HTTP_401_UNAUTHORIZED)

        if(ref_interne == ""):
            data = odoo_client.call_method(
                model="product.template",
                method="search_read",
                domain=[],
                fields=["default_code", "name", "volume", "weight", "qty_available", "barcode"]
            )
        else:
            data = odoo_client.call_method(
                model="product.template",
                method="search_read",
                domain = [('default_code','=',ref_interne)],
                fields=["default_code", "name", "volume", "weight", "qty_available", "barcode"]

            )

        return Response({"status": "success", "data": data,"decoded": get_credentials(request)}, status=status.HTTP_200_OK)


    except Exception as e:
        return Response({"error": "An unexpected error occurred: " + str(e)},
                        status=status.HTTP_500_INTERNAL_SERVER_ERROR
                        )

#location/all
@api_view(['GET'])
def get_location_list(request):
    odoo_client = OdooClient(
        username="admin",
        password="admin",
    )
    if not odoo_client.authenticate():
        return Response({"status": "failure", "message": "Authentication failed"},
                        status=status.HTTP_401_UNAUTHORIZED)

    data = odoo_client.call_method(
        model="stock.location",
        limit=0,
        method="search_read",
        domain=[("usage","=","internal")],
        fields=["complete_name","usage"]
    )
    return Response({"status": "success", "data": data}, status=status.HTTP_200_OK)
