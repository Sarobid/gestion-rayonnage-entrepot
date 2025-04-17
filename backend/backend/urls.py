from django.urls import path,include
from django.contrib import admin

urlpatterns = [
    path('manager/',admin.site.urls),
    path('api/', include('api.emplacement.urls')),

]