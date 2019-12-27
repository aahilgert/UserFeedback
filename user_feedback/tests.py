from django.test import TestCase, override_settings

from .models import Feedback
from .serializers import FeedbackSerializer
from .views import post_feedback_json

from django.urls import reverse
from django.core import mail
import datetime

from django.core.mail import send_mail, mail_admins
import time
from django.test.client import RequestFactory

@override_settings(ADMINS = [('John', 'john@example.com'), ('Mary', 'mary@example.com')])
class FeedbackPostTest(TestCase):
    def setUp(self):
        self.factory = RequestFactory()

    def test_feedback_post(self):
        response = self.client.post(
            reverse('post-feedback'),
            data={
                'json' : '{"rating": 4, "text": "dfgfdgdfgdfgdfgfdgdfg", "author": null, "url": "http://127.0.0.1:8000/course/1/", "type": "2"}'
            },
        )
        posted_feedback = Feedback.objects.get(id=1)
        self.assertEqual(posted_feedback.rating, 4)
        self.assertEqual(posted_feedback.text, "dfgfdgdfgdfgdfgfdgdfg")
        self.assertEqual(posted_feedback.author, None)
        self.assertEqual(posted_feedback.url, "http://127.0.0.1:8000/course/1/")
        self.assertEqual(posted_feedback.type, 2)
        self.assertEqual(response.status_code, 200)


    def test_email_on_bug_report(self):
        with self.settings(ADMINS = [('John', 'john@example.com'), ('Mary', 'mary@example.com')]):
            request = self.factory.get(reverse('post-feedback'))
            response = self.client.post(
                reverse('post-feedback'),
                data={
                    'json' : '{"rating": null, "text": "dfgfdgdfgdfgdfgfdgdfg", "author": null, "url": "http://127.0.0.1:8000/course/1/", "type": "1"}'
                },
            )
            self.assertEqual(len(mail.outbox), 1)
            self.assertIn("URGENT - bug report", mail.outbox[0].subject)
            self.assertIn("127.0.0.1:8000's course/1. The user has written the following: 'dfgfdgdfgdfgdfgfdgdfg' There have been 0 other bugs reported in the last 10", mail.outbox[0].body)

    def test_email_ten_day_bug_count(self):
        with self.settings(ADMINS = [('John', 'john@example.com'), ('Mary', 'mary@example.com')]):
            response = self.client.post(
                reverse('post-feedback'),
                data={
                    'json' : '{"rating": null, "text": "dfgfdgdfgdfgdfgfdgdfg", "author": null, "url": "http://127.0.0.1:8000/course/1/", "type": "1"}'
                }
            )
            response = self.client.post(
                reverse('post-feedback'),
                data={
                    'json' : '{"rating": null, "text": "dfgfdgdfgdfgdfgfdgdfg", "author": null, "url": "http://127.0.0.1:8000/course/1/", "type": "1"}'
                }
            )
            self.assertEqual(len(mail.outbox), 2)
            self.assertIn("URGENT - bug report", mail.outbox[0].subject)
            self.assertIn("A bug has been reported on 127.0.0.1:8000's course/1. The user has written the following: 'dfgfdgdfgdfgdfgfdgdfg' There have been 1 other bugs reported in the last 10 days at this url.", mail.outbox[1].message)
