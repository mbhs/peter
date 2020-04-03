from django.urls import path

from . import views

urlpatterns = [
    path('', views.index, name='index'),
    path('activities/', views.activities, name='activities'),
    path('about/', views.about, name='about'),
    path('tickets/', views.tickets, name='tickets'),
    path('covid/', views.covid, name='covid'),
]