import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./OrderDetail.css";

const API_BASE = "http://127.0.0.1:8000/api";

function OrderDetail() {
    const { orderId } = useParams();
    const navigate = useNavigate();

    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const token = localStorage.getItem("access_token");

        if (!token) {
            navigate("/login");
            return;
        }

        const fetchOrder = async () => {
            try {
                setLoading(true);
                setError("");

                const response = await fetch(
                    `${API_BASE}/orders/${orderId}/`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(
                        data?.detail ||
                        data?.error ||
                        "Unable to load order"
                    );
                }

                setOrder(data);
            } catch (err) {
                setError(
                    err.message ||
                    "Unable to load order details"
                );
            } finally {
                setLoading(false);
            }
        };

        fetchOrder();
    }, [orderId, navigate]);

    const getStatusLabel = (status) => {
        switch (status) {
            case "pending":
                return "Pending";
            case "confirmed":
                return "Confirmed";
            case "preparing":
                return "Preparing";
            case "out_for_delivery":
                return "Out for Delivery";
            case "delivered":
                return "Delivered";
            case "cancelled":
                return "Cancelled";
            default:
                return status || "Pending";
        }
    };

    if (loading) {
        return (
            <div className="order-detail-page">
                <div className="order-detail-message">
                    Loading order details...
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="order-detail-page">
                <div className="order-detail-message error">
                    <h2>Unable to load order</h2>
                    <p>{error}</p>

                    <button
                        onClick={() => navigate("/orders")}
                    >
                        ← Back to Orders
                    </button>
                </div>
            </div>
        );
    }

    if (!order) {
        return null;
    }

    return (
        <div className="order-detail-page">

            <header className="order-detail-header">

                <button
                    className="order-detail-back"
                    onClick={() => navigate("/orders")}
                >
                    ← Back to Orders
                </button>

                <div>
                    <h1>Order #{order.id}</h1>

                    <p>
                        {order.created_at
                            ? new Date(
                                order.created_at
                            ).toLocaleString("en-IN")
                            : ""}
                    </p>
                </div>

                <span
                    className={`detail-status ${order.status}`}
                >
                    {getStatusLabel(order.status)}
                </span>

            </header>

            <main className="order-detail-container">

                {/* RESTAURANT */}

                <section className="detail-card">

                    <h2>Restaurant</h2>

                    <div className="restaurant-detail">
                        <strong>
                            {order.restaurant_name ||
                                order.restaurant?.name ||
                                "Restaurant"}
                        </strong>

                        {order.restaurant?.address && (
                            <span>
                                {order.restaurant.address}
                            </span>
                        )}
                    </div>

                </section>

                {/* ITEMS */}

                <section className="detail-card">

                    <h2>Order Items</h2>

                    <div className="order-items">

                        {order.items &&
                        order.items.length > 0 ? (
                            order.items.map((item, index) => (
                                <div
                                    className="order-item"
                                    key={
                                        item.id ||
                                        `${item.food_name}-${index}`
                                    }
                                >
                                    <div>
                                        <strong>
                                            {item.food_name ||
                                                item.name ||
                                                "Food Item"}
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
                                            (
                                                Number(
                                                    item.price || 0
                                                ) *
                                                Number(
                                                    item.quantity || 0
                                                )
                                            )
                                        ).toFixed(2)}
                                    </strong>
                                </div>
                            ))
                        ) : (
                            <p className="no-items">
                                No item details available.
                            </p>
                        )}

                    </div>

                </section>

                {/* DELIVERY */}

                <section className="detail-card">

                    <h2>Delivery Information</h2>

                    <div className="delivery-info">

                        <div>
                            <span>
                                Delivery Address
                            </span>

                            <strong>
                                {order.delivery_address ||
                                    "Not available"}
                            </strong>
                        </div>

                        <div>
                            <span>
                                Order Status
                            </span>

                            <strong>
                                {getStatusLabel(
                                    order.status
                                )}
                            </strong>
                        </div>

                    </div>

                </section>

                {/* TOTAL */}

                <section className="detail-card total-card">

                    <div>
                        <span>
                            Total Amount
                        </span>

                        <strong>
                            ₹
                            {Number(
                                order.total_amount || 0
                            ).toFixed(2)}
                        </strong>
                    </div>

                </section>

                {/* TRACK */}

                {order.status === "out_for_delivery" && (
                    <button
                        className="detail-track-btn"
                        onClick={() =>
                            navigate(
                                `/tracking/${order.id}`
                            )
                        }
                    >
                        🛵 Track Your Order
                    </button>
                )}

            </main>

        </div>
    );
}

export default OrderDetail;