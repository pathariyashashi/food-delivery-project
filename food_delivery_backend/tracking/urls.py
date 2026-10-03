from django.urls import path

from .views import (
    UpdateRiderLocationView,
    RiderListView,
)


urlpatterns = [

    path(
        "tracking/location/",
        UpdateRiderLocationView.as_view(),
        name="update-rider-location",
    ),

    path(
        "tracking/riders/",
        RiderListView.as_view(),
        name="rider-list",
    ),

]