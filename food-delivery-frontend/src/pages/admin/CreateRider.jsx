import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./CreateRider.css";

const API_BASE = "http://127.0.0.1:8000/api";

function CreateRider() {
    const navigate = useNavigate();

    const [form, setForm] = useState({
        username: "",
        email: "",
        phone: "",
        password: "",
        confirmPassword: "",
    });

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const token = localStorage.getItem("access_token");

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value,
        });

        setError("");
        setSuccess("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setError("");
        setSuccess("");

        if (!token) {
            navigate("/login");
            return;
        }

        if (form.password !== form.confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        if (form.password.length < 6) {
            setError("Password must be at least 6 characters.");
            return;
        }

        try {
            setLoading(true);

            const response = await fetch(
                `${API_BASE}/admin/riders/create/`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        username: form.username.trim(),
                        email: form.email.trim(),
                        phone: form.phone.trim(),
                        password: form.password,
                    }),
                }
            );

            const data = await response.json();

            console.log("CREATE RIDER STATUS:", response.status);
            console.log("CREATE RIDER RESPONSE:", data);

            if (!response.ok) {
                let message = "Rider create nahi ho saka.";

                if (typeof data === "object") {
                    if (data.error) {
                        message = data.error;
                    } else if (data.detail) {
                        message = data.detail;
                    } else {
                        const firstError = Object.values(data)[0];

                        if (Array.isArray(firstError)) {
                            message = firstError[0];
                        } else if (typeof firstError === "string") {
                            message = firstError;
                        }
                    }
                }

                throw new Error(message);
            }

            setSuccess(
                data.message || "Rider created successfully."
            );

            setForm({
                username: "",
                email: "",
                phone: "",
                password: "",
                confirmPassword: "",
            });

            setTimeout(() => {
                navigate("/admin/riders");
            }, 1200);

        } catch (err) {
            console.error("CREATE RIDER ERROR:", err);
            setError(err.message || "Something went wrong.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="create-rider-page">

            <aside className="create-rider-sidebar">

                <div className="create-rider-brand">
                    <div className="create-rider-brand-icon">
                        🍔
                    </div>

                    <div>
                        <strong>FoodExpress</strong>
                        <span>Admin Panel</span>
                    </div>
                </div>

                <nav className="create-rider-nav">

                    <button onClick={() => navigate("/admin")}>
                        📊
                        <span>Dashboard</span>
                    </button>

                    <button onClick={() => navigate("/orders")}>
                        🧾
                        <span>Orders</span>
                    </button>

                    <button
                        className="active"
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

                <div className="create-rider-sidebar-bottom">

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

            <main className="create-rider-main">

                <div className="create-rider-breadcrumb">
                    Admin / Riders / Create Rider
                </div>

                <div className="create-rider-heading">

                    <div>
                        <h1>Create New Rider</h1>

                        <p>
                            Add a delivery partner to your FoodExpress team.
                        </p>
                    </div>

                    <button
                        className="back-riders-btn"
                        onClick={() => navigate("/admin/riders")}
                    >
                        ← Back to Riders
                    </button>

                </div>

                <div className="create-rider-layout">

                    <section className="create-rider-card">

                        <div className="form-card-header">

                            <div className="form-header-icon">
                                🛵
                            </div>

                            <div>
                                <h2>Rider Information</h2>
                                <p>
                                    Enter the rider's basic account details.
                                </p>
                            </div>

                        </div>

                        {/* ERROR */}
                        {error && (
                            <div className="rider-form-error">
                                ⚠️ {error}
                            </div>
                        )}

                        {/* SUCCESS */}
                        {success && (
                            <div className="rider-form-success">
                                ✓ {success}
                            </div>
                        )}

                        <form onSubmit={handleSubmit}>

                            <div className="form-grid">

                                <div className="form-group">

                                    <label>
                                        Username
                                        <span>*</span>
                                    </label>

                                    <input
                                        type="text"
                                        name="username"
                                        placeholder="e.g. rider1"
                                        value={form.username}
                                        onChange={handleChange}
                                        required
                                        disabled={loading}
                                    />

                                    <small>
                                        This will be used for the rider account.
                                    </small>

                                </div>

                                <div className="form-group">

                                    <label>
                                        Email Address
                                        <span>*</span>
                                    </label>

                                    <input
                                        type="email"
                                        name="email"
                                        placeholder="rider@example.com"
                                        value={form.email}
                                        onChange={handleChange}
                                        required
                                        disabled={loading}
                                    />

                                </div>

                                <div className="form-group">

                                    <label>
                                        Phone Number
                                        <span>*</span>
                                    </label>

                                    <input
                                        type="tel"
                                        name="phone"
                                        placeholder="9876543210"
                                        value={form.phone}
                                        onChange={handleChange}
                                        maxLength="15"
                                        required
                                        disabled={loading}
                                    />

                                </div>

                                <div className="form-group">

                                    <label>
                                        Password
                                        <span>*</span>
                                    </label>

                                    <div className="password-input">

                                        <input
                                            type={
                                                showPassword
                                                    ? "text"
                                                    : "password"
                                            }
                                            name="password"
                                            placeholder="Create password"
                                            value={form.password}
                                            onChange={handleChange}
                                            required
                                            disabled={loading}
                                        />

                                        <button
                                            type="button"
                                            onClick={() =>
                                                setShowPassword(
                                                    !showPassword
                                                )
                                            }
                                            disabled={loading}
                                        >
                                            {showPassword ? "🙈" : "👁"}
                                        </button>

                                    </div>

                                </div>

                                <div className="form-group">

                                    <label>
                                        Confirm Password
                                        <span>*</span>
                                    </label>

                                    <div className="password-input">

                                        <input
                                            type={
                                                showConfirmPassword
                                                    ? "text"
                                                    : "password"
                                            }
                                            name="confirmPassword"
                                            placeholder="Confirm password"
                                            value={form.confirmPassword}
                                            onChange={handleChange}
                                            required
                                            disabled={loading}
                                        />

                                        <button
                                            type="button"
                                            onClick={() =>
                                                setShowConfirmPassword(
                                                    !showConfirmPassword
                                                )
                                            }
                                            disabled={loading}
                                        >
                                            {showConfirmPassword
                                                ? "🙈"
                                                : "👁"}
                                        </button>

                                    </div>

                                </div>

                            </div>

                            <div className="form-security-note">
                                <span>🔒</span>

                                <div>
                                    <strong>Secure account</strong>

                                    <p>
                                        The rider will automatically receive
                                        the Rider role.
                                    </p>
                                </div>
                            </div>

                            <div className="form-actions">

                                <button
                                    type="button"
                                    className="cancel-btn"
                                    onClick={() =>
                                        navigate("/admin/riders")
                                    }
                                    disabled={loading}
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    className="submit-rider-btn"
                                    disabled={loading}
                                >
                                    {loading
                                        ? "Creating..."
                                        : "Create Rider"}

                                    <span>
                                        {loading ? "⏳" : "→"}
                                    </span>
                                </button>

                            </div>

                        </form>

                    </section>

                    <aside className="rider-preview-card">

                        <div className="preview-label">
                            RIDER PREVIEW
                        </div>

                        <div className="preview-avatar">
                            {form.username
                                ? form.username
                                      .charAt(0)
                                      .toUpperCase()
                                : "R"}
                        </div>

                        <h3>
                            {form.username || "New Rider"}
                        </h3>

                        <p>
                            {form.email || "rider@example.com"}
                        </p>

                        <div className="preview-role">
                            🛵 Delivery Rider
                        </div>

                        <div className="preview-divider"></div>

                        <div className="preview-row">
                            <span>Phone</span>

                            <strong>
                                {form.phone || "Not added"}
                            </strong>
                        </div>

                        <div className="preview-row">
                            <span>Status</span>

                            <strong className="preview-status">
                                ● Offline
                            </strong>
                        </div>

                        <div className="preview-row">
                            <span>Availability</span>

                            <strong className="preview-available">
                                Available
                            </strong>
                        </div>

                    </aside>

                </div>

            </main>

        </div>
    );
}

export default CreateRider;