import bleach
from django.shortcuts import render
from .serializers import FeedbackSerializer
from django.http import JsonResponse
import json
from django.core.mail import mail_admins
import datetime
from .models import Feedback

def post_feedback_json(request):
    data = json.loads(request.POST.get("json"))
    data['text'] = bleach.clean(data['text'], tags=[], strip=True).rstrip()
    data['author'] = request.user.pk
    serializer = FeedbackSerializer(data=data)
    if serializer.is_valid():
        serializer.save()
    else:
        print(serializer.errors)
    if data['type'] == 1:
        send_bug_report_emails(request, data)
    return JsonResponse({"action": "posted"})


def send_bug_report_emails(request, data):
    mail_admins(
        subject="URGENT - bug report",
        message= "A bug has been reported on %s\'s %s. The user has written the following: \'%s\' There have been %d other bugs reported in the last 10 days at this url." % (request.get_host(), data['url'][1:-1], data['text'], Feedback.objects.filter(type=1, url=data['url'], created_on__lte=datetime.datetime.today(), created_on__gt=datetime.datetime.today()-datetime.timedelta(days=10)).count()),
        fail_silently=False,
    )
