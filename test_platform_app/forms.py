from django import forms
from django.contrib.auth import get_user_model

User = get_user_model()


class RegistrationForm(forms.ModelForm):
    class Meta:
        model = User
        fields = ['username', 'email', 'password']
        widgets = {
            'username': forms.TextInput(
                attrs={'class': 'input-default', 'placeholder': 'Имя пользователя', 'autocomplete': 'username'}),
            'email': forms.EmailInput(
                attrs={'class': 'input-default', 'placeholder': 'Электронная почта', 'autocomplete': 'email'}),
            'password': forms.PasswordInput(
                attrs={'placeholder': 'Пароль', "class": 'input-default', 'autocomplete': 'new-password'}),
        }


class LoginForm(forms.Form):
    email = forms.CharField(widget=forms.EmailInput(
        attrs={'class': 'input-default', 'placeholder': 'Электронная почта', 'autocomplete': 'email'}))
    password = forms.CharField(widget=forms.PasswordInput(
        attrs={'class': 'input-default', 'placeholder': 'Пароль', 'autocomplete': 'password'}))
