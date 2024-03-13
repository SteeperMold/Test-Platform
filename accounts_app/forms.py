from django import forms
from django.contrib.auth import get_user_model
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth.forms import UsernameField, AuthenticationForm, PasswordChangeForm

User = get_user_model()


class SignUpForm(UserCreationForm):
    username = UsernameField(
        label="",
        widget=forms.TextInput(attrs={
            "class": "input-default",
            "placeholder": "Имя пользователя",
        })
    )
    email = forms.EmailField(
        label="",
        widget=forms.EmailInput(attrs={
            "class": "input-default",
            "placeholder": "Электронная почта",
            "autocomplete": "email",
        })
    )
    password1 = forms.CharField(
        label="",
        strip=False,
        widget=forms.PasswordInput(attrs={
            "class": "input-default",
            "placeholder": "Пароль",
            "autocomplete": "new-password",
        })
    )
    password2 = forms.CharField(
        label="",
        strip=False,
        widget=forms.PasswordInput(attrs={
            "class": "input-default",
            "placeholder": "Повторите пароль",
            "autocomplete": "new-password",
        })
    )

    class Meta:
        model = User
        fields = ("username", "email")
        field_classes = {"username": UsernameField, "email": forms.EmailField}

    def clean_email(self):
        email = self.cleaned_data.get("email")
        if email and self._meta.model.objects.filter(email__iexact=email).exists():
            self.add_error("email", "Пользователь с таким адресом электронной почты уже существует.")
        else:
            return email


class UserAuthenticationForm(AuthenticationForm):
    username = UsernameField(
        label="",
        widget=forms.TextInput(attrs={
            "class": "input-default",
            "placeholder": "Имя пользователя",
        }))
    password = forms.CharField(
        label="",
        strip=False,
        widget=forms.PasswordInput(attrs={
            "class": "input-default",
            "placeholder": "Пароль",
            "autocomplete": "current-password",
        })
    )


class UserPasswordChangeForm(PasswordChangeForm):
    old_password = forms.CharField(
        label="",
        strip=False,
        widget=forms.PasswordInput(attrs={
            "class": "input-default",
            "placeholder": "Введите ваш старый пароль",
            "autocomplete": "current-password",
            "autofocus": True,
        }),
    )
    new_password1 = forms.CharField(
        label="",
        strip=False,
        help_text="",
        widget=forms.PasswordInput(attrs={
            "class": "input-default",
            "placeholder": "Введите новый пароль",
            "autocomplete": "new-password",
        }),
    )
    new_password2 = forms.CharField(
        label="",
        strip=False,
        widget=forms.PasswordInput(attrs={
            "class": "input-default",
            "placeholder": "Повторите новый пароль",
            "autocomplete": "new-password",
        }),
    )
