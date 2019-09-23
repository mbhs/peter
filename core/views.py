from django.shortcuts import render


def index(request):
    context = {
        'navbar': 'home'
    }
    return render(request, 'core/index.html', context)

def activities(request):
    context = {
        'navbar': 'activities'
    }
    return render(request, 'core/activities.html', context)

def about(request):
    context = {
        'navbar': 'about'
    }
    return render(request, 'core/about.html', context)

def tickets(request):
    context = {
        'navbar': 'tickets'
    }
    return render(request, 'core/tickets.html', context)
