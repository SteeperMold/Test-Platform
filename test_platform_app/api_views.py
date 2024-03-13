import random

from rest_framework import status
from rest_framework.decorators import api_view, parser_classes
from rest_framework.parsers import MultiPartParser
from rest_framework.response import Response

from .models import Test, Question
from .serializers import TestSerializer, QuestionSerializer, SafeTestSerializer, SafeQuestionSerializer, ImageSerializer


@api_view(['GET'])
def get_user_data(request):
    if request.user.is_authenticated:
        user_data = {
            'authenticated': True,
            'username': request.user.username,
            'email': request.user.email,
        }
        return Response(user_data, status=status.HTTP_200_OK)
    return Response({'authenticated': False}, status=status.HTTP_200_OK)


@api_view(['GET'])  # Выдает всю информацию теста, в том числе и правильные ответы
def get_test_edit_data(request, test_id):
    response = {}

    if not Test.objects.filter(id=test_id).exists():
        return Response({'error': 'test not found'}, status=status.HTTP_200_OK)

    # if not request.user.is_authenticated or not Test.objects.filter(id=test_id, creator=request.user).exists():
    #     return Response({'error': 'not a creator'}, status=status.HTTP_200_OK)

    test = Test.objects.get(id=test_id)
    response['test'] = TestSerializer(test).data

    if not Question.objects.filter(test=test).exists():
        return Response({'error': "questions not found"}, status=status.HTTP_200_OK)

    questions = Question.objects.filter(test=test)

    for question in questions:
        if question.question_type == 'choice':
            question.answer_options = [q.option_text for q in question.answeroption_set.all()]

    response['questions'] = QuestionSerializer(questions, many=True).data

    return Response(response, status=status.HTTP_200_OK)


@api_view(['GET'])  # Выдает только "безопасную" информацию теста, то есть всё, кроме правильных ответов
def get_test_data(request, test_id):
    response = {}

    if not Test.objects.filter(id=test_id).exists():
        return Response({'error': 'test not found'}, status=status.HTTP_200_OK)

    test = Test.objects.get(id=test_id)
    response['test'] = SafeTestSerializer(test).data

    if not Question.objects.filter(test=test).exists():
        return Response({'error': "questions not found"}, status=status.HTTP_200_OK)

    questions = Question.objects.filter(test=test)

    for question in questions:
        if question.question_type == 'choice':
            question.answer_options = [q.option_text for q in question.answeroption_set.all()] + [question.answer_text]
            random.shuffle(question.answer_options)

    response['questions'] = SafeQuestionSerializer(questions, many=True).data

    return Response(response, status=status.HTTP_200_OK)


@api_view(['PUT'])
@parser_classes([MultiPartParser])
def put_image(request):
    serializer = ImageSerializer(data=request.data)

    if serializer.is_valid():
        serializer.save()
        image_url = f"{request.build_absolute_uri('/')}{serializer.data['image']}"

        return Response({'image_url': image_url}, status=status.HTTP_200_OK)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
