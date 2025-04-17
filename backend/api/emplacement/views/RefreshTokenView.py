from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenRefreshView

class CustomRefreshToken(TokenRefreshView):
    def post(self,request,*args,**kwargs):
        try:
            refresh_token = request.COOKIES.get('refresh-token')
            request.data['refresh'] = refresh_token
            response = super().post(request,*args,**kwargs)

            tokens = response.data
            access_token = tokens['access']

            res = Response()
            res.data = {"refresh": True}
            res.set_cookie(
                key='access-token',
                value=access_token,
                path='/',
                httponly=True,
                samesite='None',
                secure=True
            )

            return res


        except Exception as e:

            return Response({"error": "An unexpected error occurred: " + str(e)},



                            )
