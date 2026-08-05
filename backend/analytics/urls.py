from django.urls import path
from analytics.views import (
    ProgramListView, 
    RankingForecastListView,
    ProgramPredictView, 
    DashboardAnalyticsView, 
    IngestExcelView,
    DepartmentNamesView
)

urlpatterns = [
    path('programs/', ProgramListView.as_view(), name='program-list'),
    path('department-names/', DepartmentNamesView.as_view(), name='department-names-list'),
    path('ranking-forecasts/', RankingForecastListView.as_view(), name='ranking-forecast-list'),
    path('predict/<int:program_id>/', ProgramPredictView.as_view(), name='program-predict'),
    path('analytics/', DashboardAnalyticsView.as_view(), name='dashboard-analytics'),
    path('ingest/', IngestExcelView.as_view(), name='ingest-excel'),
]
