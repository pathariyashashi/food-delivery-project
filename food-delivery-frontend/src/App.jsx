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

            {/* Home */}
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/home" element={<Home />} />

            {/* Authentication */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/riders" element={<Riders />} />
            <Route
                path="/forgot-password"
                element={<ForgotPassword />}
            />

            {/* Customer */}
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />

            {/* Orders */}
            <Route path="/orders" element={<Orders />} />
            <Route
                path="/orders/:orderId"
                element={<OrderDetail />}
            />

            {/* Admin / Manager */}
            <Route
                path="/orders/:orderId/assign-rider"
                element={<AssignRider />}
            />

            {/* Rider */}
            <Route
                path="/rider/orders"
                element={<RiderOrders />}
            />

            {/* Customer Tracking */}
            <Route
                path="/tracking/:orderId"
                element={<Tracking />}
            />

            {/* Rider Live Tracking */}
            <Route
                path="/rider-tracking/:orderId"
                element={<RiderTracking />}
            />

            {/* Unknown route */}
            <Route
                path="*"
                element={<Navigate to="/login" replace />}
            />

            <Route
    path="/admin/riders/create"
    element={<CreateRider />}
/>
            <Route path="/admin/orders" element={<AdminOrders />} />
        </Routes>
              
        
    );
}

export default App;