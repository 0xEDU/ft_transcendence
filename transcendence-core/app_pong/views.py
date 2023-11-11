from django.shortcuts import render

def pong_view(request):
    return render(request, 'app_pong/index.html')
