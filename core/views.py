"""Core views."""
# Python Std Libs
import os

# Our imports
from soninha.models import User,Achievements
from stats.models import UserStats

# Django's imports
from django.shortcuts import render
from django.views import View


class IndexView(View):
    """Renders the home page."""

    def get(self, request, *args, **kwargs):
        # Get context
        # Build redirect url
        intra_uid = os.getenv('INTRA_UID')
        redirect_uri = os.getenv('TRANSCENDENCE_IP')
        intra_endpoint = os.getenv('INTRA_ENDPOINT')
        protocol = os.getenv('TRANSCENDENCE_PROTOCOL')
        redirect_url = intra_endpoint + \
                        "/oauth/authorize?client_id=" + intra_uid + \
                        "&redirect_uri=" + protocol + "%3A%2F%2F" + \
                        redirect_uri + "%3A8000%2Fauth%2Flogin%2F&response_type=code"

        context = {
            "redirect_url": redirect_url,
            "user_helps": 120,
            "user_ball_distance": "10 mi",
            "user_time_played": "15h",
            "user_number_of_friends": 12,
        }

        # Check if there is a logged in user
        session = request.session
        user_is_logged_in = "user_id" in session and session.get("user_id", '') != ''
        context["user_is_logged_in"] = user_is_logged_in
        if user_is_logged_in:
            # Get user info
            user = User.objects.get(pk=session["user_id"])
            context["user_login"] = user.login_intra
            context["user_display_name"] = user.display_name
            context["user_image"] = user.profile_picture.url if user.profile_picture else user.intra_cdn_profile_picture_url
            # Get user achievements info
            achievement = Achievements.objects.get(user=user)
            context["achievement_ball_distance"] = achievement.ball_distance
            context["achievement_friends_count"] = achievement.friends_count
            context["achievement_hours_played"] = achievement.hours_played
            context["achievement_matches_classic"] = achievement.matches_classic
            context["achievement_matches_coop"] = achievement.matches_coop
            context["achievement_matches_won"] = achievement.matches_won
            # Get user stats info
            # stats = UserStats.objects.get(user=user)
            # context["distance"] = stats.coop_cumulative_ball_distance + stats.classic_cumulative_ball_distance
            # context["high_five"] = stats.coop_hits_record
            # context["hours_played"] = stats.total_hours_played
            # context["companions"] = stats.classic_oponents.count() + stats.coop_companions.count()

        return render(request, 'index.html', context)
