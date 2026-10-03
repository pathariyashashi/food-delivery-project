import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Orders.css";

const API_BASE = "http://127.0.0.1:8000/api";

/* =========================================
   STATUS HELPERS
========================================= */

const STATUS_STEPS = [
    {
        key: "pending",
        label: "Order Placed",
        icon: "📝",
    },
    {
        key: "confirmed",
        label: "Confirmed",
        icon: "✓",
    },
    {
        key: "preparing",
        label: "Preparing Food",
        icon: "👨‍🍳",
    },
    {
        key: "out_for_delivery",
        label: "Out for Delivery",
        icon: "🛵",
    },
    {
        key: "delivered",
        label: "Delivered",
        icon: "🏠",
    },
];

function getStatusLabel(status) {
    switch (status) {
        case "pending":
            return "Order Placed";

        case "confirmed":
            return "Confirmed";

        case "preparing":
            return "Preparing Food";

        case "out_for_delivery":
            return "Out for Delivery";

        case "delivered":
            return "Delivered";

        case "cancelled":
            return "Cancelled";

        default:
            return status || "Pending";
    }
}

function getStatusClass(status) {
    switch (status) {
        case "confirmed":
            return "confirmed";

        case "preparing":
            return "preparing";

        case "out_for_delivery":
            return "out-for-delivery";

        case "delivered":
            return "delivered";

        case "cancelled":
            return "cancelled";

        default:
            return "pending";
    }
}

function getStatusIndex(status) {
    const index = STATUS_STEPS.findIndex(
        (step) => step.key === status
    );

    return index === -1 ? 0 : index;
}

/* =========================================
   RIDER INFORMATION
========================================= */

function getRiderInfo(order) {
    const rider =
        order.delivery_rider ||
        order.rider ||
        order.deliveryRider ||
        null;

    if (!rider) {
        return null;
    }

    return {
        name:
            rider.username ||
            rider.name ||
            rider.user?.username ||
            "Delivery Rider",

        phone:
            rider.phone ||
            rider.user?.phone ||
            "",

        isOnline:
            rider.is_online ??
            rider.isOnline ??
            false,

        latitude:
            rider.latitude ??
            null,

        longitude:
            rider.longitude ??
            null,
    };
}

/* =========================================
   ORDER CARD
========================================= */

