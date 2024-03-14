# Std imports
from http import HTTPStatus
import json
import random

# Our own imports
from pong.models import Match, Score
from soninha.models import User
from stats.models import UserStats

# Django's imports
from django.http import HttpResponse, JsonResponse
from django.shortcuts import render
from django.utils.translation import gettext as _
from django.views.generic import View


def get_matches(user_name):
    """Get matches for a user."""

    matches_list = []
    user = User.objects.get(login_intra=user_name)
    user_matches_query = "SELECT * from pong_score where player_id=" + \
        str(user.id)
    matches_record = Match.objects.raw(user_matches_query)
    for match_record in matches_record:
        scores_query = "SELECT * from pong_score where match_id=" + \
            str(match_record.match_id)
        scores = Score.objects.raw(scores_query)
        left_score = [score for score in scores if score.player_id == user.id]
        right_score = [score for score in scores if score.player_id != user.id]
        match_object = {
            "left_name": user.display_name,
            "left_score": left_score[0].score,
            "right_name": User.objects.get(id=right_score[0].player_id).display_name,
            "right_score": right_score[0].score
        }
        matches_list.append(match_object)
    return matches_list


class MatchView(View):
    """
    This view is responsible for Matches management.
    
    It is called when a new match begins. It creates a new batch in the DB and returns the new match id.

    It is also called after the game ends, and saves the match results and scores in the DB.
    """
    def _validate_incoming_request(self, incoming_request):
        players = incoming_request['players']
        player_quantity = incoming_request['playerQuantity']
        match_type = incoming_request['gameType']

        if match_type not in [choice[0] for choice in Match.MATCH_TYPE_CHOICES]:
            raise ValueError(_("Invalid game mode: '%(match_type)s'") % {'match_type': match_type})
        if len(players) != player_quantity:
            raise ValueError(_("Fill in the names of all players to start the match."))
        players_set = set(players)
        if len(players_set) != player_quantity:
            raise ValueError(_("You can't match a player against themselves!"))
        for player in players:
            try:
                User.objects.get(login_intra=player)
            except User.DoesNotExist as e:
                raise ValueError(_("User '%(player)s' does not exist") % {'player': player}) from e

    def _create_one_match(self, incoming_request):
    # Form data is valid at this point, now create a new match and return its id
        new_match = Match.objects.create(type=incoming_request['gameType'], tournament=incoming_request.get("gameMode", '') == 'tournament')
        for player in incoming_request['players']:
            user = User.objects.get(login_intra=player)
            other_players = [User.objects.get(login_intra=player).id for player in incoming_request['players'] if player != user.login_intra]
            score = Score.objects.create(player=user, match=new_match, score=0)
            score.vs_id.add(*other_players)
            new_match.players.add(user)

        return {"match_id": new_match.id}

    def _create_multiple_matches(self, incoming_request):
    # Form data is valid at this point, now create a new match and return its id
        response_data = {"matches_id": [], "players": []}
        matches = []
        for _ in range(0, int(incoming_request['playerQuantity'] / 2)):
            new_match = Match.objects.create(type=incoming_request['gameType'], tournament=True)
            matches.append(new_match)
            response_data["matches_id"].append(new_match.id)
        players = incoming_request["players"]
        random.shuffle(players)
        player_pairs =  [players[i:i+2] for i in  range(0, len(players), 2)]
        response_data["players"] = player_pairs
        for pair in player_pairs:
            user1 = User.objects.get(login_intra=pair[0])
            user2 = User.objects.get(login_intra=pair[1])
            for match in matches:
                score1 = Score.objects.create(player=user1, match=match, score=0)
                score2 = Score.objects.create(player=user2, match=match, score=0)
                score1.vs_id.add(user2.id)
                score2.vs_id.add(user1.id)
                match.players.add(user1, user2)
        return response_data

    def post(self, request):
        incoming_request = json.loads(request.body)
        required_params = [
            "gameMode",
            "gameType",
            "playerQuantity",
            "mapSkin",
            "players",
        ]
        for param in required_params:
            if param not in incoming_request:
                return render(request, 'components/errors/player_error.html', {
                    'error_message': _("Missing required parameter: '%(param)s'") % {'param': param}
                }, status=HTTPStatus.BAD_REQUEST)

        try:
            self._validate_incoming_request(incoming_request)
        except (User.DoesNotExist, ValueError) as error:
            return render(request, 'components/errors/player_error.html', {
                'error_message': error
            }, status=HTTPStatus.BAD_REQUEST)

        response_data = {}
        if (incoming_request["gameMode"] == "singleMatch"):
            response_data = self._create_one_match(incoming_request)
        else:
            response_data = self._create_multiple_matches(incoming_request)

        return JsonResponse(response_data)

    def put(self, request, *args, **kwargs):
        try:
            data = json.loads(request.body)
            match_id = kwargs["match_id"]
            match = Match.objects.get(pk=match_id)
            scores = data.get("scores")
            winner = max(scores, key=scores.get)
            for login_intra, score in scores.items():
                user = User.objects.get(login_intra=login_intra)
                scoreObj = Score.objects.get(player=user, match=match)
                scoreObj.score = score if (match.type == "classic") else data.get("paddle_hits")
                scoreObj.save() # important! doing this before updating stats
                statsObj = UserStats.objects.get(user=user)
                statsObj.total_hours_played = statsObj.total_hours_played + data.get("match_duration_secs")
                # TODO: if/else pra classic / co-op
                statsObj.coop_cumulative_ball_distance = statsObj.coop_cumulative_ball_distance + data.get("ball_traveled_distance_cm")
                statsObj.classic_cumulative_ball_distance = statsObj.classic_cumulative_ball_distance + data.get("ball_traveled_distance_cm")
                statsObj.coop_hits_record = data.get("paddle_hits") if (data.get("paddle_hits") > statsObj.coop_hits_record) else statsObj.coop_hits_record
                other_user = next(u for u, s in scores.items() if u != login_intra)
                if match.type == "classic" and login_intra == winner:
                    statsObj.classic_victories += 1
                    statsObj.classic_opponents.add(User.objects.get(login_intra=other_user))
                if match.type == "co-op":
                    statsObj.coop_companions.add(User.objects.get(login_intra=other_user))
                statsObj.save()

            logged_in_user = User.objects.get(pk=request.session["user_id"])
            logged_user_stats = UserStats.objects.get(user=logged_in_user)
            distance = logged_user_stats.coop_cumulative_ball_distance + logged_user_stats.classic_cumulative_ball_distance
            if distance < 10:
                finalDist = "{:,.2f}".format(distance) + " mm"
            elif distance < 1000:
                finalDist = "{:,.2f}".format(distance / 10) + " cm"
            elif distance < 1000000:
                finalDist = "{:,.2f}".format(distance / 1000) + " m"
            else:
                finalDist = "{:,.2f}".format(distance / 1000000) + " km"
            hours = logged_user_stats.total_hours_played
            if hours < 60:
                finalTime = "{:,.2f}".format(hours) + " sec"
            elif hours < 3600:
                finalTime = "{:,.2f}".format(hours / 60) + " min"
            else:
                finalTime = "{:,.2f}".format(hours / 3600) + " hours"
            context = {
                "ball_hits_record": logged_user_stats.coop_hits_record,
                "cumulative_ball_distance": finalDist,
                "total_hours_played": finalTime,
                "unique_companions_encountered": logged_user_stats.coop_companions.count(),
            }

            return render(request, "soninha/partials/user-stats.html", context)
        except json.JSONDecodeError:
            return HttpResponse('Something went wrong in the Match View')

    def patch(self, request):
        try:
            data = json.loads(request.body)
            response = self._create_one_match(data)
            return JsonResponse(response)
        except json.JSONDecodeError:
            return HttpResponse('Something went wrong in the Match View')
