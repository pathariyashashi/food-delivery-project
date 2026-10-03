import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Register.css";

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

const UserIcon = () => (
    <svg viewBox="0 0 24 24">
        <circle cx="12" cy="8" r="3.5" />
        <path d="M5 20c.8-3.4 3.2-5 7-5s6.2 1.6 7 5" />
    </svg>
);

const MailIcon = () => (
    <svg viewBox="0 0 24 24">
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="m3 7 9 6 9-6" />
    </svg>
);

const PhoneIcon = () => (
    <svg viewBox="0 0 24 24">
        <path d="M6 3h3l2 5-2 2c1 2.2 2.8 4 5 5l2-2 5 2v3c0 1-1 2-2 2C11 20 4 13 4 5c0-1.1.9-2 2-2Z" />
    </svg>
);

const LockIcon = () => (
    <svg viewBox="0 0 24 24">
        <rect x="4" y="10" width="16" height="10" rx="2" />
        <path d="M8 10V7a4 4 0 0 1 8 0v3" />
    </svg>
);

function Register() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        username: "",
        email: "",
        phone: "",
        password: "",
        confirmPassword: "",
    });

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] =
        useState(false);

    const [acceptedTerms, setAcceptedTerms] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));

        setError("");
        setSuccess("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setError("");
        setSuccess("");

        if (
            !formData.username ||
            !formData.email ||
            !formData.phone ||
            !formData.password ||
            !formData.confirmPassword
        ) {
            setError("Please fill in all fields.");
            return;
        }

        if (
            formData.password !==
            formData.confirmPassword
        ) {
            setError("Passwords do not match.");
            return;
        }

        if (!acceptedTerms) {
            setError(
                "Please accept the terms and conditions."
            );
            return;
        }

        setLoading(true);

        try {
            const response = await fetch(
                "http://127.0.0.1:8000/api/register/",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Accept: "application/json",
                    },
                    body: JSON.stringify({
                        username: formData.username.trim(),
                        email: formData.email.trim(),
                        phone: formData.phone.trim(),
                        password: formData.password,
                    }),
                }
            );

            const data = await response.json();

            console.log(
                "REGISTER STATUS:",
                response.status
            );

            console.log(
                "REGISTER RESPONSE:",
                data
            );

            if (!response.ok) {
                let errorMessage =
                    "Unable to create your account.";

                if (data.detail) {
                    errorMessage = data.detail;
                } else if (data.message) {
                    errorMessage = data.message;
                } else {
                    const firstError =
                        Object.values(data)[0];

                    if (Array.isArray(firstError)) {
                        errorMessage = firstError[0];
                    } else if (
                        typeof firstError === "string"
                    ) {
                        errorMessage = firstError;
                    }
                }

                setError(errorMessage);
                return;
            }

            setSuccess(
                "Account created successfully. Redirecting..."
            );

            setTimeout(() => {
                navigate("/login");
            }, 1000);
        } catch (err) {
            console.error(
                "REGISTER ERROR:",
                err
            );

            setError(
                "Unable to connect to server. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="register-page">

            {/* LEFT */}

            <section className="register-showcase">

                <div className="register-brand">

                    <div className="register-brand-icon">
                        <LogoIcon />
                    </div>

                    <span>foodie</span>

                </div>

                <div className="register-showcase-content">

                    <span className="register-overline">
                        JOIN FOODIE
                    </span>

                    <h1>
                        Great food starts
                        <br />
                        <span>with you.</span>
                    </h1>

                    <p>
                        Create your Foodie account and
                        discover delicious meals from
                        restaurants around you.
                    </p>

                    <div className="register-benefits">

                        <div>
                            <strong>01</strong>
                            <span>
                                Discover restaurants
                            </span>
                        </div>

                        <div>
                            <strong>02</strong>
                            <span>
                                Order your favorites
                            </span>
                        </div>

                        <div>
                            <strong>03</strong>
                            <span>
                                Enjoy doorstep delivery
                            </span>
                        </div>

                    </div>

                </div>

            </section>

            {/* RIGHT */}

            <section className="register-form-section">

                <div className="register-form-wrapper">

                    <div className="register-mobile-brand">

                        <div className="register-brand-icon">
                            <LogoIcon />
                        </div>

                        <span>foodie</span>

                    </div>

                    <div className="register-heading">

                        <span>
                            CREATE ACCOUNT
                        </span>

                        <h2>
                            Get started with Foodie
                        </h2>

                        <p>
                            Create your account in less
                            than a minute.
                        </p>

                    </div>

                    {error && (
                        <div className="register-alert error">
                            <strong>!</strong>
                            <span>{error}</span>
                        </div>
                    )}

                    {success && (
                        <div className="register-alert success">
                            <strong>✓</strong>
                            <span>{success}</span>
                        </div>
                    )}

                    <form
                        className="register-form"
                        onSubmit={handleSubmit}
                    >

                        <div className="register-two-column">

                            <div className="register-field">

                                <label>
                                    Username
                                </label>

                                <div className="register-input">
                                    <UserIcon />

                                    <input
                                        type="text"
                                        name="username"
                                        value={
                                            formData.username
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        placeholder="Your username"
                                        autoComplete="username"
                                    />
                                </div>

                            </div>

                            <div className="register-field">

                                <label>
                                    Phone number
                                </label>

                                <div className="register-input">
                                    <PhoneIcon />

                                    <input
                                        type="tel"
                                        name="phone"
                                        value={
                                            formData.phone
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        placeholder="Your phone"
                                        autoComplete="tel"
                                    />
                                </div>

                            </div>

                        </div>

                        <div className="register-field">

                            <label>
                                Email address
                            </label>

                            <div className="register-input">

                                <MailIcon />

                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={
                                        handleChange
                                    }
                                    placeholder="you@example.com"
                                    autoComplete="email"
                                />

                            </div>

                        </div>

                        <div className="register-two-column">

                            <div className="register-field">

                                <label>
                                    Password
                                </label>

                                <div className="register-input">

                                    <LockIcon />

                                    <input
                                        type={
                                            showPassword
                                                ? "text"
                                                : "password"
                                        }
                                        name="password"
                                        value={
                                            formData.password
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        placeholder="Password"
                                        autoComplete="new-password"
                                    />

                                    <button
                                        type="button"
                                        className="register-password-toggle"
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

                            <div className="register-field">

                                <label>
                                    Confirm password
                                </label>

                                <div className="register-input">

                                    <LockIcon />

                                    <input
                                        type={
                                            showConfirmPassword
                                                ? "text"
                                                : "password"
                                        }
                                        name="confirmPassword"
                                        value={
                                            formData.confirmPassword
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        placeholder="Confirm password"
                                        autoComplete="new-password"
                                    />

                                    <button
                                        type="button"
                                        className="register-password-toggle"
                                        onClick={() =>
                                            setShowConfirmPassword(
                                                !showConfirmPassword
                                            )
                                        }
                                    >
                                        {showConfirmPassword
                                            ? "Hide"
                                            : "Show"}
                                    </button>

                                </div>

                            </div>

                        </div>

                        <label className="terms-row">

                            <input
                                type="checkbox"
                                checked={acceptedTerms}
                                onChange={(e) =>
                                    setAcceptedTerms(
                                        e.target.checked
                                    )
                                }
                            />

                            <span>
                                I agree to the terms and
                                conditions.
                            </span>

                        </label>

                        <button
                            type="submit"
                            className="register-submit"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <span className="register-loader"></span>
                                    Creating account...
                                </>
                            ) : (
                                "Create account"
                            )}
                        </button>

                    </form>

                    <div className="register-bottom">

                        <span>
                            Already have an account?
                        </span>

                        <Link to="/login">
                            Sign in
                        </Link>

                    </div>

                </div>

            </section>

        </div>
    );
}

export default Register;