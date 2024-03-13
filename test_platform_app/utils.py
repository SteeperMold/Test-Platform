from datetime import timedelta
from functools import wraps

import pymorphy2
from django.shortcuts import render
from django.utils import timezone
from django.views.decorators.csrf import csrf_protect, csrf_exempt

morph = pymorphy2.MorphAnalyzer()


def is_nsfw(image):
    # TODO: Решить, нужна ли эта проверка
    return False


def csrf_protect_authenticated(view_func):
    @wraps(view_func)
    def wrapper(request, *args, **kwargs):
        if request.method == "POST" and request.user.is_authenticated:
            return csrf_protect(view_func)(request, *args, **kwargs)
        return csrf_exempt(view_func)(request, *args, **kwargs)

    return wrapper


def date_to_time_ago(date) -> str:
    delta = timezone.localtime() - date

    if delta < timedelta(minutes=1):
        return "только что"

    if delta < timedelta(hours=1):
        minutes = delta.seconds // 60
        return f"{minutes} {morph.parse('минута')[0].make_agree_with_number(minutes).word} назад"

    if delta < timedelta(days=1):
        hours = delta.seconds // 3600
        return f"{hours} {morph.parse('час')[0].make_agree_with_number(hours).word} назад"

    if delta < timedelta(days=7):
        days = delta.days
        return f"{days} {morph.parse('день')[0].make_agree_with_number(days).word} назад"

    if delta < timedelta(days=30):
        weeks = delta.days // 7
        return f"{weeks} {morph.parse('неделя')[0].make_agree_with_number(weeks).word} назад"

    if delta < timedelta(days=365):
        months = delta.days // 30
        return f"{months} {morph.parse('месяц')[0].make_agree_with_number(months).word} назад"

    if delta > timedelta(days=365):
        years = delta.days // 365  # FIXME: пофиксить годы (чтобы было не 8 годов назад)
        return f"{years} {morph.parse('год')[0].make_agree_with_number(years).word} назад"

    return date


def render_error(request, error_message):
    return render(request, 'error.html', {"error_message": error_message})
