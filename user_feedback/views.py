from datetime import datetime, timezone
import bleach
import json

from django.contrib.auth.decorators import login_required
from django.core.mail import mail_admins
from django.http import JsonResponse
from django.views.decorators.http import require_POST

from .models import Feedback
from .serializers import FeedbackSerializer


@require_POST
@login_required
def post_feedback_json(request):
    data = json.loads(request.POST.get("json"))
    data["text"] = bleach.clean(data["text"], tags=[], strip=True).rstrip()
    data["author"] = request.user.pk
    serializer = FeedbackSerializer(data=data)
    if serializer.is_valid():
        feedback_object = serializer.save()
        if feedback_object.type == 1:
            send_bug_report_emails(request, data)
        return JsonResponse({"action": "posted"})
    else:
        return JsonResponse({"action": "error"})


def send_bug_report_emails(request, data):
    mail_admins(
        subject="URGENT - bug report",
        message="A bug has been reported on %s's %s. The user has written the "
        "following: '%s' There have been %d other bugs reported in the "
        "last 10 days at this url."
        % (
            request.get_host(),
            data["url"][1:-1],
            data["text"],
            Feedback.objects.filter(
                type=1,
                url=data["url"],
                created_on__lte=datetime.now(timezone.utc),
                created_on__gt=datetime.now(timezone.utc) - datetime.timedelta(days=10),
            ).count()
            - 1,
        ),
        fail_silently=False,
    )
