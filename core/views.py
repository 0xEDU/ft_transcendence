from django.shortcuts import render
from soninha.models import User
from soninha.views import UserTemplateView
import os

def home(request):
    intra_uid = os.getenv('INTRA_UID') 
    redirect_uri = os.getenv('TRANSCENDENCE_IP')
    context = {
        "redirect_url": os.getenv('INTRA_ENDPOINT') + "/oauth/authorize?client_id=" + intra_uid + "&redirect_uri=http%3A%2F%2F" + redirect_uri + "%3A8000%2Fauth%2Flogin%2F&response_type=code" ,
        "user_helps": 120,
        "user_ball_distance": "10 mi",
        "user_time_played": "15h",
        "user_number_of_friends": 12,
    }
    session = request.session
    if "user_id" in session and session["user_id"] != "":
        user = User.objects.get(pk=session["user_id"])
        context["user_login"] = user.login_intra
        context["user_display_name"] = user.display_name
        context["user_image"] = user.avatar_image_url
    else:
        context["h1_text"] = "You are not logged"
    return render(request, 'index.html', context)
