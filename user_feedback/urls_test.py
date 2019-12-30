from django.conf.urls import include, url

from . import views_test

urlpatterns = [
    url("test/button/", views_test.button, name="button"),
    url("feedback/", include("user_feedback.urls")),
]
