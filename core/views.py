"""Core views."""
# Python Std Libs
import os

# Our imports
from pong.models import Score
from soninha.models import User, Achievements
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

        context = {"redirect_url": redirect_url}

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

            # Get user stats
            userStats = UserStats.objects.get(user=user)
            context["ball_hits_record"] = userStats.coop_hits_record
            distance = userStats.coop_cumulative_ball_distance + userStats.classic_cumulative_ball_distance
            if distance < 10:
                context["cumulative_ball_distance"] = "{:,.2f}".format(distance) + " mm"
            elif distance < 1000:
                context["cumulative_ball_distance"] = "{:,.2f}".format(distance / 10) + " cm"
            elif distance < 1000000:
                context["cumulative_ball_distance"] = "{:,.2f}".format(distance / 1000) + " m"
            else:
                context["cumulative_ball_distance"] = "{:,.2f}".format(distance / 1000000) + " km"
            hours = userStats.total_hours_played
            if hours < 60:
                context["total_hours_played"] = str(round(hours, 2)) + " sec"
            elif hours < 3600:
                context["total_hours_played"] = "{:,.2f}".format(hours / 60) + " min"
            else:
                context["total_hours_played"] = "{:,.2f}".format(hours / 3600) + " hours"
            context["unique_companions_encountered"] = userStats.coop_companions.count()

            # Get user achievements info
            achievement = Achievements.objects.get(user=user)
            context["achievement_ball_distance"] = achievement.ball_distance
            context["achievement_friends_count"] = achievement.friends_count
            context["achievement_hours_played"] = achievement.hours_played
            context["achievement_matches_classic"] = achievement.matches_classic
            context["achievement_matches_coop"] = achievement.matches_coop
            context["achievement_matches_won"] = achievement.matches_won

        return render(request, 'index.html', context)
