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
            context["ball_hits_record"] = UserStats.objects.get(user=user).coop_hits_record
            context["cumulative_ball_distance"] = UserStats.objects.get(user=user).coop_cumulative_ball_distance
            context["total_hours_played"] = UserStats.objects.get(user=user).total_hours_played
            all_matches_played_ids = Score.objects.filter(player_id=user.pk).values_list('match_id', flat=True)
            unique_players_played_with = []
            for match_id in all_matches_played_ids:
                other_player_id = Score.objects.filter(match_id=match_id).exclude(player_id=user.pk).values_list('player_id', flat=True).first()
                if other_player_id not in unique_players_played_with:
                    unique_players_played_with.append(other_player_id)
            context["unique_companions_encountered"] = len(unique_players_played_with)

            # Get user achievements info
            achievement = Achievements.objects.get(user=user)
            context["achievement_ball_distance"] = achievement.ball_distance
            context["achievement_friends_count"] = achievement.friends_count
            context["achievement_hours_played"] = achievement.hours_played
            context["achievement_matches_classic"] = achievement.matches_classic
            context["achievement_matches_coop"] = achievement.matches_coop
            context["achievement_matches_won"] = achievement.matches_won

        return render(request, 'index.html', context)
