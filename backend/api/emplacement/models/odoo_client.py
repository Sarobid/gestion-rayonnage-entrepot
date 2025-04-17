import json
import requests
from ..serializers.TokenSerializer import CustomTokenSerializer
import environ
from django.contrib.auth.models import User
env = environ.Env()
environ.Env.read_env()

class OdooClient:
    def __init__(self,username, password):
        self.url = env('ODOO_URL')
        self.db = env('ODOO_DB')
        self.username = username
        self.password = password
        self.uid = None

    def authenticate(self):
        auth_url = f"{self.url}/web/session/authenticate"
        payload = {
            "jsonrpc": "2.0",
            "params": {
                "db": self.db,
                "login": self.username,
                "password": self.password,
            },
        }
        headers = {"Content-Type": "application/json"}
        response = requests.post(auth_url, data=json.dumps(payload), headers=headers)
        result = response.json().get("result")
        if result:
            self.uid = result.get("uid")
        return self.uid

    def call_method(self, model, method, domain=None, fields=None, limit=20,offset=0):
        call_url = f"{self.url}/jsonrpc"

        payload = {
            "jsonrpc": "2.0",
            "method": "call",
            "params": {
                "service": "object",
                "method": "execute_kw",
                "args": [
                    self.db,
                    self.authenticate(),
                    self.password,
                    model,
                    method,
                    [domain or []],
                    {"fields": fields or [], "limit": limit, "offset": offset}
                ]
            },
            "id": 1
        }
        headers = {"Content-Type": "application/json"}

        try:
            response = requests.post(call_url, data=json.dumps(payload), headers=headers)
            response.raise_for_status()

            result = response.json()

            if "result" in result:
                return result["result"]
            else:
                print(f"Error: {result.get('error', 'Unknown error')}")
                return None

        except requests.exceptions.RequestException as e:
            print(f"Error during request: {e}")
            return None

    def get_tokens_for_user(self,odooUser,odooPwd):
        user = User.objects.get(username=env('DJANGO_ADMIN'))
        token = CustomTokenSerializer.get_token(user,odooUser,odooPwd)

        return {
            'refresh': str(token),
            'access': str(token.access_token),
        }