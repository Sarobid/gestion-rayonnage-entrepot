from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

class CustomTokenSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user,odooUser,odooPwd):
        token = super().get_token(user)

        token['odooUser'] = odooUser
        token['odooPwd']  = odooPwd

        return token