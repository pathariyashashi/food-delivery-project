from django.urls import path

from .views import (
    CreateRazorpayOrderView,
    VerifyRazorpayPaymentView,
)


urlpatterns = [
    path(
        "payments/create/",
        CreateRazorpayOrderView.as_view(),
        name="create-razorpay-order"
    ),

    path(
        "payments/verify/",
        VerifyRazorpayPaymentView.as_view(),
        name="verify-razorpay-payment"
    ),
]