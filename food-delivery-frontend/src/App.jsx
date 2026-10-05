import { Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ForgotPassword from "./pages/auth/ForgotPassword";

import Home from "./pages/home/Home";

import Cart from "./pages/cart/Cart";
import Checkout from "./pages/checkout/Checkout";

import Orders from "./pages/orders/Orders";
import OrderDetail from "./pages/orders/OrderDetail";
import AssignRider from "./pages/orders/AssignRider";
import RiderOrders from "./pages/orders/RiderOrders";

import Tracking from "./pages/tracking/Tracking";
import RiderTracking from "./pages/tracking/RiderTracking";

import AdminDashboard from "./pages/admin/AdminDashboard";
import Riders from "./pages/admin/Riders";
import CreateRider from "./pages/admin/CreateRider";
import AdminOrders from "./pages/admin/AdminOrders";

function App() {
    return (
        <Routes>

            {/* =========================
                PUBLIC / AUTH
            ========================= */}

            <Route
                path="/login"
                element={<Login />}
            />

            <Route
                path="/register"
                element={<Register />}
            />

            <Route
                path="/forgot-password"
                element={<ForgotPassword />}
            />


            {/* =========================
                CUSTOMER HOME
            ========================= */}

            <Route
                path="/"
                element={<Navigate to="/home" replace />}
            />

            <Route
                path="/home"
                element={<Home />}
            />


            {/* =========================
                CUSTOMER
            ========================= */}

            <Route
                path="/cart"
                element={<Cart />}
            />

            <Route
                path="/checkout"
                element={<Checkout />}
            />

            <Route
                path="/orders"
                element={<Orders />}
            />

            <Route
                path="/orders/:orderId"
                element={<OrderDetail />}
            />

            <Route
                path="/tracking/:orderId"
                element={<Tracking />}
            />


            {/* =========================
                ADMIN
            ========================= */}

            <Route
                path="/admin"
                element={<AdminDashboard />}
            />

            <Route
                path="/admin/orders"
                element={<AdminOrders />}
            />

            <Route
                path="/admin/riders"
                element={<Riders />}
            />

            <Route
                path="/admin/riders/create"
                element={<CreateRider />}
            />

            <Route
                path="/orders/:orderId/assign-rider"
                element={<AssignRider />}
            />


            {/* =========================
                RIDER
            ========================= */}

            <Route
                path="/rider/orders"
                element={<RiderOrders />}
            />

            <Route
                path="/rider-tracking/:orderId"
                element={<RiderTracking />}
            />


            {/* =========================
                UNKNOWN URL
            ========================= */}

            <Route
                path="*"
                element={<Navigate to="/home" replace />}
            />

        </Routes>
    );
}

export default App;