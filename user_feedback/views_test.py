from django.shortcuts import render


def button(request):

    template = "user_feedback/template.html"
    context = {}
    return render(request, template, context)
