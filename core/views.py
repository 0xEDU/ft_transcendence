"""Core views."""
# Python Std Libs
import os
import json
# Our imports
from pong.models import Score
from soninha.models import User, Achievements
from stats.models import UserStats
from .models import Friendship

# Django's imports
from django.shortcuts import render
from django.views import View
from django.http import JsonResponse
from django.utils import timezone
from django.db.models import Q
from django.template.loader import render_to_string

class UpdateLastSeenView(View):
    def post(self, request, *args, **kwargs):
        user_id = request.session.get("user_id")
        if user_id:
            try:
                user = User.objects.get(pk=user_id)
                user.last_seen = timezone.now()
                user.save(update_fields=['last_seen'])
                return JsonResponse({'status': 'success'})
            except User.DoesNotExist:
                return JsonResponse({'error': 'User does not exist'}, status=404)
        else:
            return JsonResponse({'error': 'User not authenticated'}, status=403)

class GetFriendsView(View):
    def get(self, request, *args, **kwargs):
        requester_id = request.session.get("user_id")
        if requester_id is None:
            return JsonResponse({'error': 'User not logged in.'}, status=401)

        try:
            user = User.objects.get(pk=requester_id)
        except User.DoesNotExist:
            return JsonResponse({'error': 'User does not exist.'}, status=404)

        # Filter for both accepted requests and requests made by the user, ordered by the most recent.
        accepted_friendships = Friendship.objects.filter(
            Q(status='accepted', requester=user) | Q(status='accepted', accepter=user)
        ).select_related('accepter', 'requester').order_by('-created_at')[:6]

        friends_list = [
            {
                'username': friendship.accepter.display_name if friendship.requester_id == requester_id else friendship.requester.display_name,
                'image_url': friendship.accepter.profile_picture.url if friendship.requester_id == requester_id and friendship.accepter.profile_picture else (friendship.accepter.intra_cdn_profile_picture_url if friendship.requester_id == requester_id else friendship.requester.intra_cdn_profile_picture_url) or 'static/images/default_user_image.svg',
                'online': (timezone.now() - friendship.accepter.last_seen).total_seconds() < 15,
            }
            for friendship in accepted_friendships
        ]

        return JsonResponse(friends_list, safe=False)


class CreateFriendshipView(View):
    def post(self, request):
        try:
            data = json.loads(request.body)
            accepter_id = data.get('accepter_id')
            requester_id = request.session.get("user_id")

            if not requester_id:
                return JsonResponse({"error": "Authentication required."}, status=401)
            if requester_id == accepter_id:
                return JsonResponse({"error": "Can't add yourself"}, status=409)

            requester = User.objects.get(pk=requester_id)
            accepter = User.objects.get(pk=accepter_id)

            if Friendship.objects.filter(requester=requester, accepter=accepter).exists():
                return JsonResponse({"error": "Request already sent!"}, status=409)
            elif Friendship.objects.filter(requester=accepter, accepter=requester).exists():
                return JsonResponse({"error": "You can't add twice!"}, status=409)

            Friendship.objects.create(requester=requester, accepter=accepter, status='pending')
            return JsonResponse({"message": "Friend request sent successfully."}, status=201)

        except User.DoesNotExist:
            return JsonResponse({"error": "User not found."}, status=404)
        except json.JSONDecodeError:
            return JsonResponse({"error": "Invalid JSON."}, status=400)
        except Exception as e:
            print(e)
            return JsonResponse({"error": "Internal Server Error"}, status=500)

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


class AcceptFriendshipView(View):
    def post(self, request):
        data = json.loads(request.body)
        friendship_id = data.get('friendshipId')
        requester_id = request.session.get("user_id")
        if not requester_id:
            return JsonResponse({'error': 'User not authenticated'}, status=403)
        current_user = User.objects.get(pk=requester_id)
        
        try:
            friendship = Friendship.objects.get(pk=friendship_id, accepter=current_user)
            friendship.status = 'accepted'
            friendship.save()
            return JsonResponse({'message': 'Friendship accepted!'}, status=200)
        except Friendship.DoesNotExist:
            return JsonResponse({'error': 'Friendship not found or you do not have permission to accept this friendship.'}, status=404)


