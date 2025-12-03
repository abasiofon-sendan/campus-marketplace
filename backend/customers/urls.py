from django.urls import path
from .views import GetUserProfileAndContents, TopCustomersView, TopVendorsView, UpdateProfileView, EditProfileView, DeleteProfileView, UploadContentView, UserDeleteProfile


urlpatterns = [
    path('top-customers/', TopCustomersView.as_view(), name='top-customers'),
    path('top-vendors/', TopVendorsView.as_view(), name='top-vendors'),
    path('profile/update/', UpdateProfileView.as_view(), name='update-profile'),
    path('profile/edit/<int:pk>/', EditProfileView.as_view(), name='edit-profile'),
    path('profile/delete/<int:pk>/', DeleteProfileView.as_view(), name='delete-profile'),
    path('user/delete/', UserDeleteProfile.as_view(), name='user-delete-profile'),
    path('profile/<int:pk>/', GetUserProfileAndContents.as_view(), name='get-profile'),
    path('content/upload/', UploadContentView.as_view(), name='upload-content'),

]