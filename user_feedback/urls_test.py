from django.conf.urls import include, url, path
from django.contrib import admin
from . import urls

from . import views_test

app_name = "test_user_feedback"

urlpatterns = [
    url("test/button/", views_test.button, name="button"),
    path(
        "feedback/",
        include((urls.urlpatterns, urls.app_name), namespace="user_feedback"),
    ),
    path("admin/", admin.site.urls),
]
