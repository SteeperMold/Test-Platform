from rest_framework import serializers

from .models import Test, Question, Image


class TestSerializer(serializers.ModelSerializer):
    class Meta:
        model = Test
        fields = ['title', 'creation_date', 'theme', 'likes', 'dislikes', 'creator', 'custom_diploma_template']


class ImageSerializer(serializers.ModelSerializer):
    image = serializers.ImageField()

    class Meta:
        model = Image
        fields = ['id', 'image']


class QuestionSerializer(serializers.ModelSerializer):
    answer_options = serializers.ListField(required=False)

    class Meta:
        model = Question
        fields = ['id', 'question_text', 'answer_text', 'question_type', 'image', 'answer_options']


# Сериалайзер не содержащий ответов на вопросы, только "безопасные" данные
class SafeTestSerializer(serializers.ModelSerializer):
    class Meta:
        model = Test
        fields = ['title', 'theme']


class SafeQuestionSerializer(serializers.ModelSerializer):
    answer_options = serializers.ListField(required=False)

    class Meta:
        model = Question
        fields = ['question_text', 'question_type', 'image', 'answer_options']
