import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Riders.css";

const API_BASE = "http://127.0.0.1:8000/api";

function Riders() {
    const navigate = useNavigate();

    const [riders, setRiders] = useState([]);
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState("all");
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

        loadRiders();
    }, []);

    const loadRiders = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await fetch(
                `${API_BASE}/tracking/riders/`,
                {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.error ||
                    data.detail ||
                    "Riders load nahi ho sake."
                );
            }

            setRiders(Array.isArray(data) ? data : data.results || []);
        } catch (err) {
            console.error("RIDER API ERROR:", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const filteredRiders = riders.filter((rider) => {
        const searchText = search.toLowerCase();

        const matchesSearch =
            (rider.username || "")
                .toLowerCase()
                .includes(searchText) ||
            (rider.email || "")
                .toLowerCase()
                .includes(searchText) ||
            (rider.phone || "")
                .toString()
                .includes(searchText);

        const matchesFilter =
            filter === "all" ||
            (filter === "online" && rider.is_online) ||
            (filter === "offline" && !rider.is_online) ||
            (filter === "available" && rider.is_available);

        return matchesSearch && matchesFilter;
    });

    const totalRiders = riders.length;

    const onlineRiders = riders.filter(
        (rider) => rider.is_online
    ).length;

    const availableRiders = riders.filter(
        (rider) => rider.is_available
    ).length;

    const offlineRiders = riders.filter(
        (rider) => !rider.is_online
    ).length;

    return (
        <div className="riders-page">

            {/* SIDEBAR */}
            <aside className="riders-sidebar">

                <div className="riders-brand">
                    <div className="riders-brand-icon">
                        🍔
                    </div>

                    <div>
                        <strong>FoodExpress</strong>
                        <span>Admin Panel</span>
                    </div>
                </div>

                <nav className="riders-nav">

                    <button
                        onClick={() => navigate("/admin")}
                    >
                        📊
                        <span>Dashboard</span>
                    </button>

                    <button
                        onClick={() => navigate("/orders")}
                    >
                        🧾
                        <span>Orders</span>
                    </button>

                    <button className="active">
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

                <div className="riders-sidebar-bottom">

                    <button onClick={() => navigate("/")}>
                        🏠
                        <span>Back to Website</span>
                    </button>

                    <button
                        onClick={() => {
                            localStorage.removeItem("access_token");
                            localStorage.removeItem("refresh_token");
                            localStorage.removeItem("user_email");
                            localStorage.removeItem("user_role");

                            navigate("/login");
                        }}
                    >
                        🚪
                        <span>Logout</span>
                    </button>

                </div>

            </aside>

            {/* MAIN */}
            <main className="riders-main">

                {/* HEADER */}
                <header className="riders-header">

                    <div>
                        <div className="page-breadcrumb">
                            Admin / Riders
                        </div>

                        <h1>Delivery Riders</h1>

                        <p>
                            Manage your delivery team and monitor rider
                            availability.
                        </p>
                    </div>

                    <button
                        className="create-rider-btn"
                        onClick={() =>
                            navigate("/admin/riders/create")
                        }
                    >
                        <span>＋</span>
                        Add New Rider
                    </button>

                </header>

                {/* ERROR */}
                {error && (
                    <div
                        style={{
                            background: "#fef2f2",
                            color: "#b91c1c",
                            border: "1px solid #fecaca",
                            padding: "12px 15px",
                            borderRadius: "10px",
                            marginBottom: "18px",
                            fontSize: "13px",
                            fontWeight: "600",
                        }}
                    >
                        {error}
                    </div>
                )}

                {/* STATS */}
                <section className="rider-stats">

                    <div className="rider-stat-card">
                        <div className="rider-stat-icon total">
                            🛵
                        </div>

                        <div>
                            <span>Total Riders</span>
                            <strong>
                                {loading ? "..." : totalRiders}
                            </strong>
                        </div>
                    </div>

                    <div className="rider-stat-card">
                        <div className="rider-stat-icon online">
                            ●
                        </div>

                        <div>
                            <span>Online Now</span>
                            <strong>
                                {loading ? "..." : onlineRiders}
                            </strong>
                        </div>
                    </div>

                    <div className="rider-stat-card">
                        <div className="rider-stat-icon available">
                            ✓
                        </div>

                        <div>
                            <span>Available</span>
                            <strong>
                                {loading ? "..." : availableRiders}
                            </strong>
                        </div>
                    </div>

                    <div className="rider-stat-card">
                        <div className="rider-stat-icon orders">
                            ⏸
                        </div>

                        <div>
                            <span>Offline</span>
                            <strong>
                                {loading ? "..." : offlineRiders}
                            </strong>
                        </div>
                    </div>

                </section>

                {/* TOOLBAR */}
                <section className="riders-toolbar">

                    <div className="search-box">

                        <span>⌕</span>

                        <input
                            type="text"
                            placeholder="Search rider by name, email or phone..."
                            value={search}
                            onChange={(e) =>
                                setSearch(e.target.value)
                            }
                        />

                    </div>

                    <div className="filter-buttons">

                        <button
                            className={
                                filter === "all"
                                    ? "selected"
                                    : ""
                            }
                            onClick={() => setFilter("all")}
                        >
                            All
                        </button>

                        <button
                            className={
                                filter === "online"
                                    ? "selected"
                                    : ""
                            }
                            onClick={() => setFilter("online")}
                        >
                            Online
                        </button>

                        <button
                            className={
                                filter === "offline"
                                    ? "selected"
                                    : ""
                            }
                            onClick={() => setFilter("offline")}
                        >
                            Offline
                        </button>

                        <button
                            className={
                                filter === "available"
                                    ? "selected"
                                    : ""
                            }
                            onClick={() => setFilter("available")}
                        >
                            Available
                        </button>

                    </div>

                </section>

                {/* TABLE */}
                <section className="riders-table-card">

                    <div className="table-top">

                        <div>
                            <h2>All Riders</h2>

                            <span>
                                {loading
                                    ? "Loading riders..."
                                    : `${filteredRiders.length} riders found`}
                            </span>
                        </div>

                        <button
                            className="refresh-riders"
                            onClick={loadRiders}
                            disabled={loading}
                        >
                            ↻ {loading ? "Loading..." : "Refresh"}
                        </button>

                    </div>

                    <div className="riders-table-wrapper">

                        {loading ? (
                            <div className="no-riders">
                                <div>⏳</div>
                                <strong>Loading riders...</strong>
                                <span>
                                    Fetching live rider data.
                                </span>
                            </div>
                        ) : filteredRiders.length === 0 ? (

                            <div className="no-riders">
                                <div>🔎</div>
                                <strong>
                                    No riders found
                                </strong>

                                <span>
                                    Try changing your search or filter.
                                </span>
                            </div>

                        ) : (

                            <table className="riders-table">

                                <thead>
                                    <tr>
                                        <th>RIDER</th>
                                        <th>CONTACT</th>
                                        <th>STATUS</th>
                                        <th>AVAILABILITY</th>
                                        <th>LOCATION</th>
                                        <th>ACTION</th>
                                    </tr>
                                </thead>

                                <tbody>

                                    {filteredRiders.map((rider) => (

                                        <tr key={rider.id}>

                                            <td>
                                                <div className="rider-person">

                                                    <div className="rider-person-avatar">
                                                        {(rider.username ||
                                                            "R")
                                                            .charAt(0)
                                                            .toUpperCase()}
                                                    </div>

                                                    <div>
                                                        <strong>
                                                            {rider.username ||
                                                                "Unknown Rider"}
                                                        </strong>

                                                        <span>
                                                            Rider ID #{rider.id}
                                                        </span>
                                                    </div>

                                                </div>
                                            </td>

                                            <td>
                                                <div className="contact-info">

                                                    <span>
                                                        {rider.email ||
                                                            "No email"}
                                                    </span>

                                                    <span>
                                                        {rider.phone ||
                                                            "No phone"}
                                                    </span>

                                                </div>
                                            </td>

                                            <td>

                                                {rider.is_online ? (

                                                    <span className="status-pill online">
                                                        <i></i>
                                                        Online
                                                    </span>

                                                ) : (

                                                    <span className="status-pill offline">
                                                        <i></i>
                                                        Offline
                                                    </span>

                                                )}

                                            </td>

                                            <td>

                                                {rider.is_available ? (

                                                    <span className="availability available">
                                                        Available
                                                    </span>

                                                ) : (

                                                    <span className="availability busy">
                                                        On Delivery
                                                    </span>

                                                )}

                                            </td>

                                            <td>

                                                {rider.latitude &&
                                                rider.longitude ? (
                                                    <span
                                                        style={{
                                                            fontSize: "11px",
                                                            color: "#475569",
                                                        }}
                                                    >
                                                        📍{" "}
                                                        {Number(
                                                            rider.latitude
                                                        ).toFixed(4)}
                                                        ,{" "}
                                                        {Number(
                                                            rider.longitude
                                                        ).toFixed(4)}
                                                    </span>
                                                ) : (
                                                    <span
                                                        style={{
                                                            fontSize: "11px",
                                                            color: "#94a3b8",
                                                        }}
                                                    >
                                                        Location unavailable
                                                    </span>
                                                )}

                                            </td>

                                            <td>

                                                <button
                                                    className="more-btn"
                                                    title="View rider"
                                                    onClick={() =>
                                                        alert(
                                                            `${rider.username} selected`
                                                        )
                                                    }
                                                >
                                                    ⋮
                                                </button>

                                            </td>

                                        </tr>

                                    ))}

                                </tbody>

                            </table>
                        )}

                    </div>

                </section>

            </main>

        </div>
    );
}

export default Riders;