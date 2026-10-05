import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Login.css";

const LogoIcon = () => (
    <svg viewBox="0 0 24 24">
        <path d="M6 3v7a3 3 0 0 0 6 0V3" />
        <path d="M9 3v7" />
        <path d="M12 3v7" />
        <path d="M9 13v8" />
        <path d="M18 3v18" />
        <path d="M18 3c-2.2 1.2-3 3.1-3 5.4 0 2.3 1 4 3 4.8" />
    </svg>
);

const MailIcon = () => (
    <svg viewBox="0 0 24 24">
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="m3 7 9 6 9-6" />
    </svg>
);

const LockIcon = () => (
    <svg viewBox="0 0 24 24">
        <rect x="4" y="10" width="16" height="10" rx="2" />
        <path d="M8 10V7a4 4 0 0 1 8 0v3" />
    </svg>
);

function Login() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });

    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));

        setError("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.email || !formData.password) {
            setError("Please enter your email and password.");
            return;
        }

        setLoading(true);
        setError("");

        try {
            // Production + Local API support
            const API_ROOT =
                import.meta.env.VITE_API_URL ||
                "http://127.0.0.1:8000";

            const response = await fetch(
                `${API_ROOT}/api/login/`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Accept: "application/json",
                    },
                    body: JSON.stringify({
                        email: formData.email.trim(),
                        password: formData.password,
                    }),
                }
            );

            const data = await response.json();

            console.log("LOGIN STATUS:", response.status);
            console.log("LOGIN RESPONSE:", data);

            if (!response.ok) {
                let errorMessage =
                    "Unable to sign in. Please check your details.";

                if (data.detail) {
                    errorMessage = data.detail;
                } else if (data.message) {
                    errorMessage = data.message;
                } else if (data.error) {
                    errorMessage = data.error;
                } else {
                    const firstError = Object.values(data)[0];

                    if (Array.isArray(firstError)) {
                        errorMessage = firstError[0];
                    } else if (typeof firstError === "string") {
                        errorMessage = firstError;
                    }
                }

                setError(errorMessage);
                return;
            }

            /*
             * Backend response:
             *
             * {
             *   "message": "Login successful",
             *   "access": "...",
             *   "refresh": "...",
             *   "user": {
             *     "id": 11,
             *     "username": "admin_test",
             *     "email": "admin@fooddelivery.com",
             *     "role": "admin"
             *   }
             * }
             */

            // Save access token
            if (data.access) {
                localStorage.setItem(
                    "access_token",
                    data.access
                );
            }

            // Save refresh token
            if (data.refresh) {
                localStorage.setItem(
                    "refresh_token",
                    data.refresh
                );
            }

            // Make sure user object exists
            if (!data.user) {
                setError(
                    "User information was not received from server."
                );
                return;
            }

            // Role comes from data.user.role
            const role = data.user.role || "customer";

            // Save user information
            localStorage.setItem(
                "user_email",
                data.user.email || formData.email.trim()
            );

            localStorage.setItem(
                "user_role",
                role
            );

            localStorage.setItem(
                "user_data",
                JSON.stringify(data.user)
            );

            console.log("LOGIN ROLE:", role);
            console.log("LOGIN USER:", data.user);
            console.log("Login successful");

            // Role based redirect
            if (role === "admin" || role === "manager") {
                navigate("/admin", { replace: true });
            } else if (role === "rider") {
                navigate("/rider/orders", { replace: true });
            } else {
                // Customer -> Homepage
                navigate("/home", { replace: true });
            }

        } catch (err) {
            console.error("LOGIN ERROR:", err);

            setError(
                "Unable to connect to server. Please make sure the server is running."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">

            {/* LEFT */}
            <section className="auth-showcase">

                <div className="auth-brand">
                    <div className="auth-brand-icon">
                        <LogoIcon />
                    </div>

                    <span>foodie</span>
                </div>

                <div className="auth-showcase-content">

                    <span className="auth-overline">
                        GOOD FOOD. GREAT MOMENTS.
                    </span>

                    <h1>
                        Everything you love,
                        <br />
                        <span>delivered fresh.</span>
                    </h1>

                    <p>
                        Discover great restaurants, order
                        your favorite meals and enjoy fresh
                        food delivered straight to your door.
                    </p>

                    <div className="auth-benefits">

                        <div>
                            <strong>Fast</strong>
                            <span>Delivery</span>
                        </div>

                        <div>
                            <strong>Fresh</strong>
                            <span>Ingredients</span>
                        </div>

                        <div>
                            <strong>Easy</strong>
                            <span>Ordering</span>
                        </div>

                    </div>

                </div>

                <div className="auth-showcase-footer">
                    Your food, your way.
                </div>

            </section>

            {/* RIGHT */}
            <section className="auth-form-section">

                <div className="auth-form-wrapper">

                    <div className="mobile-auth-brand">
                        <div className="auth-brand-icon">
                            <LogoIcon />
                        </div>

                        <span>foodie</span>
                    </div>

                    <div className="auth-heading">

                        <span>
                            WELCOME BACK
                        </span>

                        <h2>
                            Sign in to your account
                        </h2>

                        <p>
                            Enter your details to continue.
                        </p>

                    </div>

                    {error && (
                        <div className="auth-alert">
                            <strong>!</strong>
                            <span>{error}</span>
                        </div>
                    )}

                    <form
                        className="auth-form"
                        onSubmit={handleSubmit}
                    >

                        <div className="auth-field">

                            <label htmlFor="email">
                                Email address
                            </label>

                            <div className="auth-input">

                                <MailIcon />

                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="you@example.com"
                                    autoComplete="email"
                                />

                            </div>

                        </div>

                        <div className="auth-field">

                            <div className="auth-label-row">

                                <label htmlFor="password">
                                    Password
                                </label>

                                <Link to="/forgot-password">
                                    Forgot password?
                                </Link>

                            </div>

                            <div className="auth-input">

                                <LockIcon />

                                <input
                                    id="password"
                                    name="password"
                                    type={
                                        showPassword
                                            ? "text"
                                            : "password"
                                    }
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="Enter your password"
                                    autoComplete="current-password"
                                />

                                <button
                                    type="button"
                                    className="password-toggle"
                                    onClick={() =>
                                        setShowPassword(
                                            !showPassword
                                        )
                                    }
                                >
                                    {showPassword
                                        ? "Hide"
                                        : "Show"}
                                </button>

                            </div>

                        </div>

                        <button
                            type="submit"
                            className="auth-submit"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <span className="auth-loader"></span>
                                    Signing in...
                                </>
                            ) : (
                                "Sign in"
                            )}
                        </button>

                    </form>

                    <div className="auth-bottom">

                        <span>
                            Don't have an account?
                        </span>

                        <Link to="/register">
                            Create an account
                        </Link>

                    </div>

                </div>

            </section>

        </div>
    );
}

export default Login;