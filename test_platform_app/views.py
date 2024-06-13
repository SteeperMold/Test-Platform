import random

import pdfkit
import pymorphy2
from bs4 import BeautifulSoup
from django.contrib.auth import get_user_model
from django.http import HttpResponse
from django.shortcuts import render, redirect
from django.template import Context, Template
from django.views.decorators.csrf import ensure_csrf_cookie
from django.views.decorators.http import require_GET, require_POST, require_http_methods

from test_platform_app.models import Test, Question, AnswerOption, UserTestResult, UserAnswer
from .utils import date_to_time_ago, render_error, is_nsfw, csrf_protect_authenticated

User = get_user_model()
morph = pymorphy2.MorphAnalyzer()

NO_ANSWER_QUESTION_TYPES = ('name', 'school_name')


@require_GET
def main(request):
    return render(request, 'main_page.html')


@require_GET
def tests(request):
    search_query = request.GET.get('search_query')

    if not search_query:
        return render(request, 'tests.html')

    tests = Test.objects.filter(title__icontains=search_query)

    for test in tests:
        test.creation_time_ago = date_to_time_ago(test.creation_date)

    context = {
        'query': search_query,
        'tests': tests,
    }

    return render(request, 'tests.html', context)


@require_http_methods(["GET", "POST"])
@csrf_protect_authenticated
def create_test(request):
    if request.method == "GET":
        return render(request, "index.html")

    title = request.POST.get("title")
    theme = request.POST.get("theme")

    question_texts = request.POST.getlist("question_texts")
    question_types = request.POST.getlist("question_types")

    test = Test(title=title, theme=theme)

    if request.user.is_authenticated:
        test.creator = request.user

    if diploma_template := request.POST.get("diploma_template"):
        test.custom_diploma_template = diploma_template

    if background_image := request.POST.get("background_image_url"):
        test.diploma_background_image_url = background_image

    questions_to_save = []
    answer_options_to_save = []

    for i, (question_type, question_text) in enumerate(zip(question_types, question_texts)):
        answer_text = request.POST.get(f"answer_text[{i}]")

        question = Question(test=test, question_text=question_text,
                            answer_text=answer_text, question_type=question_type)

        if question_type == 'image':
            image = request.FILES.get(f'image[{i}]')

            if not image:
                return render_error(request, 'Не удалось сохранить изображение!')

            if is_nsfw(image.read()):
                return render_error(request, 'Тест содержит неприемлимые изображения!')

            question.image = image

        elif question_type == 'choice':
            for option_text in request.POST.getlist(f'option_texts[{i}]'):
                answer_option = AnswerOption(question=question, option_text=option_text)
                answer_options_to_save.append(answer_option)

        questions_to_save.append(question)

    test.save()
    for question in questions_to_save:
        question.save()

    for answer_option in answer_options_to_save:
        answer_option.save()

    context = {
        "test_id": test.id,
        "base_url": request.build_absolute_uri('/').rstrip('/'),
    }

    return render(request, 'adding_test_success.html', context)


@require_POST
def like(request, test_id):
    if not request.user.is_authenticated:
        return HttpResponse(status=403)

    test = Test.objects.get(id=test_id)
    test.increment_likes()
    return HttpResponse(status=200)


@require_POST
def dislike(request, test_id):
    if not request.user.is_authenticated:
        return HttpResponse(status=403)

    test = Test.objects.get(id=test_id)
    test.increment_dislikes()
    return HttpResponse(status=200)


