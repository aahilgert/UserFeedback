from django.conf.urls import url

from . import views


def flow_patterns():
    return [url(r"^post", views.post_feedback_json, name="post-feedback")]


urlpatterns = sum([flow_patterns()], [])
