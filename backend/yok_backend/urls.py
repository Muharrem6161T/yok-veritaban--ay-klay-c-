from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse

def root_api_view(request):
    return JsonResponse({
        "status": "online",
        "service": "YÖK Veri Analitiği Platformu API",
        "endpoints": {
            "programs": "/api/programs/",
            "analytics": "/api/analytics/",
            "ranking_forecasts": "/api/ranking-forecasts/"
        }
    })

urlpatterns = [
    path('', root_api_view, name='root-api'),
    path('admin/', admin.site.urls),
    path('api/', include('analytics.urls')),
]