@require_http_methods(["GET", "POST"])
@ensure_csrf_cookie
@csrf_protect_authenticated
def test(request, test_id):
    if request.method == 'GET':
        return render(request, "index.html")

    if not Test.objects.filter(id=test_id).exists():
        return render_error(request, "Тест не найден")

    test = Test.objects.get(id=test_id)

    if not Question.objects.filter(test=test).exists():
        return render_error(request, "Некоректный тест")

    questions = Question.objects.filter(test=test)

    users_name = request.POST.get("users_name")
    users_surname = request.POST.get("users_surname")
    school_name = request.POST.get("school_name")

    request.session['test_id'] = test.id
    request.session['user_name'] = users_name
    request.session['user_surname'] = users_surname
    request.session['user_school_name'] = school_name

    test_answers = UserTestResult(test=test, users_name=users_name,
                                  users_surname=users_surname, school_name=school_name)

    correct_answers = 0
    user_answers_to_save = []

    for i, question in enumerate(questions):
        answer = request.POST.get(f"answer[{i}]")

        if question.question_type not in NO_ANSWER_QUESTION_TYPES:
            user_answer = UserAnswer(user_test_result=test_answers, question=question,
                                     answer_text=answer, is_correct=False)

            if question.answer_text.lower() == answer.lower():
                correct_answers += 1
                user_answer.is_correct = True

            user_answers_to_save.append(user_answer)

    questions_count = len([q for q in questions if q.question_type not in NO_ANSWER_QUESTION_TYPES])
    percentage = round(correct_answers / questions_count * 100) if questions_count != 0 else 100

    test_answers.percentage = percentage
    test_answers.save()

    for user_answer in user_answers_to_save:
        user_answer.save()

    word_correct = morph.parse("правильный")[0].make_agree_with_number(correct_answers).word
    word_answer = morph.parse("ответ")[0].make_agree_with_number(correct_answers).word

    correct_answers_text = f'{correct_answers} {word_correct} {word_answer}'

    word_correct = morph.parse("неправильный")[0].make_agree_with_number(questions_count - correct_answers).word
    word_answer = morph.parse("ответ")[0].make_agree_with_number(questions_count - correct_answers).word

    incorrect_answers_text = f'{questions_count - correct_answers} {word_correct} {word_answer}'

    request.session['percentage'] = percentage
    request.session['correct_answers_num'] = correct_answers
    request.session['incorrect_answers_num'] = questions_count - correct_answers
    request.session["correct_answers_text"] = correct_answers_text
    request.session["incorrect_answers_text"] = incorrect_answers_text

    splashes = {range(100, 101): ["Так держать!"],
                range(50, 100): ["Ну почти", "Ошибки - это нормально"],
                range(20, 50): ["Не лучший результат...", "В следующий раз постарайтесь лучше!"],
                range(0, 20): ["Оценки - не главное"]}

    splash = ''
    for splash_range, splash_texts in splashes.items():
        if percentage in splash_range:
            splash = random.choice(splash_texts)
            break

    context = {
        'percentage': percentage,
        'splash': splash,
        'correct_answers_text': correct_answers_text,
        'incorrect_answers_text': incorrect_answers_text,
        'test_id': test_id,
    }

    return render(request, 'result.html', context)


@require_GET
def download_diploma(request):
    test_id = request.session.get("test_id")

    if not Test.objects.filter(id=test_id).exists():
        return render_error(request, "Тест не существует")

    if request.session.get("percentage") is None:
        return render_error(request, "Вы не прошли тест")

    context = {
        'percentage': request.session.get('percentage'),
        'correct_answers_text': request.session.get('correct_answers_text'),
        'incorrect_answers_text': request.session.get('incorrect_answers_text'),
        'correct_answers_num': request.session.get('correct_answers_num'),
        'incorrect_answers_num': request.session.get('incorrect_answers_num'),
        'user_name': request.session.get('user_name') or '???',
        'user_surname': request.session.get('user_surname') or '???',
        'user_school_name': request.session.get('user_school_name') or '???',
    }

    diploma_template = Test.objects.get(id=test_id).custom_diploma_template

    if diploma_template:
        html_content = Template(diploma_template).render(Context(context))
        soup = BeautifulSoup(html_content, 'html.parser')
        for p in soup.find_all('p'):
            if not p.get_text(strip=True):
                p['style'] = "height: 13px;"
        html_content = str(soup)
    else:
        html_template = render(request, 'diploma.html', context)
        html_content = html_template.content.decode('utf-8')

    pdf = pdfkit.from_string(html_content, False, options={'encoding': 'utf-8'})

    response = HttpResponse(pdf, content_type='application/pdf')
    response['Content-Disposition'] = 'attachment; filename="Diploma.pdf"'

    return response


@require_GET
def profile(request):
    if not request.user.is_authenticated:
        return render_error(request, "Вам нужно войти в аккаунт, чтобы просматривать его статистику!")

    tests = Test.objects.filter(creator=request.user)

    for test in tests:
        test.creation_time_ago = date_to_time_ago(test.creation_date)
        test.completions_count = len(UserTestResult.objects.filter(test=test))
        test.completions_count_text = morph.parse('прохождение')[0].make_agree_with_number(test.completions_count).word

    return render(request, 'profile.html', {"tests": tests})


