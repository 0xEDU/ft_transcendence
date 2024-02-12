"""Views for the pong app."""
import json
from django.http import HttpResponse
from django.shortcuts import render
from django.views.generic import View
from soninha.models import User
from pong.models import Match, Score


def get_matches(user_name):
    """Get matches for a user."""

    matches_list = []
    user = User.objects.get(display_name=user_name)
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


def home_view(request):
    """Home view. Probably will be removed."""
    context = {}
    context["session"] = request.session
    return render(request, 'pong/pages/index.html', context)


class MatchView(View):
    """This view is called after the game ends, it saves everything in the DB."""

    def post(self, request, *args, **kwargs):
        """Post method."""

        try:
            data = json.loads(request.body)
            match_id = data['match_id']
            player1_display_name = data['player1']
            player2_display_name = data['player2']
            player1_score = data['player1_score']
            player2_score = data['player2_score']

            match_instance = Match.objects.get(pk=match_id)

            player1_instance = User.objects.get(
                display_name=player1_display_name)
            score1 = Score.objects.get(
                player=player1_instance, match=match_instance)
            score1.score = player1_score
            score1.save()

            player2_instance = User.objects.get(
                display_name=player2_display_name)
            score2 = Score.objects.get(
                player=player2_instance, match=match_instance)
            score2.score = player2_score
            score2.save()
            # request.session["matches_record"] = get_matches(request.session["intra_login"])
            return HttpResponse('')
        except json.JSONDecodeError:
            return HttpResponse('Something went wrong in the Match View')


class GameView(View):
    """
    This view is called when the game starts, it get/create users,
    create a match and a score, then pass it as context to our template
    """

    def get(self, request, *args, **kwargs):
        """Get method."""

        player1 = User.objects.get(login_intra="etachott")
        player2 = User.objects.get(login_intra="roaraujo")
        match = Match.objects.create()
        Score.objects.create(player=player1, match=match, score=0)
        Score.objects.create(player=player2, match=match, score=0)
        match.players.add(player1, player2)
        context = {
            "records": [],
            "player1": player1.display_name,
            "player2": player2.display_name,
            "match_id": match.id
        }
        return render(request, 'pong/pages/game.html', context)

    def post(self, request, *args, **kwargs):
        """Post method."""

        player1, _ = User.objects.get(login_intra=request.POST['player1'])
        player2, _ = User.objects.get(login_intra=request.POST['player2'])
        match = Match.objects.create()
        Score.objects.create(player=player1, match=match, score=0)
        Score.objects.create(player=player2, match=match, score=0)
        match.players.add(player1, player2)
        context = {
            "records": [],
            "player1": request.POST['player1'],
            "player2": request.POST['player2'],
            "match_id": match.id
        }
        return render(request, 'pong/pages/game.html', context)

class GameFormView(View):
    """
    This view is called when the player submits
    the information to set the game.
    """
    def post(self, request, *args, **kwargs):
        """Post method."""

        print(request.POST)
        try:
            player1 = User.objects.get(login_intra=request.POST['player1Name'])
            player2 = User.objects.get(login_intra=request.POST['player2Name'])
        except User.DoesNotExist:
            return render(request, 'components/errors/player_not_registered.html', {
                'error_message': "Invalid user"
            }, status=400)
        return HttpResponse("")
