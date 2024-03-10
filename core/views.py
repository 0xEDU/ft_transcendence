"""Core views."""
# Python Std Libs
import os
import json
# Our imports
from pong.models import Score
from soninha.models import User, Achievements
from stats.models import UserStats

# Django's imports
from django.shortcuts import render
from django.views import View
from django.http import JsonResponse

from django.db.models import Q
from .models import Friendship
from django.contrib.auth.decorators import login_required
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt


class CreateFriendshipView(View):
    def post(self, request):
        data = json.loads(request.body)
        accepter_id = data.get('accepter_id')
        requester_id = request.session["user_id"]
        requester = User.objects.get(pk=requester_id)
        accepter = User.objects.get(pk=accepter_id)

        # Check if the friendship already exists to avoid duplicates
        if not Friendship.objects.filter(requester=requester, accepter=accepter).exists():
            Friendship.objects.create(requester=requester, accepter=accepter, status='pending')
            return JsonResponse({"message": "Friend request sent successfully."}, status=201)
        else:
            return JsonResponse({"error": "Friend request already sent."}, status=406)

class SearchUserView(View):
    def get(self, request, *args, **kwargs):
        search_term = request.GET.get('search', '')
        try:
            user = User.objects.get(login_intra__icontains=search_term)
            data = {
                'id': user.id,
                'displayName': user.display_name,
                'loginIntra': user.login_intra,
                'profilePictureUrl': user.profile_picture.url if user.profile_picture else user.intra_cdn_profile_picture_url,
                'profileUrl': f'/profile/{user.id}/',
            }
            return JsonResponse(data)
        except User.DoesNotExist:
            return JsonResponse({'error': 'User not found'}, status=404)

class FriendshipRequestView(View):
    def post(self, request):
        accepter_id = request.POST.get('accepter_id')
        accepter = User.objects.get(pk=accepter_id)
        Friendship.objects.create(requester=request.user, accepter=accepter)
        return JsonResponse({'message': 'Friendship request sent!'}, status=201)

class AcceptFriendshipView(View):
    def post(self, request):
        friendship_id = request.POST.get('friendship_id')
        friendship = Friendship.objects.get(pk=friendship_id, accepter=request.user)
        friendship.status = 'accepted'
        friendship.save()
        return JsonResponse({'message': 'Friendship accepted!'}, status=200)

class FriendshipStatusView(View):
    def get(self, request):
        # Return the friendship status between two users
        user_id = request.GET.get('user_id')
        friendships = Friendship.objects.filter(
            Q(requester_id=request.user.id, accepter_id=user_id) |
            Q(requester_id=user_id, accepter_id=request.user.id)
        ).first()
        if friendships:
            return JsonResponse({
                'status': friendships.status
            })
        return JsonResponse({'status': 'not_friends'})

#@method_decorator(login_required, name='dispatch')
class FriendListView(View):
    def get(self, request):
        current_user = request.user

        friendships = Friendship.objects.filter(
            Q(requester=current_user) | Q(accepter=current_user)
        ).distinct()

        friends_list = []
        for friendship in friendships:
            friend = friendship.accepter if friendship.requester == current_user else friendship.requester
            friend_data = {
                'id': friend.id,
                'displayName': friend.display_name,
                'profilePictureUrl': friend.profile_picture.url if friend.profile_picture else friend.intra_cdn_profile_picture_url,
                'status': friendship.status,
                'isRequester': friendship.requester == current_user,
            }
            friends_list.append(friend_data)

        return JsonResponse(friends_list, safe=False)  # 'safe=False' is required for non-dict objects


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
                context["total_hours_played"] = "{:,.2f}".format(hours) + " sec"
            elif hours < 3600:
                context["total_hours_played"] = "{:,.2f}".format(hours / 60) + " min"
            else:
                context["total_hours_played"] = "{:,.2f}".format(hours / 3600) + " hours"
            context["unique_companions_encountered"] = userStats.coop_companions.count()

            # Get user achievements info
            context.update(self._get_achievements_context(user))

        return render(request, 'index.html', context)
