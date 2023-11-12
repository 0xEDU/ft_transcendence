from django.shortcuts import render


def pong_view(request):
    record = {
        "left_name": "etachott",
        "left_score": 5,
        "right_name": "guribeir",
        "right_score": 2,
    }
    record2 = {
        "left_name": "roaraujo",
        "left_score": 3,
        "right_name": "julberna",
        "right_score": 5,
    }
    record3 = {
        "left_name": "roaraujo",
        "left_score": 3,
        "right_name": "julberna",
        "right_score": 5,
    }
    record4 = {
        "left_name": "roaraujo",
        "left_score": 3,
        "right_name": "julberna",
        "right_score": 5,
    }
    record5 = {
        "left_name": "roaraujo",
        "left_score": 3,
        "right_name": "julberna",
        "right_score": 5,
    }
    record6 = {
        "left_name": "roaraujo",
        "left_score": 3,
        "right_name": "julberna",
        "right_score": 5,
    }
    record7 = {
        "left_name": "roaraujo",
        "left_score": 3,
        "right_name": "julberna",
        "right_score": 5,
    }
    context = {
        "records": [record, record2, record3, record4, record5, record6, record7]
    }
    return render(request, 'app_pong/index.html', context)
