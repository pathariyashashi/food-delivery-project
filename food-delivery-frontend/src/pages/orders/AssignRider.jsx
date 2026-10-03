import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./AssignRider.css";

const API_BASE = "http://127.0.0.1:8000/api";

function AssignRider() {
    const { orderId } = useParams();
    const navigate = useNavigate();

    const [riders, setRiders] = useState([]);
    const [selectedRider, setSelectedRider] = useState("");
    const [loading, setLoading] = useState(true);
    const [assigning, setAssigning] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    useEffect(() => {
        const token = localStorage.getItem("access_token");
        const role = localStorage.getItem("user_role");

        if (!token) {
            navigate("/login");
            return;
        }

        // Only admin/manager can access this page
        if (role !== "admin" && role !== "manager") {
            navigate("/orders");
            return;
        }

        const fetchRiders = async () => {
            try {
                setLoading(true);
                setError("");

                const response = await fetch(
                    `${API_BASE}/tracking/riders/`,
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
                        "Unable to load riders"
                    );
                }

                setRiders(
                    Array.isArray(data)
                        ? data
                        : []
                );
            } catch (err) {
                setError(
                    err.message ||
                    "Unable to load riders"
                );
            } finally {
                setLoading(false);
            }
        };

        fetchRiders();
    }, [navigate]);

    const handleAssign = async () => {
        if (!selectedRider) {
            setError("Please select a rider.");
            return;
        }

        const token =
            localStorage.getItem("access_token");

        if (!token) {
            navigate("/login");
            return;
        }

        try {
            setAssigning(true);
            setError("");
            setSuccess("");

            const response = await fetch(
                `${API_BASE}/orders/${orderId}/assign-rider/`,
                {
                    method: "PATCH",

                    headers: {
                        Authorization:
                            `Bearer ${token}`,

                        "Content-Type":
                            "application/json",
                    },

                    body: JSON.stringify({
                        rider_id:
                            Number(selectedRider),
                    }),
                }
            );

            const data =
                await response.json();

            if (!response.ok) {
                throw new Error(
                    data?.detail ||
                    data?.error ||
                    "Unable to assign rider"
                );
            }

            setSuccess(
                "Rider assigned successfully."
            );

            setTimeout(() => {
                navigate("/orders");
            }, 1200);

        } catch (err) {
            setError(
                err.message ||
                "Unable to assign rider"
            );
        } finally {
            setAssigning(false);
        }
    };

    const selectedRiderData =
        riders.find(
            (rider) =>
                rider.id ===
                Number(selectedRider)
        );

    return (
        <div className="assign-rider-page">

            <div className="assign-rider-card">

                {/* Back */}

                <button
                    className="assign-back-btn"
                    onClick={() =>
                        navigate("/orders")
                    }
                >
                    ← Back to Orders
                </button>


                {/* Header */}

                <div className="assign-icon">
                    🛵
                </div>

                <h1>
                    Assign Delivery Rider
                </h1>

                <p className="assign-order">
                    Order #{orderId}
                </p>


                {/* Loading */}

                {loading && (
                    <div className="assign-message">
                        Loading available riders...
                    </div>
                )}


                {/* No Riders */}

                {!loading &&
                    riders.length === 0 &&
                    !error && (
                        <div className="assign-message">
                            No available riders found.
                        </div>
                    )}


                {/* Riders */}

                {!loading &&
                    riders.length > 0 && (
                        <>
                            <label
                                className="assign-label"
                                htmlFor="rider"
                            >
                                Select Rider
                            </label>

                            <select
                                id="rider"
                                className="rider-select"
                                value={selectedRider}
                                onChange={(e) => {
                                    setSelectedRider(
                                        e.target.value
                                    );
                                    setError("");
                                    setSuccess("");
                                }}
                                disabled={assigning}
                            >
                                <option value="">
                                    Choose a rider
                                </option>

                                {riders.map(
                                    (rider) => (
                                        <option
                                            key={
                                                rider.id
                                            }
                                            value={
                                                rider.id
                                            }
                                        >
                                            {rider.username}
                                            {" - "}
                                            {rider.phone ||
                                                "No phone"}
                                            {rider.is_online
                                                ? " - Online"
                                                : " - Offline"}
                                        </option>
                                    )
                                )}
                            </select>


                            {/* Selected Rider Preview */}

                            {selectedRiderData && (
                                <div className="rider-preview">

                                    <strong>
                                        {
                                            selectedRiderData.username
                                        }
                                    </strong>

                                    <span>
                                        📞{" "}
                                        {
                                            selectedRiderData.phone ||
                                            "Phone not available"
                                        }
                                    </span>

                                    <span
                                        className={
                                            selectedRiderData.is_online
                                                ? "online"
                                                : "offline"
                                        }
                                    >
                                        ●{" "}
                                        {selectedRiderData.is_online
                                            ? "Online"
                                            : "Offline"}
                                    </span>

                                </div>
                            )}


                            {/* Assign Button */}

                            <button
                                className="assign-rider-btn"
                                onClick={
                                    handleAssign
                                }
                                disabled={
                                    assigning ||
                                    !selectedRider
                                }
                            >
                                {assigning
                                    ? "Assigning..."
                                    : "🛵 Assign Rider"}
                            </button>
                        </>
                    )}


                {/* Error */}

                {error && (
                    <div className="assign-error">
                        {error}
                    </div>
                )}


                {/* Success */}

                {success && (
                    <div className="assign-success">
                        {success}
                    </div>
                )}

            </div>

        </div>
    );
}

export default AssignRider;