from django.shortcuts import render

def home_view(request):
    return render(request, 'pong/pages/index.html')

def game_view(request):
    return render(request, 'pong/pages/game.html')
