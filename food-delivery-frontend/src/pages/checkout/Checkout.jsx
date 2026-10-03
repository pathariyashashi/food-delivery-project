import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Checkout.css";

const API_BASE = "http://127.0.0.1:8000/api";

function Checkout() {
    const navigate = useNavigate();

    const [cart, setCart] = useState(null);
    const [loading, setLoading] = useState(true);
    const [placingOrder, setPlacingOrder] = useState(false);
    const [error, setError] = useState("");

    const [address, setAddress] = useState("");
    const [paymentMethod, setPaymentMethod] = useState("cod");

    const token = localStorage.getItem("access_token");
    const userEmail = localStorage.getItem("user_email") || "";

    useEffect(() => {
        if (!token) {
            navigate("/login");
            return;
        }

        loadCart();
    }, [token]);

    const loadCart = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await fetch(`${API_BASE}/cart/`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data?.detail ||
                    data?.message ||
                    "Unable to load cart"
                );
            }

            setCart(data);

            if (!data?.items || data.items.length === 0) {
                navigate("/cart");
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const getSubtotal = () => {
        return Number(cart?.total_amount || 0);
    };

    const deliveryFee = 40;

    const grandTotal = getSubtotal() + deliveryFee;

    // -----------------------------------------
    // Load Razorpay Checkout Script
    // -----------------------------------------
    const loadRazorpayScript = () => {
        return new Promise((resolve) => {
            if (window.Razorpay) {
                resolve(true);
                return;
            }

            const script = document.createElement("script");

            script.src =
                "https://checkout.razorpay.com/v1/checkout.js";

            script.onload = () => {
                resolve(true);
            };

            script.onerror = () => {
                resolve(false);
            };

            document.body.appendChild(script);
        });
    };

    // -----------------------------------------
    // Place COD Order
    // -----------------------------------------
    const placeCODOrder = async () => {
        try {
            setPlacingOrder(true);
            setError("");

            const response = await fetch(
                `${API_BASE}/orders/place/`,
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        delivery_address: address.trim(),
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data?.detail ||
                    data?.message ||
                    "Unable to place order"
                );
            }

            if (data?.id) {
                localStorage.setItem(
                    "last_order_id",
                    data.id
                );
            }

            navigate("/orders");
        } catch (err) {
            setError(err.message);
        } finally {
            setPlacingOrder(false);
        }
    };

    // -----------------------------------------
    // Online Payment
    // -----------------------------------------
    const startOnlinePayment = async () => {
        try {
            setPlacingOrder(true);
            setError("");

            // 1. Load Razorpay
            const razorpayLoaded =
                await loadRazorpayScript();

            if (!razorpayLoaded) {
                throw new Error(
                    "Razorpay failed to load. Please check your internet connection."
                );
            }

            // 2. Create Razorpay Order
            const createResponse = await fetch(
                `${API_BASE}/payments/create/`,
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        amount: grandTotal,
                    }),
                }
            );

            const razorpayOrder =
                await createResponse.json();

            if (!createResponse.ok) {
                throw new Error(
                    razorpayOrder?.error ||
                    razorpayOrder?.details ||
                    "Unable to create payment order"
                );
            }

            // 3. Razorpay Checkout Options
            const options = {
                key: razorpayOrder.key_id,

                amount: razorpayOrder.amount,

                currency:
                    razorpayOrder.currency || "INR",

                name: "Food Delivery",

                description:
                    "Food Delivery Order Payment",

                order_id:
                    razorpayOrder.order_id,

                prefill: {
                    email: userEmail,
                },

                theme: {
                    color: "#f4511e",
                },

                handler: async function (
                    paymentResponse
                ) {
                    await verifyPayment(
                        paymentResponse
                    );
                },

                modal: {
                    ondismiss: function () {
                        setPlacingOrder(false);
                        setError(
                            "Payment was cancelled."
                        );
                    },
                },
            };

            // 4. Open Razorpay Popup
            const razorpay =
                new window.Razorpay(options);

            razorpay.on(
                "payment.failed",
                function (response) {
                    setPlacingOrder(false);

                    setError(
                        response?.error?.description ||
                        "Payment failed. Please try again."
                    );
                }
            );

            razorpay.open();
        } catch (err) {
            setError(err.message);
            setPlacingOrder(false);
        }
    };

    // -----------------------------------------
    // Verify Razorpay Payment
    // -----------------------------------------
    const verifyPayment = async (
        paymentResponse
    ) => {
        try {
            setError("");

            const verifyResponse = await fetch(
                `${API_BASE}/payments/verify/`,
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        razorpay_order_id:
                            paymentResponse.razorpay_order_id,

                        razorpay_payment_id:
                            paymentResponse.razorpay_payment_id,

                        razorpay_signature:
                            paymentResponse.razorpay_signature,
                    }),
                }
            );

            const verifyData =
                await verifyResponse.json();

            if (!verifyResponse.ok) {
                throw new Error(
                    verifyData?.error ||
                    verifyData?.message ||
                    "Payment verification failed"
                );
            }

            if (!verifyData?.verified) {
                throw new Error(
                    "Payment could not be verified."
                );
            }

            // 5. Payment verified successfully
            // Now create actual food order
            await placePaidOrder();
        } catch (err) {
            setPlacingOrder(false);
            setError(err.message);
        }
    };

    // -----------------------------------------
    // Create Order After Successful Payment
    // -----------------------------------------
    const placePaidOrder = async () => {
        try {
            const response = await fetch(
                `${API_BASE}/orders/place/`,
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        delivery_address:
                            address.trim(),
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data?.detail ||
                    data?.message ||
                    "Payment succeeded but order creation failed."
                );
            }

            if (data?.id) {
                localStorage.setItem(
                    "last_order_id",
                    data.id
                );
            }

            navigate("/orders");
        } catch (err) {
            setError(err.message);
            setPlacingOrder(false);
        }
    };

    // -----------------------------------------
    // Main Place Order Handler
    // -----------------------------------------
    const placeOrder = async () => {
        if (!address.trim()) {
            setError(
                "Please enter your delivery address."
            );
            return;
        }

        setError("");

        if (paymentMethod === "online") {
            await startOnlinePayment();
            return;
        }

        await placeCODOrder();
    };

    if (loading) {
        return (
            <div className="checkout-loading">
                Loading checkout...
            </div>
        );
    }

    return (
        <div className="checkout-page">

            <header className="checkout-header">

                <div>
                    <button
                        className="checkout-back"
                        onClick={() =>
                            navigate("/cart")
                        }
                    >
                        ← Back to Cart
                    </button>

                    <h1>Checkout</h1>

                    <p>
                        Complete your order securely
                    </p>
                </div>

            </header>

            <main className="checkout-container">

                <section className="checkout-main">

                    {/* Delivery Address */}

                    <div className="checkout-card">

                        <div className="section-heading">

                            <div className="section-number">
                                1
                            </div>

                            <div>
                                <h2>
                                    Delivery Address
                                </h2>

                                <p>
                                    Where should we
                                    deliver your order?
                                </p>
                            </div>

                        </div>

                        <textarea
                            className="address-input"
                            value={address}
                            onChange={(e) =>
                                setAddress(
                                    e.target.value
                                )
                            }
                            placeholder="Enter your complete delivery address..."
                            rows="5"
                        />

                    </div>

                    {/* Payment */}

                    <div className="checkout-card">

                        <div className="section-heading">

                            <div className="section-number">
                                2
                            </div>

                            <div>
                                <h2>
                                    Payment Method
                                </h2>

                                <p>
                                    Choose how you want
                                    to pay
                                </p>
                            </div>

                        </div>

                        <div className="payment-options">

                            {/* COD */}

                            <button
                                type="button"
                                className={`payment-option ${
                                    paymentMethod ===
                                    "cod"
                                        ? "selected"
                                        : ""
                                }`}
                                onClick={() =>
                                    setPaymentMethod(
                                        "cod"
                                    )
                                }
                            >

                                <div className="payment-radio">
                                    <span></span>
                                </div>

                                <div className="payment-content">

                                    <strong>
                                        Cash on Delivery
                                    </strong>

                                    <small>
                                        Pay when your
                                        order arrives
                                    </small>

                                </div>

                                <div className="payment-label">
                                    COD
                                </div>

                            </button>

                            {/* Online */}

                            <button
                                type="button"
                                className={`payment-option ${
                                    paymentMethod ===
                                    "online"
                                        ? "selected"
                                        : ""
                                }`}
                                onClick={() =>
                                    setPaymentMethod(
                                        "online"
                                    )
                                }
                            >

                                <div className="payment-radio">
                                    <span></span>
                                </div>

                                <div className="payment-content">

                                    <strong>
                                        Online Payment
                                    </strong>

                                    <small>
                                        UPI, Card, Net
                                        Banking
                                    </small>

                                </div>

                                <div className="payment-label online">
                                    ONLINE
                                </div>

                            </button>

                        </div>

                    </div>

                    {/* Error */}

                    {error && (
                        <div className="checkout-error">
                            {error}
                        </div>
                    )}

                </section>

                {/* Order Summary */}

                <aside className="checkout-summary">

                    <h2>
                        Order Summary
                    </h2>

                    <div className="summary-items">

                        {cart?.items?.map(
                            (item) => (
                                <div
                                    className="summary-item"
                                    key={item.id}
                                >

                                    <div>

                                        <strong>
                                            {item.food_name}
                                        </strong>

                                        <span>
                                            Qty:{" "}
                                            {item.quantity}
                                        </span>

                                    </div>

                                    <strong>
                                        ₹
                                        {Number(
                                            item.subtotal ||
                                            0
                                        ).toFixed(2)}
                                    </strong>

                                </div>
                            )
                        )}

                    </div>

                    <div className="summary-divider"></div>

                    <div className="summary-row">

                        <span>
                            Subtotal
                        </span>

                        <strong>
                            ₹
                            {getSubtotal().toFixed(
                                2
                            )}
                        </strong>

                    </div>

                    <div className="summary-row">

                        <span>
                            Delivery Fee
                        </span>

                        <strong>
                            ₹
                            {deliveryFee.toFixed(
                                2
                            )}
                        </strong>

                    </div>

                    <div className="summary-divider"></div>

                    <div className="summary-total">

                        <span>
                            Total
                        </span>

                        <strong>
                            ₹
                            {grandTotal.toFixed(
                                2
                            )}
                        </strong>

                    </div>

                    <button
                        className="place-order-btn"
                        onClick={placeOrder}
                        disabled={placingOrder}
                    >
                        {placingOrder
                            ? paymentMethod ===
                              "online"
                                ? "Processing Payment..."
                                : "Placing Order..."
                            : paymentMethod ===
                              "online"
                            ? "Continue to Payment"
                            : "Place Order"}
                    </button>

                    <p className="secure-note">
                        Your order information is
                        securely processed.
                    </p>

                </aside>

            </main>

        </div>
    );
}

export default Checkout;