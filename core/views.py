"""Core views."""
# Python Std Libs
import os

# Our imports
from soninha.models import User

# Django's imports
from django.shortcuts import render

def home(request):
    """Renders the home page."""

    intra_uid = os.getenv('INTRA_UID')
    redirect_uri = os.getenv('TRANSCENDENCE_IP')
    intra_endpoint = os.getenv('INTRA_ENDPOINT')
    protocol = os.getenv('TRANSCENDENCE_PROTOCOL')
    context = {
        "redirect_url": intra_endpoint + "/oauth/authorize?client_id=" + intra_uid + "&redirect_uri=" + protocol + "%3A%2F%2F" + redirect_uri + "%3A8000%2Fauth%2Flogin%2F&response_type=code",
        "user_helps": 120,
        "user_ball_distance": "10 mi",
        "user_time_played": "15h",
        "user_number_of_friends": 12,
    }
    session = request.session
    user_is_logged_in = False
    if "user_id" in session and session["user_id"] != "":
        user = User.objects.get(pk=session["user_id"])
        context["user_login"] = user.login_intra
        context["user_display_name"] = user.display_name
        context["user_image"] = user.profile_picture.url if user.profile_picture else user.intra_cdn_profile_picture_url
        user_is_logged_in = True
        ############## ACHIEVEMENTS VALUES
        user_achievements = Achievements.objects.filter(user=user)
        achievement = user_achievements.first()
        context["achievement_ball_distance"] = achievement.ball_distance
        context["achievement_friends_count"] = achievement.friends_count
        context["achievement_hours_played"] = achievement.hours_played
        context["achievement_matches_classic"] = achievement.matches_classic
        context["achievement_matches_coop"] = achievement.matches_coop
        context["achievement_matches_won"] = achievement.matches_won
        ############### END
    else:
        context["h1_text"] = "You are not logged in"
    context["user_is_logged_in"] = user_is_logged_in
    return render(request, 'index.html', context)
