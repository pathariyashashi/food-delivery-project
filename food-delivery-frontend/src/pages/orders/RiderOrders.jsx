import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./RiderOrders.css";

const API_BASE = "http://127.0.0.1:8000/api";

function RiderOrders() {
    const navigate = useNavigate();

    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [updatingOrderId, setUpdatingOrderId] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem("access_token");
        const role = localStorage.getItem("user_role");

        if (!token) {
            navigate("/login");
            return;
        }

        if (role !== "rider") {
            navigate("/orders");
            return;
        }

        const fetchOrders = async () => {
            try {
                setLoading(true);
                setError("");

                const response = await fetch(
                    `${API_BASE}/rider/orders/`,
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
                        "Unable to load assigned orders"
                    );
                }

                setOrders(Array.isArray(data) ? data : []);
            } catch (err) {
                setError(
                    err.message ||
                    "Unable to load assigned orders"
                );
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, [navigate]);

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

    const updateStatus = async (orderId, newStatus) => {
        const token = localStorage.getItem("access_token");

        if (!token) {
            navigate("/login");
            return;
        }

        try {
            setUpdatingOrderId(orderId);
            setError("");

            const response = await fetch(
                `${API_BASE}/orders/${orderId}/status/`,
                {
                    method: "PATCH",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        status: newStatus,
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data?.detail ||
                    data?.error ||
                    "Unable to update order status"
                );
            }

            setOrders((currentOrders) =>
                currentOrders.map((order) =>
                    order.id === orderId
                        ? {
                            ...order,
                            status: data.status || newStatus,
                        }
                        : order
                )
            );
        } catch (err) {
            setError(
                err.message ||
                "Unable to update order status"
            );
        } finally {
            setUpdatingOrderId(null);
        }
    };

    const getStatusAction = (order) => {
        if (order.status === "pending") {
            return {
                label: "✓ Confirm Order",
                status: "confirmed",
            };
        }

        if (order.status === "confirmed") {
            return {
                label: "🍳 Start Preparing",
                status: "preparing",
            };
        }

        if (order.status === "preparing") {
            return {
                label: "🛵 Out for Delivery",
                status: "out_for_delivery",
            };
        }

        if (order.status === "out_for_delivery") {
            return {
                label: "✓ Mark Delivered",
                status: "delivered",
            };
        }

        return null;
    };

    return (
        <div className="rider-orders-page">

            <header className="rider-orders-header">
                <div>
                    <button
                        className="rider-back-btn"
                        onClick={() => navigate("/")}
                    >
                        ← Home
                    </button>

                    <h1>My Assigned Orders</h1>

                    <p>
                        Manage your assigned food deliveries
                    </p>
                </div>

                <button
                    className="rider-refresh-btn"
                    onClick={() => window.location.reload()}
                >
                    ↻ Refresh
                </button>
            </header>

            <main className="rider-orders-container">

                {loading && (
                    <div className="rider-orders-message">
                        Loading assigned orders...
                    </div>
                )}

                {!loading && error && orders.length === 0 && (
                    <div className="rider-orders-message rider-error">
                        <h3>Unable to load orders</h3>

                        <p>{error}</p>

                        <button
                            onClick={() => window.location.reload()}
                        >
                            Try Again
                        </button>
                    </div>
                )}

                {!loading &&
                    !error &&
                    orders.length === 0 && (
                        <div className="rider-orders-message">
                            <div className="empty-icon">
                                🛵
                            </div>

                            <h2>No Assigned Orders</h2>

                            <p>
                                You don't have any delivery orders
                                assigned yet.
                            </p>
                        </div>
                    )}

                {!loading &&
                    orders.length > 0 && (
                        <div className="rider-orders-list">

                            <div className="rider-orders-count">
                                {orders.length}{" "}
                                {orders.length === 1
                                    ? "Assigned Order"
                                    : "Assigned Orders"}
                            </div>

                            {error && (
                                <div className="rider-inline-error">
                                    {error}
                                </div>
                            )}

                            {orders.map((order) => {
                                const statusAction =
                                    getStatusAction(order);

                                const isUpdating =
                                    updatingOrderId === order.id;

                                return (
                                    <div
                                        className="rider-order-card"
                                        key={order.id}
                                    >

                                        <div className="rider-order-top">

                                            <div>
                                                <span>
                                                    Order
                                                </span>

                                                <h2>
                                                    #{order.id}
                                                </h2>

                                                <p>
                                                    {order.created_at
                                                        ? new Date(
                                                            order.created_at
                                                        ).toLocaleString(
                                                            "en-IN"
                                                        )
                                                        : ""}
                                                </p>
                                            </div>

                                            <span
                                                className={`rider-status ${order.status}`}
                                            >
                                                {getStatusLabel(
                                                    order.status
                                                )}
                                            </span>

                                        </div>

                                        <div className="rider-order-info">

                                            <div>
                                                <span>
                                                    Restaurant
                                                </span>

                                                <strong>
                                                    {order.restaurant_name ||
                                                        order.restaurant?.name ||
                                                        "Restaurant"}
                                                </strong>
                                            </div>

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
                                                    Order Total
                                                </span>

                                                <strong>
                                                    ₹
                                                    {Number(
                                                        order.total_amount ||
                                                        0
                                                    ).toFixed(2)}
                                                </strong>
                                            </div>

                                        </div>

                                        <div className="rider-order-actions">

                                            {statusAction && (
                                                <button
                                                    className="status-update-btn"
                                                    disabled={isUpdating}
                                                    onClick={() =>
                                                        updateStatus(
                                                            order.id,
                                                            statusAction.status
                                                        )
                                                    }
                                                >
                                                    {isUpdating
                                                        ? "Updating..."
                                                        : statusAction.label}
                                                </button>
                                            )}

                                            {order.status !==
                                                "delivered" &&
                                                order.status !==
                                                "cancelled" && (
                                                    <button
                                                        className="start-tracking-btn"
                                                        onClick={() =>
                                                            navigate(
                                                                `/rider-tracking/${order.id}`
                                                            )
                                                        }
                                                    >
                                                        📍 Start Tracking
                                                    </button>
                                                )}

                                            <button
                                                className="view-order-btn"
                                                onClick={() =>
                                                    navigate(
                                                        `/orders/${order.id}`
                                                    )
                                                }
                                            >
                                                View Order
                                            </button>

                                        </div>

                                    </div>
                                );
                            })}

                        </div>
                    )}

            </main>
        </div>
    );
}

export default RiderOrders;