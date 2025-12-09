from django.urls import path
from . import views

urlpatterns = [
    path('overview/', views.AnalyticsOverview.as_view(), name='analytics-overview'),
    path('top-products/', views.TopProductsView.as_view(), name='analytics-top-products'),
    path('stock-levels/', views.StockLevelsView.as_view(), name='analytics-stock-levels'),
]