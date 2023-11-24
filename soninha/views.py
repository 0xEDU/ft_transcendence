import os
import requests
import json
from django.shortcuts import redirect
from django.http import HttpResponse
from dotenv import load_dotenv


def get_token(code):
    intra_endpoint = os.getenv('INTRA_ENDPOINT')
    uid = os.getenv('INTRA_UID')
    secret = os.getenv('INTRA_SECRET')
    url = os.getenv('TRANSCENDENCE_URL')
    url_parameters = "?grant_type=authorization_code&client_id=" + \
        uid + "&client_secret=" + secret + "&code=" + code + \
        "&redirect_uri=http%3A%2F%2F10.11.200.14%3A8000%2Fauth%2Flogin%2F"
    token = json.loads(requests.post(
        intra_endpoint + '/oauth/token' + url_parameters).content)
    return token['access_token']


# Append request host to api call back instead of writing it by hand in the url
def intra_view(request):
    return redirect('https://api.intra.42.fr/oauth/authorize?client_id=u-s4t2ud-fb9fffadcc3ee956394c77fc566c527519cc1beaea22c1b86b58312ade803b89&redirect_uri=http%3A%2F%2F10.11.200.14%3A8000%2Fauth%2Flogin%2F&response_type=code')


def login_view(request):
    code = request.GET.get('code', '')
    token = get_token(code)
    bearer = "Bearer " + token
    cadet_api = os.getenv('INTRA_ENDPOINT') + os.getenv('CADET_API')
    response = json.loads(requests.get(cadet_api, headers={
                          'Authorization': bearer}).content)
    request.session["intra_login"] = response["login"]
    request.session["intra_pfp"] = response["image"]["versions"]["medium"]
    # context = {
    #     "intra_login": response["login"],
    #     "intra_pfp": response["image"]["versions"]["medium"]
    # }
    return redirect('/pong')
