import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AdminOrders.css";

const API_BASE = "http://127.0.0.1:8000/api";

function AdminOrders() {
    const navigate = useNavigate();

    const [orders, setOrders] = useState([]);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const token = localStorage.getItem("access_token");
    const role = localStorage.getItem("user_role");

    useEffect(() => {
        if (!token) {
            navigate("/login");
            return;
        }

        if (role !== "admin" && role !== "manager") {
            navigate("/");
            return;
        }

        loadOrders();
    }, []);

    const loadOrders = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await fetch(`${API_BASE}/orders/`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.detail ||
                    data.error ||
                    "Orders load nahi ho sake."
                );
            }

            setOrders(
                Array.isArray(data)
                    ? data
                    : data.results || []
            );
        } catch (err) {
            console.error("ADMIN ORDERS ERROR:", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const getStatusLabel = (status) => {
        const labels = {
            pending: "Pending",
            confirmed: "Confirmed",
            preparing: "Preparing",
            out_for_delivery: "Out for Delivery",
            delivered: "Delivered",
            cancelled: "Cancelled",
        };

        return labels[status] || status || "Unknown";
    };

    const filteredOrders = useMemo(() => {
        return orders.filter((order) => {
            const restaurantName =
                order.restaurant_name ||
                order.restaurant?.name ||
                "";

            const customerName =
                order.username ||
                order.user_name ||
                order.user?.username ||
                "";

            const searchText = search.toLowerCase();

            const matchesSearch =
                String(order.id)
                    .toLowerCase()
                    .includes(searchText) ||
                restaurantName
                    .toLowerCase()
                    .includes(searchText) ||
                customerName
                    .toLowerCase()
                    .includes(searchText);

            const matchesStatus =
                statusFilter === "all" ||
                order.status === statusFilter;

            return matchesSearch && matchesStatus;
        });
    }, [orders, search, statusFilter]);

    const countStatus = (status) =>
        orders.filter((order) => order.status === status).length;

    const formatDate = (date) => {
        if (!date) return "-";

        return new Date(date).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
    };

    return (
        <div className="admin-orders-page">

            {/* SIDEBAR */}
            <aside className="admin-orders-sidebar">

                <div className="admin-orders-brand">
                    <div className="admin-orders-brand-icon">
                        🍔
                    </div>

                    <div>
                        <strong>FoodExpress</strong>
                        <span>Admin Panel</span>
                    </div>
                </div>

                <nav className="admin-orders-nav">

                    <button onClick={() => navigate("/admin")}>
                        📊
                        <span>Dashboard</span>
                    </button>

                    <button
                        className="active"
                        onClick={() => navigate("/admin/orders")}
                    >
                        🧾
                        <span>Orders</span>
                    </button>

                    <button
                        onClick={() => navigate("/admin/riders")}
                    >
                        🛵
                        <span>Riders</span>
                    </button>

                    <button>
                        🍽️
                        <span>Restaurants</span>
                    </button>

                    <button>
                        🍕
                        <span>Food Items</span>
                    </button>

                    <button>
                        👥
                        <span>Customers</span>
                    </button>

                </nav>

                <div className="admin-orders-sidebar-bottom">

                    <button onClick={() => navigate("/")}>
                        🏠
                        <span>Back to Website</span>
                    </button>

                    <button
                        onClick={() => {
                            localStorage.clear();
                            navigate("/login");
                        }}
                    >
                        🚪
                        <span>Logout</span>
                    </button>

                </div>

            </aside>

            {/* MAIN */}
            <main className="admin-orders-main">

                <header className="admin-orders-header">

                    <div>
                        <div className="admin-orders-breadcrumb">
                            Admin / Orders
                        </div>

                        <h1>Orders Management</h1>

                        <p>
                            Monitor customer orders and manage delivery.
                        </p>
                    </div>

                    <button
                        className="admin-orders-refresh"
                        onClick={loadOrders}
                    >
                        ↻ Refresh
                    </button>

                </header>

                {error && (
                    <div className="admin-orders-error">
                        ⚠️ {error}
                    </div>
                )}

                {/* STATS */}
                <section className="admin-orders-stats">

                    <div className="admin-order-stat">
                        <div className="admin-order-stat-icon blue">
                            🧾
                        </div>
                        <div>
                            <span>Total Orders</span>
                            <strong>{orders.length}</strong>
                        </div>
                    </div>

                    <div className="admin-order-stat">
                        <div className="admin-order-stat-icon orange">
                            ⏳
                        </div>
                        <div>
                            <span>Pending</span>
                            <strong>
                                {countStatus("pending")}
                            </strong>
                        </div>
                    </div>

                    <div className="admin-order-stat">
                        <div className="admin-order-stat-icon purple">
                            🔥
                        </div>
                        <div>
                            <span>Preparing</span>
                            <strong>
                                {countStatus("preparing")}
                            </strong>
                        </div>
                    </div>

                    <div className="admin-order-stat">
                        <div className="admin-order-stat-icon green">
                            🛵
                        </div>
                        <div>
                            <span>Out for Delivery</span>
                            <strong>
                                {countStatus("out_for_delivery")}
                            </strong>
                        </div>
                    </div>

                    <div className="admin-order-stat">
                        <div className="admin-order-stat-icon delivered">
                            ✓
                        </div>
                        <div>
                            <span>Delivered</span>
                            <strong>
                                {countStatus("delivered")}
                            </strong>
                        </div>
                    </div>

                </section>

                {/* FILTERS */}
                <section className="admin-orders-toolbar">

                    <div className="admin-orders-search">
                        <span>⌕</span>

                        <input
                            type="text"
                            placeholder="Search order, customer or restaurant..."
                            value={search}
                            onChange={(e) =>
                                setSearch(e.target.value)
                            }
                        />
                    </div>

                    <div className="admin-orders-filters">

                        {[
                            ["all", "All"],
                            ["pending", "Pending"],
                            ["confirmed", "Confirmed"],
                            ["preparing", "Preparing"],
                            ["out_for_delivery", "Out for Delivery"],
                            ["delivered", "Delivered"],
                            ["cancelled", "Cancelled"],
                        ].map(([value, label]) => (
                            <button
                                key={value}
                                className={
                                    statusFilter === value
                                        ? "active"
                                        : ""
                                }
                                onClick={() =>
                                    setStatusFilter(value)
                                }
                            >
                                {label}
                            </button>
                        ))}

                    </div>

                </section>

                {/* TABLE */}
                <section className="admin-orders-table-card">

                    <div className="admin-orders-table-header">

                        <div>
                            <h2>All Orders</h2>

                            <span>
                                {loading
                                    ? "Loading..."
                                    : `${filteredOrders.length} orders found`}
                            </span>
                        </div>

                        <span className="live-indicator">
                            <i></i>
                            Live Data
                        </span>

                    </div>

                    {loading ? (

                        <div className="admin-orders-empty">
                            <div>⏳</div>
                            <strong>Loading orders...</strong>
                            <span>
                                Fetching orders from server.
                            </span>
                        </div>

                    ) : filteredOrders.length === 0 ? (

                        <div className="admin-orders-empty">
                            <div>📦</div>
                            <strong>No orders found</strong>
                            <span>
                                Try changing your search or filter.
                            </span>
                        </div>

                    ) : (

                        <div className="admin-orders-table-wrapper">

                            <table className="admin-orders-table">

                                <thead>
                                    <tr>
                                        <th>ORDER</th>
                                        <th>CUSTOMER</th>
                                        <th>RESTAURANT</th>
                                        <th>AMOUNT</th>
                                        <th>STATUS</th>
                                        <th>RIDER</th>
                                        <th>DATE</th>
                                        <th>ACTION</th>
                                    </tr>
                                </thead>

                                <tbody>

                                    {filteredOrders.map((order) => {

                                        const restaurant =
                                            order.restaurant_name ||
                                            order.restaurant?.name ||
                                            `Restaurant #${order.restaurant}`;

                                        const customer =
                                            order.username ||
                                            order.user_name ||
                                            order.user?.username ||
                                            `Customer #${order.user}`;

                                        const rider =
                                            order.rider_name ||
                                            order.delivery_rider?.username ||
                                            order.delivery_rider_name;

                                        return (
                                            <tr key={order.id}>

                                                <td>
                                                    <strong className="admin-order-id">
                                                        #{order.id}
                                                    </strong>
                                                </td>

                                                <td>
                                                    <div className="admin-customer">
                                                        <div>
                                                            {customer
                                                                .charAt(0)
                                                                .toUpperCase()}
                                                        </div>
                                                        <span>
                                                            {customer}
                                                        </span>
                                                    </div>
                                                </td>

                                                <td>
                                                    <span className="restaurant-name">
                                                        {restaurant}
                                                    </span>
                                                </td>

                                                <td>
                                                    <strong>
                                                        ₹
                                                        {Number(
                                                            order.total_amount || 0
                                                        ).toFixed(2)}
                                                    </strong>
                                                </td>

                                                <td>
                                                    <span
                                                        className={`admin-status ${order.status}`}
                                                    >
                                                        {getStatusLabel(
                                                            order.status
                                                        )}
                                                    </span>
                                                </td>

                                                <td>
                                                    {rider ? (
                                                        <span className="assigned-rider">
                                                            🛵 {rider}
                                                        </span>
                                                    ) : (
                                                        <span className="no-rider">
                                                            Unassigned
                                                        </span>
                                                    )}
                                                </td>

                                                <td>
                                                    {formatDate(
                                                        order.created_at
                                                    )}
                                                </td>

                                                <td>
                                                    <button
                                                        className="order-view-btn"
                                                        onClick={() =>
                                                            navigate(
                                                                `/orders/${order.id}`
                                                            )
                                                        }
                                                    >
                                                        View
                                                    </button>
                                                </td>

                                            </tr>
                                        );
                                    })}

                                </tbody>

                            </table>

                        </div>
                    )}

                </section>

            </main>
        </div>
    );
}

export default AdminOrders;