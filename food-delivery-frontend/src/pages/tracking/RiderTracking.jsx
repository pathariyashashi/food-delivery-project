import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./RiderTracking.css";

const API_BASE = "http://127.0.0.1:8000/api";

function RiderTracking() {
    const { orderId } = useParams();
    const navigate = useNavigate();

    const [location, setLocation] = useState(null);
    const [tracking, setTracking] = useState(false);
    const [error, setError] = useState("");
    const [lastUpdated, setLastUpdated] = useState(null);

    // ==============================
    // AUTH CHECK
    // ==============================

    useEffect(() => {
        const token = localStorage.getItem("access_token");
        const role = localStorage.getItem("user_role");

        if (!token) {
            navigate("/login");
            return;
        }

        if (role !== "rider") {
            navigate("/orders");
        }
    }, [navigate]);

    // ==============================
    // GPS TRACKING
    // ==============================

    useEffect(() => {
        if (!tracking) {
            return;
        }

        if (!navigator.geolocation) {
            setError(
                "Geolocation is not supported by this browser."
            );
            setTracking(false);
            return;
        }

        const token = localStorage.getItem("access_token");

        if (!token) {
            navigate("/login");
            return;
        }

        setError("");

        const watchId = navigator.geolocation.watchPosition(
            async (position) => {
                const latitude = position.coords.latitude;
                const longitude = position.coords.longitude;

                // Update UI immediately
                setLocation({
                    latitude,
                    longitude,
                });

                setLastUpdated(new Date());

                try {
                    const response = await fetch(
                        `${API_BASE}/tracking/location/`,
                        {
                            method: "POST",
                            headers: {
                                Authorization: `Bearer ${token}`,
                                "Content-Type":
                                    "application/json",
                            },
                            body: JSON.stringify({
                                order_id: Number(orderId),
                                latitude,
                                longitude,
                            }),
                        }
                    );

                    const data = await response.json();

                    if (!response.ok) {
                        throw new Error(
                            data?.error ||
                            data?.detail ||
                            "Unable to update location"
                        );
                    }

                    console.log(
                        "Location updated successfully:",
                        data
                    );

                    setError("");
                } catch (err) {
                    console.error(
                        "Location update error:",
                        err
                    );

                    setError(
                        err.message ||
                        "Unable to update your location."
                    );
                }
            },

            (geoError) => {
                setTracking(false);

                switch (geoError.code) {
                    case 1:
                        setError(
                            "Location permission denied. Please allow location access."
                        );
                        break;

                    case 2:
                        setError(
                            "Unable to determine your location."
                        );
                        break;

                    case 3:
                        setError(
                            "Location request timed out."
                        );
                        break;

                    default:
                        setError(
                            "Unable to get your location."
                        );
                }
            },

            {
                enableHighAccuracy: true,
                maximumAge: 5000,
                timeout: 10000,
            }
        );

        return () => {
            navigator.geolocation.clearWatch(watchId);
        };
    }, [tracking, orderId, navigate]);

    // ==============================
    // START TRACKING
    // ==============================

    const startTracking = () => {
        setError("");
        setLocation(null);
        setLastUpdated(null);
        setTracking(true);
    };

    // ==============================
    // STOP TRACKING
    // ==============================

    const stopTracking = () => {
        setTracking(false);
    };

    // ==============================
    // FORMAT TIME
    // ==============================

    const formattedTime = lastUpdated
        ? lastUpdated.toLocaleTimeString("en-IN")
        : "Not available";

    return (
        <div className="rider-tracking-page">

            <div className="rider-tracking-card">

                {/* ICON */}

                <div className="rider-icon">
                    🛵
                </div>

                {/* TITLE */}

                <h1>
                    Rider Dashboard
                </h1>

                <p className="rider-order">
                    Delivery Order #{orderId}
                </p>

                {/* GPS STATUS */}

                <div
                    className={
                        tracking
                            ? "gps-status active"
                            : "gps-status"
                    }
                >
                    <span></span>

                    {tracking
                        ? "GPS Tracking Active"
                        : "GPS Tracking Stopped"}
                </div>

                {/* LOCATION */}

                {location && (
                    <div className="location-box">

                        <div>
                            <span>
                                Latitude
                            </span>

                            <strong>
                                {location.latitude.toFixed(6)}
                            </strong>
                        </div>

                        <div>
                            <span>
                                Longitude
                            </span>

                            <strong>
                                {location.longitude.toFixed(6)}
                            </strong>
                        </div>

                    </div>
                )}

                {/* LAST UPDATED */}

                <div className="last-updated">

                    <span>
                        Last Location Update
                    </span>

                    <strong>
                        {formattedTime}
                    </strong>

                </div>

                {/* WAITING */}

                {!location &&
                    !error &&
                    !tracking && (
                        <p className="waiting-text">
                            Start GPS tracking to
                            share your live location.
                        </p>
                    )}

                {tracking &&
                    !location &&
                    !error && (
                        <p className="waiting-text">
                            Waiting for GPS location...
                        </p>
                    )}

                {/* ERROR */}

                {error && (
                    <div className="rider-error">
                        {error}
                    </div>
                )}

                {/* CONTROLS */}

                <div className="tracking-controls">

                    {!tracking ? (
                        <button
                            className="start-tracking-btn"
                            onClick={startTracking}
                        >
                            📍 Start Live Tracking
                        </button>
                    ) : (
                        <button
                            className="stop-tracking-btn"
                            onClick={stopTracking}
                        >
                            ⏹ Stop Tracking
                        </button>
                    )}

                </div>

                {/* BACK */}

                <button
                    className="back-orders-btn"
                    onClick={() =>
                        navigate("/rider/orders")
                    }
                >
                    ← Back to Assigned Orders
                </button>

            </div>

        </div>
    );
}

export default RiderTracking;