import { useState } from "react";
import { Link } from "react-router-dom";
import "./ForgotPassword.css";

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

function ForgotPassword() {
    const [email, setEmail] = useState("");
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!email.trim()) {
            return;
        }

        setSubmitted(true);
    };

    return (
        <div className="forgot-page">

            <section className="forgot-showcase">

                <div className="forgot-brand">

                    <div className="forgot-brand-icon">
                        <LogoIcon />
                    </div>

                    <span>foodie</span>

                </div>

                <div className="forgot-showcase-content">

                    <span>
                        NEED A HAND?
                    </span>

                    <h1>
                        We'll help you
                        <br />
                        <strong>get back in.</strong>
                    </h1>

                    <p>
                        Enter the email associated with
                        your Foodie account and follow
                        the instructions to reset your
                        password.
                    </p>

                </div>

            </section>

            <section className="forgot-form-section">

                <div className="forgot-card">

                    <div className="forgot-mobile-brand">

                        <div className="forgot-brand-icon">
                            <LogoIcon />
                        </div>

                        <span>foodie</span>

                    </div>

                    {!submitted ? (
                        <>
                            <div className="forgot-heading">

                                <span>
                                    PASSWORD RESET
                                </span>

                                <h2>
                                    Forgot your password?
                                </h2>

                                <p>
                                    Enter your registered
                                    email address and we'll
                                    help you reset your
                                    password.
                                </p>

                            </div>

                            <form
                                onSubmit={handleSubmit}
                            >

                                <div className="forgot-field">

                                    <label>
                                        Email address
                                    </label>

                                    <div className="forgot-input">

                                        <MailIcon />

                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) =>
                                                setEmail(
                                                    e.target
                                                        .value
                                                )
                                            }
                                            placeholder="you@example.com"
                                            required
                                        />

                                    </div>

                                </div>

                                <button
                                    type="submit"
                                    className="forgot-submit"
                                >
                                    Send reset link
                                </button>

                            </form>

                            <div className="forgot-back">
                                <Link to="/login">
                                    ← Back to sign in
                                </Link>
                            </div>
                        </>
                    ) : (
                        <div className="forgot-success">

                            <div className="success-mark">
                                ✓
                            </div>

                            <span>
                                CHECK YOUR EMAIL
                            </span>

                            <h2>
                                Check your inbox
                            </h2>

                            <p>
                                If an account exists for{" "}
                                <strong>
                                    {email}
                                </strong>
                                , you'll receive password
                                reset instructions.
                            </p>

                            <Link
                                to="/login"
                                className="forgot-success-btn"
                            >
                                Back to sign in
                            </Link>

                        </div>
                    )}

                </div>

            </section>

        </div>
    );
}

export default ForgotPassword;