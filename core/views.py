"""Core views."""
# Python Std Libs
import os

# Our imports
from soninha.models import User,Achievements

# Django's imports
from django.shortcuts import render
from django.views import View


class IndexView(View):
    """Renders the home page."""

    ACHIEVEMENTS_THRESHOLDS = {
        "ball_distance": {
            "gold": 42,
            "silver": 21,
            "copper": 10,
        },
        "friends_count": {
            "gold": 21,
            "silver": 10,
            "copper": 5,
        },
        "hours_played": {
            "gold": 7,
            "silver": 3,
            "copper": 1,
        },
        "matches_classic": {
            "gold": 42,
            "silver": 21,
            "copper": 10,
        },
        "matches_coop": {
            "gold": 42,
            "silver": 21,
            "copper": 10,
        },
        "matches_won": {
            "gold": 42,
            "silver": 21,
            "copper": 10,
        },
    }

    def _determine_grade(self, achievement_name, value) -> str:
        if achievement_name in self.ACHIEVEMENTS_THRESHOLDS:
            thresholds = self.ACHIEVEMENTS_THRESHOLDS[achievement_name]
            for grade, threshold in thresholds.items():
                if value >= threshold:
                    return grade
            return "white"

    def _build_achievement_strings_dict(self, achievement_name, value) -> dict:
        string_mapping = {
            "ball_distance": "distance traveled",
            "friends_count": "friends",
            "hours_played": "hours played",
            "matches_classic": "classic matches",
            "matches_coop": "co-op matches",
            "matches_won": "wins",
        }
        grade = self._determine_grade(achievement_name, value)

        src = "images/achievements/" + achievement_name + "-" + grade + ".png"
        alt_text = grade.title() + " " + string_mapping[achievement_name].title() + " achievement"
        title = "No " + string_mapping[achievement_name].title() + " achievement aquired yet, go play some matches!" \
            if (grade == "white") \
            else grade.title() + " " + string_mapping[achievement_name].title() + " achievement acquired!"
        return ({
            "src": src,
            "alt_text": alt_text,
            "title": title,
        })

    def _get_achievements_context(self, user) -> dict:
        achievements = Achievements.objects.get(user=user)
        context = {}

        for field in Achievements._meta.get_fields():
            field_name = field.name
            if (field_name not in ["id", "user"]):
                context[field_name] = self._build_achievement_strings_dict(field_name, getattr(achievements, field_name))

        return context

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
            context.update(self._get_achievements_context(user))

        return render(request, 'index.html', context)
