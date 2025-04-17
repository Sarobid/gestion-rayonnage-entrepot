from dataclasses import fields

from rest_framework import status
from rest_framework.decorators import api_view,permission_classes
from rest_framework.response import Response
from ..models.odoo_client import OdooClient
from rest_framework.permissions import IsAuthenticated, AllowAny


#login
@api_view(['POST'])
#@permission_classes([AllowAny])
def authenticate(request):
    username = request.data.get('username')
    password = request.data.get('password')
    odoo_client = OdooClient(
        username=username,
        password=password,
    )
    uid = odoo_client.authenticate()
    if uid:
        userIdentity = odoo_client.call_method(
            model= "res.users",
            method= "search_read",
            domain = [('id', '=', uid)],
            fields = ['display_name']
        )
        tokens = odoo_client.get_tokens_for_user(username,password)

        res         = Response()
        res.data    = {"success": True, "user": userIdentity[0]['display_name']}
        res.status  = status.HTTP_200_OK
        res.set_cookie(
            key="access-token",
            httponly=True,
            secure=True,
            samesite=None,
            path='/',
            value= tokens['access']
        )
        res.set_cookie(
            key="refresh-token",
            httponly=True,
            secure=True,
            samesite=None,
            path='/',
            value= tokens['refresh']
        )
        return res
    return Response({"success": False, "message": "Invalid credentials"})

#logout
@api_view(['POST'])
def logout(request):
    try:
        res = Response()
        res.data = {"success":True}
        res.status = status.HTTP_200_OK
        res.delete_cookie(key='access-token',path='/',samesite="None")
        res.delete_cookie(key='refresh-token',path='/',samesite='None')

        return res

    except Exception as e:

        return Response({"error": "An unexpected error occurred: " + str(e)},

                status=status.HTTP_500_INTERNAL_SERVER_ERROR

                )
