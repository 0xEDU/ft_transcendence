from django.shortcuts import render

def pong_view(request):
    return render(request, 'pong/index.html')
