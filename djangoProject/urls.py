from django.conf import settings
from django.conf.urls.static import static
from django.contrib.auth.views import PasswordChangeDoneView, PasswordResetView, PasswordResetDoneView
from django.contrib.auth.views import PasswordResetConfirmView, PasswordResetCompleteView
from django.urls import path

from accounts_app import views as auth_views
from test_platform_app import api_views
from test_platform_app import views

urlpatterns = [
    path('', views.main, name='main'),
    path('tests/', views.tests, name='tests'),
    path('create-test/', views.create_test, name='test_constructor'),
    path('test/<int:test_id>/', views.test, name='test'),
    path('download_diploma/', views.download_diploma, name='download_diploma'),
    path('like/<int:test_id>/', views.like, name='like'),
    path('dislike/<int:test_id>/', views.dislike, name='dislike'),
    # Accounts
    path('accounts/signup/', auth_views.UserSignupView.as_view(), name='signup'),
    path('accounts/logout/', auth_views.UserLogoutView.as_view(), name='logout'),
    path('accounts/login/', auth_views.UserLoginView.as_view(), name='login'),
    path('accounts/password-change/', auth_views.UserPasswordChangeView.as_view(), name='password_change'),
    path('accounts/password-change/done/', PasswordChangeDoneView.as_view(), name='password_change_done'),
    path('accounts/password-reset/', PasswordResetView.as_view(), name='password_reset'),
    path('accounts/password-reset/done/', PasswordResetDoneView.as_view(), name='password_reset_done'),
    path('accounts/reset/<uidb64>/<token>/', PasswordResetConfirmView.as_view(), name='password_reset_confirm'),
    path('accounts/reset/done/', PasswordResetCompleteView.as_view(), name='password_reset_complete'),
    # Profile
    path('profile/', views.profile, name='profile'),
    path('settings/', views.settings, name='settings'),
    path('test/<int:test_id>/stats/', views.stats, name='test_stats'),
    path('test/<int:test_id>/edit/', views.edit_test, name='edit_test'),
    path('test/<int:test_id>/stats/useranswers/<int:user_test_result_id>/', views.user_answers, name='user_answers'),
    # API
    path('api/get_user_data/', api_views.get_user_data, name='get_user_info'),
    path('api/get_test_edit_data/<int:test_id>/', api_views.get_test_edit_data, name='get_test_edit_data'),
    path('api/get_test_data/<int:test_id>/', api_views.get_test_data, name='get_test_data'),
    path('api/upload_image/', api_views.upload_image, name='upload_image'),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
