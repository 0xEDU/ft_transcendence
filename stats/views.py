from django.shortcuts import render

# Create your views here.
def matchesHistory(request):
	return render(request, 'stats/matchHistory.html')