class FriendListView(View):
    def get(self, request):
        requester_id = request.session.get("user_id")
        current_user = User.objects.get(pk=requester_id)

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
                'friendshipId': friendship.id,
                # Adjust class names and button text based on the friendship status
                'cardClass': 'friendCard-pending' if friendship.status == 'pending' else 'friendCard',
                'buttonClass': 'acceptFriendshipButton' if friendship.status == 'pending' and not friendship.requester == current_user else 'viewProfileButton',
                'buttonColor': 'btn-outline-secondary' if friendship.status == 'pending' else 'btn-outline-light',
                'buttonText': 'Accept' if friendship.status == 'pending' and not friendship.requester == current_user else 'View Profile',
                'friendshipStatus': '(Pending friendship request)' if friendship.status == 'pending' else '',
            }
            friends_list.append(friend_data)

        # Render the friend cards template to a string
        rendered_html = render_to_string('friends/friend-card.html', {'friends_list': friends_list})
        return JsonResponse({'html': rendered_html})

class CheckFriendshipStatusView(View):
    def get(self, request):
        user_id = request.GET.get('user_id')
        current_user_id = request.session["user_id"]

        if not user_id:
            return JsonResponse({"error": "User ID is required."}, status=400)

        friendship = Friendship.objects.filter(
            (Q(requester_id=current_user_id, accepter_id=user_id) | 
             Q(requester_id=user_id, accepter_id=current_user_id)),
            status__in=['pending', 'accepted']
        ).first()

        if friendship:
            return JsonResponse({
                "status": friendship.status,
                "isRequester": friendship.requester_id == current_user_id,
                "id": friendship.id
            })
        return JsonResponse({"status": "not_friends"})


class CancelFriendRequestView(View):
    def post(self, request):
        try:
            data = json.loads(request.body)
            friendship_id = data.get('friendshipId')
            friendship = Friendship.objects.get(id=friendship_id)
            current_user_id = request.session["user_id"]

            # Ensure the request.user is the one who made the friend request
            if friendship.requester.id != current_user_id:
                return JsonResponse({'error': 'Unauthorized'}, status=403)

            friendship.delete()  # Cancel the friend request
            return JsonResponse({'message': 'Friend request cancelled successfully.'})

        except Friendship.DoesNotExist:
            return JsonResponse({'error': 'Friendship request not found.'}, status=404)
        except json.JSONDecodeError:
            return JsonResponse({'error': 'Invalid JSON.'}, status=400)
        except Exception as e:
            print(e)  # Log error for debugging
            return JsonResponse({'error': 'Internal Server Error'}, status=500)


class RemoveFriendView(View):
    def post(self, request):
        try:
            data = json.loads(request.body)
            friendship_id = data.get('friendshipId')
            friendship = Friendship.objects.get(id=friendship_id)
            current_user_id = request.session["user_id"]
            print(f"Friendship: {friendship.requester}")
            print(f"Current user id: {current_user_id}")
            if current_user_id != friendship.requester.id and current_user_id != friendship.accepter.id:
                return JsonResponse({'error': 'Unauthorized'}, status=403)

            friendship.delete()
            return JsonResponse({'message': 'Friend removed successfully.'})

        except Friendship.DoesNotExist:
            return JsonResponse({'error': 'Friendship not found.'}, status=404)
        except json.JSONDecodeError:
            return JsonResponse({'error': 'Invalid JSON.'}, status=400)
        except Exception as e:
            print(e)
            return JsonResponse({'error': 'Internal Server Error'}, status=500)


class GetUserInfoView(View):
    def get(self, request, friend_id):
        user = User.objects.get(id=friend_id)
        data = {
            'displayName': user.display_name,
            'loginIntra': user.login_intra,
            'profilePictureUrl': user.profile_picture.url if user.profile_picture else user.intra_cdn_profile_picture_url,
        }
        return JsonResponse(data)


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
