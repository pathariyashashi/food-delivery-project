import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
    MapContainer,
    TileLayer,
    Marker,
    Popup,
    useMap,
} from "react-leaflet";

import L from "leaflet";

import "leaflet/dist/leaflet.css";
import "./Tracking.css";

const API_BASE = "http://127.0.0.1:8000/api";
const WS_BASE = "ws://127.0.0.1:8000";

const riderIcon = new L.Icon({
    iconUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",

    shadowUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",

    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
});

const statusSteps = [
    {
        key: "pending",
        label: "Order Placed",
        icon: "📝",
    },
    {
        key: "confirmed",
        label: "Order Confirmed",
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

function getStatusIndex(status) {
    const index = statusSteps.findIndex(
        (step) => step.key === status
    );

    return index === -1 ? 0 : index;
}

function LiveRiderMarker({ location }) {
    const map = useMap();

    useEffect(() => {
        if (!location) {
            return;
        }

        map.setView(
            [location.latitude, location.longitude],
            map.getZoom(),
            {
                animate: true,
            }
        );
    }, [location, map]);

    if (!location) {
        return null;
    }

    return (
        <Marker
            position={[
                location.latitude,
                location.longitude,
            ]}
            icon={riderIcon}
        >
            <Popup>
                🛵 Rider is here
            </Popup>
        </Marker>
    );
}

function Tracking() {
    const { orderId } = useParams();
    const navigate = useNavigate();

    const [location, setLocation] = useState(null);
    const [connected, setConnected] = useState(false);
    const [error, setError] = useState("");
    const [orderStatus, setOrderStatus] =
        useState("pending");
    const [loadingOrder, setLoadingOrder] =
        useState(true);

    // =====================================
    // AUTH + ORDER DETAILS
    // =====================================

    useEffect(() => {
        const token =
            localStorage.getItem("access_token");

        if (!token) {
            navigate("/login");
            return;
        }

        const fetchOrder = async () => {
            try {
                setLoadingOrder(true);
                setError("");

                const response = await fetch(
                    `${API_BASE}/orders/${orderId}/`,
                    {
                        headers: {
                            Authorization:
                                `Bearer ${token}`,
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

                setOrderStatus(
                    data.status || "pending"
                );
            } catch (err) {
                console.error(
                    "Order status error:",
                    err
                );

                setError(
                    err.message ||
                    "Unable to load order details."
                );
            } finally {
                setLoadingOrder(false);
            }
        };

        fetchOrder();
    }, [orderId, navigate]);

    // =====================================
    // WEBSOCKET
    // =====================================

    useEffect(() => {
        const token =
            localStorage.getItem("access_token");

        if (!token) {
            navigate("/login");
            return;
        }

        let socket;

        try {
            setConnected(false);

            const wsUrl =
                `${WS_BASE}/ws/tracking/${orderId}/?token=${encodeURIComponent(
                    token
                )}`;

            socket = new WebSocket(wsUrl);

            socket.onopen = () => {
                console.log(
                    "Tracking WebSocket connected"
                );

                setConnected(true);
                setError("");
            };

            socket.onmessage = (event) => {
                try {
                    const data =
                        JSON.parse(event.data);

                    console.log(
                        "Tracking update:",
                        data
                    );

                    if (
                        data.type ===
                        "location_update"
                    ) {
                        const latitude =
                            Number(data.latitude);

                        const longitude =
                            Number(data.longitude);

                        if (
                            Number.isFinite(latitude) &&
                            Number.isFinite(longitude)
                        ) {
                            setLocation({
                                latitude,
                                longitude,
                            });
                        }
                    }
                } catch (err) {
                    console.error(
                        "Invalid tracking data:",
                        err
                    );
                }
            };

            socket.onerror = () => {
                console.error(
                    "Tracking WebSocket error"
                );

                setConnected(false);
                setError(
                    "Unable to connect to live tracking."
                );
            };

            socket.onclose = (event) => {
                setConnected(false);

                console.log(
                    "Tracking WebSocket disconnected:",
                    event.code
                );
            };
        } catch (err) {
            console.error(
                "WebSocket connection error:",
                err
            );

            setConnected(false);

            setError(
                "Unable to connect to live tracking."
            );
        }

        return () => {
            if (socket) {
                socket.close();
            }
        };
    }, [orderId, navigate]);

    // =====================================
    // STATUS
    // =====================================

    const currentStatusIndex =
        getStatusIndex(orderStatus);

    const statusLabel =
        statusSteps[currentStatusIndex]?.label ||
        orderStatus;

    return (
        <div className="tracking-page">

            {/* HEADER */}

            <header className="tracking-header">

                <button
                    className="tracking-back"
                    onClick={() =>
                        navigate("/orders")
                    }
                >
                    ← Back to Orders
                </button>

                <div>
                    <h1>
                        Live Order Tracking
                    </h1>

                    <p>
                        Order #{orderId}
                    </p>
                </div>

                <div
                    className={`tracking-status ${
                        connected
                            ? "connected"
                            : "disconnected"
                    }`}
                >
                    <span></span>

                    {connected
                        ? "Live"
                        : "Connecting..."}
                </div>

            </header>

            {/* MAIN */}

            <main className="tracking-container">

                {/* ORDER STATUS */}

                <div className="tracking-timeline">

                    <div className="timeline-heading">

                        <div>
                            <h2>
                                Order Status
                            </h2>

                            <p>
                                {loadingOrder
                                    ? "Loading order status..."
                                    : `Current status: ${statusLabel}`}
                            </p>
                        </div>

                    </div>

                    <div className="timeline">

                        {statusSteps.map(
                            (step, index) => {

                                const completed =
                                    index <=
                                    currentStatusIndex;

                                const active =
                                    index ===
                                    currentStatusIndex;

                                return (
                                    <div
                                        className={`timeline-step ${
                                            completed
                                                ? "completed"
                                                : ""
                                        } ${
                                            active
                                                ? "active"
                                                : ""
                                        }`}
                                        key={step.key}
                                    >

                                        <div className="timeline-icon">
                                            {step.icon}
                                        </div>

                                        <div className="timeline-content">

                                            <strong>
                                                {step.label}
                                            </strong>

                                            {active && (
                                                <span>
                                                    Current Status
                                                </span>
                                            )}

                                        </div>

                                    </div>
                                );
                            }
                        )}

                    </div>
                </div>

                {/* TRACKING INFO */}

                <div className="tracking-info-card">

                    <div>
                        <strong>
                            🛵 Delivery Partner
                        </strong>

                        <p>
                            {connected
                                ? "Your rider's location is being updated live."
                                : "Connecting to live location..."}
                        </p>
                    </div>

                    {location && (
                        <div className="coordinates">

                            <span>
                                Lat:{" "}
                                {location.latitude.toFixed(
                                    6
                                )}
                            </span>

                            <span>
                                Lng:{" "}
                                {location.longitude.toFixed(
                                    6
                                )}
                            </span>

                        </div>
                    )}

                </div>

                {/* ERROR */}

                {error && (
                    <div className="tracking-error">
                        {error}
                    </div>
                )}

                {/* MAP */}

                <div className="tracking-map">

                    {location ? (
                        <MapContainer
                            center={[
                                location.latitude,
                                location.longitude,
                            ]}
                            zoom={15}
                            scrollWheelZoom={true}
                            style={{
                                height: "100%",
                                width: "100%",
                            }}
                        >

                            <TileLayer
                                attribution="&copy; OpenStreetMap contributors"
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            />

                            <LiveRiderMarker
                                location={location}
                            />

                        </MapContainer>
                    ) : (
                        <div className="map-loading">

                            <div>

                                <div className="map-loading-icon">
                                    🛵
                                </div>

                                <h2>
                                    Waiting for rider location
                                </h2>

                                <p>
                                    Live location will
                                    appear here once the
                                    rider starts sharing
                                    their location.
                                </p>

                            </div>

                        </div>
                    )}

                </div>

            </main>

        </div>
    );
}

export default Tracking;