=====
user_feedback
=====

user_feedback is a simple Django app to collect and store user feedback.

Detailed documentation is in the "docs" directory.

Quick start
-----------

1. Add "user_feedback" to your INSTALLED_APPS setting like this::

    INSTALLED_APPS = [
        ...
        'user_feedback',
    ]

2. Include the user_feedback URLconf in your project urls.py like this::

    url("feedback/", include("user_feedback.urls")),

3. Run `python manage.py migrate` to create the user_feedback models.

4. Setup an `EMAIL_BACKEND` in your project's settings.py.

5. Add admin emails to `ADMINS`'s list of tuples in your project's settings.py

    ADMINS = [('John', 'john@example.com'), ('Mary', 'mary@example.com')]
