from django.http import HttpRequest, HttpResponse
from django.shortcuts import render
from django.views.generic import ListView, UpdateView
from soninha.models import User
from pong.models import Match, Score

def home_view(request):
    return render(request, 'pong/pages/index.html')

# Refer to https://pythonacademy.com.br/blog/como-utilizar-as-class-based-views-do-django for to implements this
class MatchView(UpdateView):
    model = Match

    def post(self, request, *args, **kwargs):
        data = request.POST
        matchId = data['matchId']
        match = Match.objects.get(pk=matchId)
        return HttpResponse('')


class GameView(ListView):
    
    def post(self, request, *args, **kwargs):
        # print(request.POST)
        player1 = User.objects.create(display_name=request.POST['player1'], login_intra='unknown', avatar_image_url='unknown')
        player2 = User.objects.create(display_name=request.POST['player2'], login_intra='unknown', avatar_image_url='unknown')
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

class MatchView(ListView):
    model = Match

    # def post(self, *args, **kwargs):
        # score = Score.objects.create(player=)
        # match = Match.objects.create()
        # match.players.add(player1, player2)