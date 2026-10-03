import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AdminDashboard.css";

const API_BASE = "http://127.0.0.1:8000/api";

function AdminDashboard() {
    const navigate = useNavigate();

    const [stats, setStats] = useState({
        totalOrders: 0,
        pendingOrders: 0,
        deliveryOrders: 0,
        totalRiders: 0,
    });

    const [orders, setOrders] = useState([]);
    const [riders, setRiders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    /* =====================================================
       DASHBOARD LOAD
    ===================================================== */

    const loadDashboard = async () => {
        const currentToken =
            localStorage.getItem("access_token");

        const currentRole =
            localStorage.getItem("user_role");

        // No login
        if (!currentToken) {
            navigate("/login", { replace: true });
            return;
        }

        // Only admin / manager
        if (
            currentRole !== "admin" &&
            currentRole !== "manager"
        ) {
            if (currentRole === "rider") {
                navigate("/rider/orders", { replace: true });
            } else {
                navigate("/home", { replace: true });
            }

            return;
        }

        try {
            setLoading(true);
            setError("");

            const headers = {
                Authorization: `Bearer ${currentToken}`,
                Accept: "application/json",
            };

            const [
                ordersResponse,
                ridersResponse,
            ] = await Promise.all([
                fetch(`${API_BASE}/orders/`, {
                    method: "GET",
                    headers,
                }),

                fetch(`${API_BASE}/tracking/riders/`, {
                    method: "GET",
                    headers,
                }),
            ]);

            let orderData = [];
            let riderData = [];

            /* =========================
               ORDERS
            ========================= */

            if (ordersResponse.ok) {
                const responseData =
                    await ordersResponse.json();

                if (Array.isArray(responseData)) {
                    orderData = responseData;
                } else {
                    orderData =
                        responseData.results || [];
                }
            } else if (
                ordersResponse.status === 401
            ) {
                localStorage.removeItem(
                    "access_token"
                );
                localStorage.removeItem(
                    "refresh_token"
                );
                localStorage.removeItem(
                    "user_role"
                );
                localStorage.removeItem(
                    "user_email"
                );

                navigate("/login", {
                    replace: true,
                });

                return;
            }

            /* =========================
               RIDERS
            ========================= */

            if (ridersResponse.ok) {
                const responseData =
                    await ridersResponse.json();

                if (Array.isArray(responseData)) {
                    riderData = responseData;
                } else {
                    riderData =
                        responseData.results || [];
                }
            } else if (
                ridersResponse.status === 401
            ) {
                localStorage.removeItem(
                    "access_token"
                );
                localStorage.removeItem(
                    "refresh_token"
                );
                localStorage.removeItem(
                    "user_role"
                );
                localStorage.removeItem(
                    "user_email"
                );

                navigate("/login", {
                    replace: true,
                });

                return;
            }

            setOrders(orderData);
            setRiders(riderData);

            setStats({
                totalOrders: orderData.length,

                pendingOrders: orderData.filter(
                    (order) =>
                        order.status === "pending"
                ).length,

                deliveryOrders: orderData.filter(
                    (order) =>
                        order.status ===
                        "out_for_delivery"
                ).length,

                totalRiders: riderData.length,
            });

        } catch (err) {
            console.error(
                "ADMIN DASHBOARD ERROR:",
                err
            );

            setError(
                "Dashboard data load nahi ho saka."
            );
        } finally {
            setLoading(false);
        }
    };


    /* =====================================================
       INITIAL LOAD
    ===================================================== */

    useEffect(() => {
        loadDashboard();
    }, []);


    /* =====================================================
       LOGOUT
    ===================================================== */

    const logout = () => {
        localStorage.removeItem(
            "access_token"
        );

        localStorage.removeItem(
            "refresh_token"
        );

        localStorage.removeItem(
            "user_email"
        );

        localStorage.removeItem(
            "user_role"
        );

        localStorage.removeItem(
            "user_data"
        );

        navigate("/login", {
            replace: true,
        });
    };


    /* =====================================================
       STATUS
    ===================================================== */

    const getStatusClass = (status) => {
        return `status ${status}`;
    };


    const formatStatus = (status) => {
        if (!status) return "-";

        return status
            .replaceAll("_", " ")
            .replace(/\b\w/g, (char) =>
                char.toUpperCase()
            );
    };


    /* =====================================================
       UI
    ===================================================== */

    return (
        <div className="admin-page">

            {/* =================================================
                SIDEBAR
            ================================================= */}

            <aside className="admin-sidebar">

                <div className="admin-brand">

                    <div className="admin-brand-icon">
                        🍔
                    </div>

                    <div>
                        <strong>
                            FoodExpress
                        </strong>

                        <span>
                            Admin Panel
                        </span>
                    </div>

                </div>


                <nav className="admin-nav">

                    {/* Dashboard */}

                    <button
                        className="admin-nav-item active"
                        onClick={() =>
                            navigate("/admin")
                        }
                    >
                        <span>📊</span>
                        Dashboard
                    </button>


                    {/* Orders */}

                    <button
                        className="admin-nav-item"
                        onClick={() =>
                            navigate(
                                "/admin/orders"
                            )
                        }
                    >
                        <span>🧾</span>
                        Orders
                    </button>


                    {/* Riders */}

                    <button
                        className="admin-nav-item"
                        onClick={() =>
                            navigate(
                                "/admin/riders"
                            )
                        }
                    >
                        <span>🛵</span>
                        Riders
                    </button>


                    {/* Future */}

                    <button
                        className="admin-nav-item"
                        type="button"
                    >
                        <span>🍽️</span>
                        Restaurants
                    </button>


                    <button
                        className="admin-nav-item"
                        type="button"
                    >
                        <span>🍕</span>
                        Food Items
                    </button>


                    <button
                        className="admin-nav-item"
                        type="button"
                    >
                        <span>👥</span>
                        Customers
                    </button>

                </nav>


                {/* SIDEBAR BOTTOM */}

                <div className="admin-sidebar-bottom">

                    <button
                        className="admin-home-btn"
                        onClick={() =>
                            navigate("/")
                        }
                    >
                        🏠 Back to Website
                    </button>


                    <button
                        className="admin-logout-btn"
                        onClick={logout}
                    >
                        🚪 Logout
                    </button>

                </div>

            </aside>


            {/* =================================================
                MAIN
            ================================================= */}

            <main className="admin-main">

                {/* HEADER */}

                <header className="admin-header">

                    <div>

                        <p className="admin-eyebrow">
                            ADMINISTRATION
                        </p>

                        <h1>
                            Dashboard
                        </h1>

                        <p className="admin-subtitle">
                            Manage your food delivery
                            platform
                        </p>

                    </div>


                    <div className="admin-header-actions">

                        <button
                            className="refresh-btn"
                            onClick={
                                loadDashboard
                            }
                        >
                            ↻ Refresh
                        </button>


                        <div className="admin-profile">

                            <div className="admin-avatar">
                                A
                            </div>

                            <div>
                                <strong>
                                    Administrator
                                </strong>

                                <span>
                                    Admin
                                </span>
                            </div>

                        </div>

                    </div>

                </header>


                {/* ERROR */}

                {error && (
                    <div className="admin-error">
                        {error}
                    </div>
                )}


                {/* =================================================
                    STATS
                ================================================= */}

                <section className="stats-grid">

                    <div className="stat-card">

                        <div className="stat-icon blue">
                            🧾
                        </div>

                        <div>
                            <span>
                                Total Orders
                            </span>

                            <strong>
                                {loading
                                    ? "..."
                                    : stats.totalOrders}
                            </strong>
                        </div>

                    </div>


                    <div className="stat-card">

                        <div className="stat-icon orange">
                            ⏳
                        </div>

                        <div>
                            <span>
                                Pending Orders
                            </span>

                            <strong>
                                {loading
                                    ? "..."
                                    : stats.pendingOrders}
                            </strong>
                        </div>

                    </div>


                    <div className="stat-card">

                        <div className="stat-icon green">
                            🛵
                        </div>

                        <div>
                            <span>
                                Out for Delivery
                            </span>

                            <strong>
                                {loading
                                    ? "..."
                                    : stats.deliveryOrders}
                            </strong>
                        </div>

                    </div>


                    <div className="stat-card">

                        <div className="stat-icon purple">
                            👥
                        </div>

                        <div>
                            <span>
                                Total Riders
                            </span>

                            <strong>
                                {loading
                                    ? "..."
                                    : stats.totalRiders}
                            </strong>
                        </div>

                    </div>

                </section>


                {/* =================================================
                    QUICK ACTIONS
                ================================================= */}

                <section className="quick-section">

                    <div className="section-heading">

                        <div>
                            <h2>
                                Quick Actions
                            </h2>

                            <p>
                                Frequently used
                                admin actions
                            </p>
                        </div>

                    </div>


                    <div className="quick-grid">

                        <button
                            className="quick-card"
                            onClick={() =>
                                navigate(
                                    "/admin/riders"
                                )
                            }
                        >
                            <span>🛵</span>

                            <div>
                                <strong>
                                    Manage Riders
                                </strong>

                                <small>
                                    Add and manage
                                    delivery riders
                                </small>
                            </div>

                            <b>→</b>

                        </button>


                        <button
                            className="quick-card"
                            onClick={() =>
                                navigate(
                                    "/admin/orders"
                                )
                            }
                        >
                            <span>📦</span>

                            <div>
                                <strong>
                                    Manage Orders
                                </strong>

                                <small>
                                    View and assign
                                    customer orders
                                </small>
                            </div>

                            <b>→</b>

                        </button>

                    </div>

                </section>


                {/* =================================================
                    RECENT ORDERS
                ================================================= */}

                <section className="dashboard-section">

                    <div className="section-heading">

                        <div>

                            <h2>
                                Recent Orders
                            </h2>

                            <p>
                                Latest orders from
                                customers
                            </p>

                        </div>


                        <button
                            onClick={() =>
                                navigate(
                                    "/admin/orders"
                                )
                            }
                            className="view-all-btn"
                        >
                            View All →
                        </button>

                    </div>


                    <div className="table-card">

                        {loading ? (

                            <div className="empty-state">
                                Loading orders...
                            </div>

                        ) : orders.length === 0 ? (

                            <div className="empty-state">
                                No orders found.
                            </div>

                        ) : (

                            <div className="table-wrapper">

                                <table>

                                    <thead>

                                        <tr>

                                            <th>
                                                Order
                                            </th>

                                            <th>
                                                Restaurant
                                            </th>

                                            <th>
                                                Amount
                                            </th>

                                            <th>
                                                Status
                                            </th>

                                            <th>
                                                Date
                                            </th>

                                        </tr>

                                    </thead>


                                    <tbody>

                                        {orders
                                            .slice(0, 8)
                                            .map(
                                                (order) => (
                                                    <tr
                                                        key={
                                                            order.id
                                                        }
                                                    >

                                                        <td>
                                                            <strong>
                                                                #
                                                                {
                                                                    order.id
                                                                }
                                                            </strong>
                                                        </td>


                                                        <td>
                                                            {order.restaurant_name ||
                                                                order.restaurant
                                                                    ?.name ||
                                                                `Restaurant #${order.restaurant}`}
                                                        </td>


                                                        <td>
                                                            ₹
                                                            {
                                                                order.total_amount
                                                            }
                                                        </td>


                                                        <td>

                                                            <span
                                                                className={getStatusClass(
                                                                    order.status
                                                                )}
                                                            >
                                                                {formatStatus(
                                                                    order.status
                                                                )}
                                                            </span>

                                                        </td>


                                                        <td>
                                                            {order.created_at
                                                                ? new Date(
                                                                    order.created_at
                                                                ).toLocaleDateString(
                                                                    "en-IN"
                                                                )
                                                                : "-"}
                                                        </td>

                                                    </tr>
                                                )
                                            )}

                                    </tbody>

                                </table>

                            </div>

                        )}

                    </div>

                </section>


                {/* =================================================
                    RIDERS
                ================================================= */}

                <section className="dashboard-section">

                    <div className="section-heading">

                        <div>

                            <h2>
                                Delivery Riders
                            </h2>

                            <p>
                                Current rider
                                availability
                            </p>

                        </div>


                        <button
                            onClick={() =>
                                navigate(
                                    "/admin/riders"
                                )
                            }
                            className="view-all-btn"
                        >
                            Manage Riders →
                        </button>

                    </div>


                    <div className="rider-grid">

                        {riders.length === 0 ? (

                            <div className="empty-state">
                                No riders found.
                            </div>

                        ) : (

                            riders
                                .slice(0, 6)
                                .map((rider) => (

                                    <div
                                        className="rider-card"
                                        key={rider.id}
                                    >

                                        <div className="rider-avatar">
                                            {(
                                                rider.username ||
                                                "R"
                                            )[0].toUpperCase()}
                                        </div>


                                        <div className="rider-info">

                                            <strong>
                                                {rider.username ||
                                                    "Unknown Rider"}
                                            </strong>

                                            <span>
                                                {rider.phone ||
                                                    "No phone"}
                                            </span>

                                        </div>


                                        <span
                                            className={
                                                rider.is_online
                                                    ? "online-badge"
                                                    : "offline-badge"
                                            }
                                        >
                                            {rider.is_online
                                                ? "Online"
                                                : "Offline"}
                                        </span>

                                    </div>

                                ))
                        )}

                    </div>

                </section>

            </main>

        </div>
    );
}

export default AdminDashboard;