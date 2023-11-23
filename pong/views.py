import json
from django.http import HttpResponse
from django.shortcuts import render
from django.views.generic import View
from soninha.models import User
from pong.models import Match, Score

def home_view(request):
    return render(request, 'pong/pages/index.html')

# This view is called after the game ends, it saves everything in the DB.  
class MatchView(View):
    def post(self, request, *args, **kwargs):
        try:
            data = json.loads(request.body)
            matchId = data['match_id']
            player1_display_name = data['player1']
            player2_display_name = data['player2']
            player1_score = data['player1_score']
            player2_score = data['player2_score']

            match_instance = Match.objects.get(pk=matchId)

            player1_instance = User.objects.get(display_name=player1_display_name)
            score1 = Score.objects.get(player=player1_instance, match=match_instance)
            score1.score = player1_score
            score1.save()

            player2_instance = User.objects.get(display_name=player2_display_name)
            score2 = Score.objects.get(player=player2_instance, match=match_instance)
            score2.score = player2_score
            score2.save()
            return HttpResponse('')
        except json.JSONDecodeError as e:
            return HttpResponse('Something went wrong in the Match View')


# This view is called when the game starts, it get/create users,
# create a match and a score, then pass it as context to our template
class GameView(View):
    def post(self, request, *args, **kwargs):
        player1, created1 = User.objects.get_or_create(display_name=request.POST['player1'], login_intra='unknown', avatar_image_url='unknown')
        player2, created2 = User.objects.get_or_create(display_name=request.POST['player2'], login_intra='unknown', avatar_image_url='unknown')
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