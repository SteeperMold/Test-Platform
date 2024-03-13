from django.contrib.auth import login, logout
from django.contrib.auth.views import LoginView, RedirectURLMixin, PasswordChangeView
from django.http.response import HttpResponseRedirect
from django.urls import reverse_lazy
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_protect
from django.views.generic import CreateView
from django.views.generic.base import View

from .forms import UserAuthenticationForm, SignUpForm, UserPasswordChangeForm


class AnonymousRequiredMixin:
    def dispatch(self, request, *args, **kwargs):
        if request.user.is_authenticated:
            return HttpResponseRedirect(self.success_url or reverse_lazy(self.next_page))
        return super().dispatch(request, *args, **kwargs)


class UserSignupView(AnonymousRequiredMixin, CreateView):
    form_class = SignUpForm
    template_name = "registration/signup.html"
    success_url = reverse_lazy('profile')

    def form_valid(self, form):
        self.object = form.save()
        login(self.request, self.object)
        return HttpResponseRedirect(self.get_success_url())


class UserLogoutView(RedirectURLMixin, View):
    next_page = 'main'

    @method_decorator(csrf_protect)
    def post(self, request, *args, **kwargs):
        logout(request)
        return HttpResponseRedirect(self.get_success_url())


class UserLoginView(AnonymousRequiredMixin, LoginView):
    form_class = UserAuthenticationForm
    next_page = 'profile'


class UserPasswordChangeView(PasswordChangeView):
    form_class = UserPasswordChangeForm