function Orders() {
    const navigate = useNavigate();

    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [userRole, setUserRole] =
        useState("customer");

    /* =========================================
       LOAD ORDERS
    ========================================= */

    const loadOrders = async (showLoader = false) => {
        const token =
            localStorage.getItem("access_token");

        const role =
            localStorage.getItem("user_role") ||
            "customer";

        setUserRole(role);

        if (!token) {
            navigate("/login");
            return;
        }

        if (showLoader) {
            setLoading(true);
        }

        try {
            const response = await fetch(
                `${API_BASE}/orders/`,
                {
                    headers: {
                        Authorization:
                            `Bearer ${token}`,
                    },
                }
            );

            const data =
                await response.json();

            if (!response.ok) {
                throw new Error(
                    data?.detail ||
                    data?.error ||
                    "Unable to load orders"
                );
            }

            const list =
                Array.isArray(data)
                    ? data
                    : data?.results ||
                      data?.orders ||
                      [];

            setOrders(list);
            setError("");
        } catch (err) {
            console.error(
                "Orders error:",
                err
            );

            setError(
                err.message ||
                "Unable to load orders"
            );
        } finally {
            setLoading(false);
        }
    };

    /* =========================================
       INITIAL LOAD + AUTO REFRESH
    ========================================= */

    useEffect(() => {
        loadOrders(true);

        const interval =
            setInterval(() => {
                loadOrders(false);
            }, 5000);

        return () => {
            clearInterval(interval);
        };

        // eslint-disable-next-line
    }, [navigate]);

    /* =========================================
       ROLE
    ========================================= */

    const canAssignRider =
        userRole === "admin" ||
        userRole === "manager";

    /* =========================================
       MANUAL REFRESH
    ========================================= */

    const refreshOrders = () => {
        loadOrders(true);
    };

    /* =========================================
       OPEN TRACKING
    ========================================= */

    const openTracking = (orderId) => {
        navigate(`/tracking/${orderId}`);
    };

    /* =========================================
       UI
    ========================================= */

    return (
        <div className="orders-page">

            {/* =====================================
                HEADER
            ===================================== */}

            <header className="orders-header">

                <div>

                    <button
                        className="back-btn"
                        onClick={() =>
                            navigate("/")
                        }
                    >
                        ← Back to Home
                    </button>

                    <h1>
                        My Orders
                    </h1>

                    <p>
                        Track and manage your
                        food orders
                    </p>

                </div>

                <div
                    style={{
                        display: "flex",
                        gap: "10px",
                        flexWrap: "wrap",
                    }}
                >

                    <button
                        className="shop-btn"
                        onClick={() =>
                            navigate("/")
                        }
                    >
                        🍔 Order Food
                    </button>

                    <button
                        className="shop-btn"
                        onClick={
                            refreshOrders
                        }
                    >
                        ↻ Refresh
                    </button>

                </div>

            </header>

            {/* =====================================
                MAIN
            ===================================== */}

            <main className="orders-container">

                {/* LOADING */}

                {loading && (
                    <div
                        className="orders-message"
                    >
                        <div
                            style={{
                                fontSize: "42px",
                            }}
                        >
                            🍔
                        </div>

                        <h2>
                            Loading your orders...
                        </h2>
                    </div>
                )}

                {/* ERROR */}

                {!loading && error && (
                    <div
                        className="orders-message error"
                    >
                        <div
                            style={{
                                fontSize: "42px",
                            }}
                        >
                            ⚠️
                        </div>

                        <h3>
                            Unable to load orders
                        </h3>

                        <p>
                            {error}
                        </p>

                        <button
                            onClick={
                                refreshOrders
                            }
                        >
                            Try Again
                        </button>
                    </div>
                )}

                {/* EMPTY */}

                {!loading &&
                    !error &&
                    orders.length === 0 && (

                    <div
                        className="orders-message"
                    >

                        <div
                            style={{
                                fontSize: "55px",
                            }}
                        >
                            🛍️
                        </div>

                        <h2>
                            No orders yet
                        </h2>

                        <p>
                            You haven't placed
                            any orders yet.
                        </p>

                        <button
                            onClick={() =>
                                navigate("/")
                            }
                        >
                            Browse Food
                        </button>

                    </div>
                )}

                {/* =====================================
                    ORDERS
                ===================================== */}

                {!loading &&
                    !error &&
                    orders.length > 0 && (

                    <div className="orders-list">

                        {/* COUNT */}

                        <div
                            style={{
                                display: "flex",
                                justifyContent:
                                    "space-between",
                                alignItems: "center",
                                marginBottom:
                                    "18px",
                                flexWrap:
                                    "wrap",
                                gap: "10px",
                            }}
                        >

                            <p
                                className="orders-count"
                            >
                                {orders.length}{" "}
                                {orders.length === 1
                                    ? "Order"
                                    : "Orders"}
                            </p>

                            <span
                                style={{
                                    fontSize:
                                        "13px",
                                    color:
                                        "#64748b",
                                }}
                            >
                                🔄 Live status
                                updates
                            </span>

                        </div>

                        {/* =====================================
                            ORDER CARD
                        ===================================== */}

                        {orders.map((order) => {

                            const status =
                                order.status ||
                                "pending";

                            const statusIndex =
                                getStatusIndex(
                                    status
                                );

                            const isActive =
                                status !==
                                    "cancelled" &&
                                status !==
                                    "delivered";

                            const rider =
                                getRiderInfo(
                                    order
                                );

                            return (

                                <div
                                    className="order-card"
                                    key={order.id}
                                >

                                    {/* =========================
                                        ORDER HEADER
                                    ========================= */}

                                    <div
                                        className="order-top"
                                    >

                                        <div>

                                            <span>
                                                Order
                                            </span>

                                            <h2>
                                                #
                                                {
                                                    order.id
                                                }
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

                                        <strong
                                            className={`order-status ${getStatusClass(
                                                status
                                            )}`}
                                        >
                                            {getStatusLabel(
                                                status
                                            )}
                                        </strong>

                                    </div>

                                    {/* =========================
                                        ORDER INFO
                                    ========================= */}

                                    <div
                                        className="order-info"
                                    >

                                        <div>

                                            <span>
                                                Delivery
                                                Address
                                            </span>

                                            <strong>
                                                {order.delivery_address ||
                                                    order.address ||
                                                    "Not available"}
                                            </strong>

                                        </div>

                                        <div>

                                            <span>
                                                Total Amount
                                            </span>

                                            <strong>
                                                ₹
                                                {Number(
                                                    order.total_amount ||
                                                    order.total ||
                                                    0
                                                ).toFixed(
                                                    2
                                                )}
                                            </strong>

                                        </div>

                                    </div>

                                    {/* =================================
                                        TRACKING SECTION
                                    ================================= */}

                                    {isActive && (

                                        <div
                                            style={{
                                                marginTop:
                                                    "20px",
                                                padding:
                                                    "18px",
                                                borderRadius:
                                                    "16px",
                                                background:
                                                    "#f8fafc",
                                                border:
                                                    "1px solid #e2e8f0",
                                            }}
                                        >

                                            {/* TRACKING HEADER */}

                                            <div
                                                style={{
                                                    display:
                                                        "flex",
                                                    justifyContent:
                                                        "space-between",
                                                    alignItems:
                                                        "center",
                                                    gap:
                                                        "10px",
                                                    flexWrap:
                                                        "wrap",
                                                    marginBottom:
                                                        "16px",
                                                }}
                                            >

                                                <div>

                                                    <h3
                                                        style={{
                                                            margin:
                                                                0,
                                                            fontSize:
                                                                "17px",
                                                        }}
                                                    >
                                                        🚚
                                                        Delivery
                                                        Tracking
                                                    </h3>

                                                    <p
                                                        style={{
                                                            margin:
                                                                "5px 0 0",
                                                            fontSize:
                                                                "12px",
                                                            color:
                                                                "#64748b",
                                                        }}
                                                    >
                                                        {status ===
                                                        "out_for_delivery"
                                                            ? "Your rider is on the way."
                                                            : "Follow your order progress."}
                                                    </p>

                                                </div>

                                                <button
                                                    className="track-order-btn"
                                                    onClick={() =>
                                                        openTracking(
                                                            order.id
                                                        )
                                                    }
                                                >
                                                    🛵 Track
                                                    Live Order
                                                </button>

                                            </div>

                                            {/* =================================
                                                STATUS TIMELINE
                                            ================================= */}

                                            <div
                                                style={{
                                                    display:
                                                        "flex",
                                                    justifyContent:
                                                        "space-between",
                                                    gap:
                                                        "5px",
                                                    overflowX:
                                                        "auto",
                                                    paddingBottom:
                                                        "5px",
                                                }}
                                            >

                                                {STATUS_STEPS.map(
                                                    (
                                                        step,
                                                        index
                                                    ) => {

                                                        const completed =
                                                            index <=
                                                            statusIndex;

                                                        const active =
                                                            index ===
                                                            statusIndex;

                                                        return (

                                                            <div
                                                                key={
                                                                    step.key
                                                                }
                                                                style={{
                                                                    flex:
                                                                        "1",
                                                                    minWidth:
                                                                        "90px",
                                                                    textAlign:
                                                                        "center",
                                                                    position:
                                                                        "relative",
                                                                }}
                                                            >

                                                                <div
                                                                    style={{
                                                                        width:
                                                                            "38px",
                                                                        height:
                                                                            "38px",
                                                                        borderRadius:
                                                                            "50%",
                                                                        margin:
                                                                            "0 auto 7px",
                                                                        display:
                                                                            "flex",
                                                                        alignItems:
                                                                            "center",
                                                                        justifyContent:
                                                                            "center",
                                                                        background:
                                                                            completed
                                                                                ? "#16a34a"
                                                                                : "#e2e8f0",
                                                                        color:
                                                                            completed
                                                                                ? "#fff"
                                                                                : "#64748b",
                                                                        fontSize:
                                                                            "16px",
                                                                        fontWeight:
                                                                            700,
                                                                    }}
                                                                >
                                                                    {
                                                                        step.icon
                                                                    }
                                                                </div>

                                                                <div
                                                                    style={{
                                                                        fontSize:
                                                                            "11px",
                                                                        fontWeight:
                                                                            active
                                                                                ? 700
                                                                                : 500,
                                                                        color:
                                                                            completed
                                                                                ? "#166534"
                                                                                : "#64748b",
                                                                        lineHeight:
                                                                            1.3,
                                                                    }}
                                                                >
                                                                    {
                                                                        step.label
                                                                    }
                                                                </div>

                                                            </div>
                                                        );
                                                    }
                                                )}

                                            </div>

                                            {/* =================================
                                                RIDER INFO
                                            ================================= */}

                                            {status ===
                                                "out_for_delivery" && (

                                                <div
                                                    style={{
                                                        marginTop:
                                                            "18px",
                                                        padding:
                                                            "14px",
                                                        borderRadius:
                                                            "12px",
                                                        background:
                                                            "#ffffff",
                                                        border:
                                                            "1px solid #e2e8f0",
                                                    }}
                                                >

                                                    <div
                                                        style={{
                                                            display:
                                                                "flex",
                                                            justifyContent:
                                                                "space-between",
                                                            alignItems:
                                                                "center",
                                                            gap:
                                                                "12px",
                                                            flexWrap:
                                                                "wrap",
                                                        }}
                                                    >

                                                        <div>

                                                            <strong>
                                                                🛵
                                                                Delivery
                                                                Partner
                                                            </strong>

                                                            {rider ? (

                                                                <div
                                                                    style={{
                                                                        marginTop:
                                                                            "5px",
                                                                        fontSize:
                                                                            "13px",
                                                                        color:
                                                                            "#475569",
                                                                    }}
                                                                >

                                                                    <div>
                                                                        Rider:{" "}
                                                                        <strong>
                                                                            {
                                                                                rider.name
                                                                            }
                                                                        </strong>
                                                                    </div>

                                                                    {rider.phone && (
                                                                        <div>
                                                                            Phone:{" "}
                                                                            {
                                                                                rider.phone
                                                                            }
                                                                        </div>
                                                                    )}

                                                                </div>

                                                            ) : (

                                                                <p
                                                                    style={{
                                                                        margin:
                                                                            "5px 0 0",
                                                                        fontSize:
                                                                            "12px",
                                                                        color:
                                                                            "#64748b",
                                                                    }}
                                                                >
                                                                    Rider
                                                                    details
                                                                    will
                                                                    appear
                                                                    here
                                                                    once
                                                                    assigned.
                                                                </p>

                                                            )}

                                                        </div>

                                                        <div
                                                            style={{
                                                                fontSize:
                                                                    "12px",
                                                                fontWeight:
                                                                    600,
                                                                color:
                                                                    rider?.isOnline
                                                                        ? "#16a34a"
                                                                        : "#64748b",
                                                            }}
                                                        >
                                                            {rider?.isOnline
                                                                ? "● Rider Online"
                                                                : "● Tracking Ready"}
                                                        </div>

                                                    </div>

                                                </div>

                                            )}

                                        </div>
                                    )}

                                    {/* =================================
                                        COMPLETED
                                    ================================= */}

                                    {status ===
                                        "delivered" && (

                                        <div
                                            style={{
                                                marginTop:
                                                    "18px",
                                                padding:
                                                    "14px",
                                                borderRadius:
                                                    "12px",
                                                background:
                                                    "#f0fdf4",
                                                border:
                                                    "1px solid #bbf7d0",
                                                color:
                                                    "#166534",
                                                fontSize:
                                                    "13px",
                                                fontWeight:
                                                    600,
                                            }}
                                        >
                                            🏠 Order
                                            delivered
                                            successfully.
                                        </div>
                                    )}

                                    {/* =================================
                                        CANCELLED
                                    ================================= */}

                                    {status ===
                                        "cancelled" && (

                                        <div
                                            style={{
                                                marginTop:
                                                    "18px",
                                                padding:
                                                    "14px",
                                                borderRadius:
                                                    "12px",
                                                background:
                                                    "#fef2f2",
                                                border:
                                                    "1px solid #fecaca",
                                                color:
                                                    "#dc2626",
                                                fontSize:
                                                    "13px",
                                                fontWeight:
                                                    600,
                                            }}
                                        >
                                            ❌ This order
                                            has been
                                            cancelled.
                                        </div>
                                    )}

                                    {/* =================================
                                        ACTION BUTTONS
                                    ================================= */}

                                    <div
                                        className="order-actions"
                                        style={{
                                            display:
                                                "flex",
                                            gap:
                                                "10px",
                                            flexWrap:
                                                "wrap",
                                            marginTop:
                                                "18px",
                                        }}
                                    >

                                        {/* VIEW DETAILS */}

                                        <button
                                            className="details-btn"
                                            onClick={() =>
                                                navigate(
                                                    `/orders/${order.id}`
                                                )
                                            }
                                        >
                                            📋 View Details
                                        </button>

                                        {/* LIVE TRACKING */}

                                        {isActive && (

                                            <button
                                                className="track-order-btn"
                                                onClick={() =>
                                                    openTracking(
                                                        order.id
                                                    )
                                                }
                                            >
                                                🛵 Track Live
                                                Order
                                            </button>

                                        )}

                                        {/* ADMIN / MANAGER */}

                                        {canAssignRider &&
                                            isActive && (

                                            <button
                                                className="assign-order-btn"
                                                onClick={() =>
                                                    navigate(
                                                        `/orders/${order.id}/assign-rider`
                                                    )
                                                }
                                            >
                                                👤 Assign Rider
                                            </button>

                                        )}

                                    </div>

                                    {/* =================================
                                        STATUS MESSAGE
                                    ================================= */}

                                    {status ===
                                        "pending" && (

                                        <div
                                            style={{
                                                marginTop:
                                                    "12px",
                                                fontSize:
                                                    "12px",
                                                color:
                                                    "#64748b",
                                            }}
                                        >
                                            ⏳ Order
                                            placed.
                                            Waiting for
                                            confirmation.
                                        </div>
                                    )}

                                    {status ===
                                        "confirmed" && (

                                        <div
                                            style={{
                                                marginTop:
                                                    "12px",
                                                fontSize:
                                                    "12px",
                                                color:
                                                    "#64748b",
                                            }}
                                        >
                                            ✅ Restaurant
                                            confirmed
                                            your order.
                                        </div>
                                    )}

                                    {status ===
                                        "preparing" && (

                                        <div
                                            style={{
                                                marginTop:
                                                    "12px",
                                                fontSize:
                                                    "12px",
                                                color:
                                                    "#64748b",
                                            }}
                                        >
                                            👨‍🍳 Your food
                                            is being
                                            prepared.
                                        </div>
                                    )}

                                    {status ===
                                        "out_for_delivery" && (

                                        <div
                                            style={{
                                                marginTop:
                                                    "12px",
                                                fontSize:
                                                    "12px",
                                                color:
                                                    "#059669",
                                                fontWeight:
                                                    600,
                                            }}
                                        >
                                            🛵 Rider is on
                                            the way.
                                            Click
                                            <strong>
                                                {" "}
                                                Track Live
                                                Order
                                            </strong>{" "}
                                            to open the
                                            live map.
                                        </div>
                                    )}

                                </div>
                            );
                        })}

                    </div>
                )}

            </main>

        </div>
    );
}

export default Orders;