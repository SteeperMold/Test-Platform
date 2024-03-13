from django.contrib.auth import get_user_model
from django.db import models

User = get_user_model()


class Test(models.Model):
    title = models.CharField(max_length=255)
    creation_date = models.DateTimeField(auto_now_add=True)
    theme = models.CharField(max_length=255)
    likes = models.PositiveIntegerField(default=0)
    dislikes = models.PositiveIntegerField(default=0)
    creator = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
    custom_diploma_template = models.TextField(null=True, blank=True)

    def increment_likes(self):
        self.likes += 1
        self.save()

    def increment_dislikes(self):
        self.dislikes += 1
        self.save()


class Image(models.Model):
    image = models.ImageField(upload_to='images/')


class Question(models.Model):
    test = models.ForeignKey(Test, on_delete=models.CASCADE)
    question_text = models.TextField()
    answer_text = models.TextField(null=True, blank=True)
    question_type = models.CharField(max_length=255)
    image = models.ImageField(upload_to='images/', null=True, blank=True)


class AnswerOption(models.Model):
    question = models.ForeignKey(Question, on_delete=models.CASCADE)
    option_text = models.TextField()


class UserTestResult(models.Model):
    test = models.ForeignKey(Test, on_delete=models.CASCADE)
    completion_date = models.DateTimeField(auto_now_add=True)
    users_name = models.TextField(null=True, blank=True)
    users_surname = models.TextField(null=True, blank=True)
    school_name = models.TextField(null=True, blank=True)
    percentage = models.IntegerField()


class UserAnswer(models.Model):
    user_test_result = models.ForeignKey(UserTestResult, on_delete=models.CASCADE)
    question = models.ForeignKey(Question, on_delete=models.CASCADE)
    answer_text = models.TextField(blank=True, null=True)
    is_correct = models.BooleanField(blank=True, null=True)
