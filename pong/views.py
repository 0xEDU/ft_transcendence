from django.http import HttpRequest
from django.shortcuts import render
from django.views.generic import ListView
from soninha.models import User
from pong.models import Match, Score

def home_view(request):
    return render(request, 'pong/pages/index.html')

def game_view(request: HttpRequest):
    print(request.POST)
    player1 = User.objects.create(display_name=request.POST['player1'], login_intra='unknown', avatar_image_url='unknown')
    player2 = User.objects.create(display_name=request.POST['player2'], login_intra='unknown', avatar_image_url='unknown')
    match = Match.objects.create()
    Score.objects.create(player=player1, match=match, score=0)
    Score.objects.create(player=player2, match=match, score=0)
    match.players.add(player1, player2)
    context = {
        "records": [],
        "player1": request.POST['player1'], 
        "player2": request.POST['player2']
    }
    return render(request, 'pong/pages/game.html', context)


class MatchView(ListView):
    model = Match

    # def post(self, *args, **kwargs):
        # score = Score.objects.create(player=)
        # match = Match.objects.create()
        # match.players.add(player1, player2)