@require_http_methods(["GET", "POST"])
def settings(request):
    if request.method == "GET":
        return render(request, 'settings.html')

    request.session["django_timezone"] = request.POST.get("timezone")
    return redirect("profile")


@require_GET
def stats(request, test_id):
    if not request.user.is_authenticated:
        return render_error(request, "Вам нужно войти в аккаунт, чтобы просматривать статистику ваших тестов!")

    if not Test.objects.filter(id=test_id).exists():
        return render_error(request, "Тест не найден")

    if not Test.objects.filter(id=test_id, creator=request.user).exists():
        return render_error(request, "Вы обязаны быть создателем теста, чтобы просматривать его статистку!")

    test = Test.objects.get(id=test_id, creator=request.user)

    user_test_results = UserTestResult.objects.filter(test=test)

    context = {
        "test": test,
        "user_test_results": user_test_results
    }

    return render(request, 'test_stats.html', context)


@require_GET
def user_answers(request, test_id, user_test_result_id):
    if not request.user.is_authenticated:
        return render_error(request, "Вам нужно войти в аккаунт, чтобы просматривать статистику ваших тестов!")

    if not Test.objects.filter(id=test_id).exists():
        return render_error(request, "Тест не найден")

    if not Test.objects.filter(id=test_id, creator=request.user):
        return render_error(request, "Вы обязаны быть создателем теста, чтобы просматривать его статистку!")

    test = Test.objects.get(id=test_id)

    if not UserTestResult.objects.filter(id=user_test_result_id).exists():
        return render_error(request, "Ответы пользователя не найдены")

    user_test_result = UserTestResult.objects.get(id=user_test_result_id)

    if not Question.objects.filter(test=test).exists():
        return render_error(request, "Некорректный тест")

    questions = Question.objects.filter(test=test)

    if not UserAnswer.objects.filter(user_test_result=user_test_result).exists():
        return render_error(request, "Ответы пользователя не найдены")

    user_answers = UserAnswer.objects.filter(user_test_result=user_test_result)

    questions_and_answers_zip = zip([q for q in questions if q.question_type not in NO_ANSWER_QUESTION_TYPES],
                                    user_answers)

    context = {
        "test": test,
        "user_test_result": user_test_result,
        "question_and_answer_zip": questions_and_answers_zip,
    }

    return render(request, 'user_answers.html', context)


@require_http_methods(["GET", "POST"])
@ensure_csrf_cookie
@csrf_protect_authenticated
def edit_test(request, test_id):
    if request.method == 'GET':
        return render(request, "index.html")

    if not Test.objects.filter(id=test_id).exists():
        return render_error(request, "Тест не существует")

    test = Test.objects.get(id=test_id)

    test.title = request.POST.get("title")
    test.theme = request.POST.get("theme")

    question_texts = request.POST.getlist("question_texts")
    question_types = request.POST.getlist("question_types")

    questions_to_save = []
    answer_options_to_save = []

    for i, (question_type, question_text) in enumerate(zip(question_types, question_texts)):
        answer_text = request.POST.get(f"answer_text[{i}]")

        question = Question(test=test, question_text=question_text,
                            answer_text=answer_text, question_type=question_type)

        if question_type == 'image':
            image = request.FILES.get(f'image[{i}]')

            if not image:
                return render_error(request, 'Не удалось сохранить изображение!')

            if is_nsfw(image.read()):
                return render_error(request, 'Тест содержит неприемлимые изображения!')

            question.image = image

        elif question_type == 'choice':
            for option_text in request.POST.getlist(f'option_texts[{i}]'):
                answer_option = AnswerOption(question=question, option_text=option_text)
                answer_options_to_save.append(answer_option)

        questions_to_save.append(question)

    if request.POST.get("diploma_template"):
        test.custom_diploma_template = request.POST.get("diploma_template")

    test.save()

    for question in Question.objects.filter(test=test):
        AnswerOption.objects.filter(question=question).delete()

    Question.objects.filter(test=test).delete()

    for question in questions_to_save:
        question.save()

    for answer_option in answer_options_to_save:
        answer_option.save()

    for user_test_result in UserTestResult.objects.filter(test=test):
        UserAnswer.objects.filter(user_test_result=user_test_result).delete()

    UserTestResult.objects.filter(test=test).delete()

    context = {
        "test_id": test.id,
        "base_url": request.build_absolute_uri('/').rstrip('/'),
        "edited": True,
    }

    return render(request, 'adding_test_success.html', context)
