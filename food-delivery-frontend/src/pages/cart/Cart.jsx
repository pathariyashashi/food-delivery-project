import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Cart.css";

const API_BASE = "http://127.0.0.1:8000/api";
const MEDIA_BASE = "http://127.0.0.1:8000";

function getImageUrl(image) {
    if (!image) return "";
    if (image.startsWith("http")) return image;
    return `${MEDIA_BASE}${image}`;
}

function getCartItems(data) {
    if (Array.isArray(data)) return data;

    if (Array.isArray(data?.items)) {
        return data.items;
    }

    if (Array.isArray(data?.cart_items)) {
        return data.cart_items;
    }

    if (Array.isArray(data?.results)) {
        return data.results;
    }

    return [];
}

function Cart() {
    const navigate = useNavigate();

    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [updatingId, setUpdatingId] = useState(null);
    const [clearing, setClearing] = useState(false);

    const token = localStorage.getItem("access_token");

    useEffect(() => {
        if (!token) {
            navigate("/login");
            return;
        }

        fetchCart();
    }, []);

    async function fetchCart() {
        try {
            setLoading(true);
            setError("");

            const response = await fetch(`${API_BASE}/cart/`, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: "application/json",
                },
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data?.detail || "Unable to load your cart."
                );
            }

            setCartItems(getCartItems(data));
        } catch (err) {
            setError(err.message || "Something went wrong.");
        } finally {
            setLoading(false);
        }
    }

    async function updateQuantity(itemId, quantity) {
        if (quantity < 1) {
            return;
        }

        try {
            setUpdatingId(itemId);

            const response = await fetch(
                `${API_BASE}/cart/item/${itemId}/`,
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                        Accept: "application/json",
                    },
                    body: JSON.stringify({
                        quantity,
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data?.detail || "Unable to update quantity."
                );
            }

            await fetchCart();
        } catch (err) {
            setError(err.message || "Unable to update cart.");
        } finally {
            setUpdatingId(null);
        }
    }

    async function removeItem(itemId) {
        try {
            setUpdatingId(itemId);

            const response = await fetch(
                `${API_BASE}/cart/item/${itemId}/delete/`,
                {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        Accept: "application/json",
                    },
                }
            );

            if (!response.ok) {
                const data = await response.json().catch(() => ({}));

                throw new Error(
                    data?.detail || "Unable to remove item."
                );
            }

            await fetchCart();
        } catch (err) {
            setError(err.message || "Unable to remove item.");
        } finally {
            setUpdatingId(null);
        }
    }

    async function clearCart() {
        try {
            setClearing(true);
            setError("");

            const response = await fetch(`${API_BASE}/cart/clear/`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: "application/json",
                },
            });

            if (!response.ok) {
                const data = await response.json().catch(() => ({}));

                throw new Error(
                    data?.detail || "Unable to clear cart."
                );
            }

            setCartItems([]);
        } catch (err) {
            setError(err.message || "Unable to clear cart.");
        } finally {
            setClearing(false);
        }
    }

    function getFood(item) {
        return (
            item?.food_item ||
            item?.food ||
            item?.item ||
            {}
        );
    }

    function getItemName(item) {
        const food = getFood(item);

        return (
            food?.name ||
            item?.food_item_name ||
            item?.name ||
            "Food item"
        );
    }

    function getItemPrice(item) {
        const food = getFood(item);

        return Number(
            food?.price ??
            item?.price ??
            item?.unit_price ??
            0
        );
    }

    function getItemImage(item) {
        const food = getFood(item);

        return (
            food?.image ||
            item?.image ||
            ""
        );
    }

    function getQuantity(item) {
        return Number(item?.quantity || 1);
    }

    const subtotal = cartItems.reduce((total, item) => {
        return total + getItemPrice(item) * getQuantity(item);
    }, 0);

    const deliveryFee = cartItems.length > 0 ? 40 : 0;
    const total = subtotal + deliveryFee;

    if (loading) {
        return (
            <div className="cart-page">
                <div className="cart-loading">
                    <div className="cart-spinner"></div>
                    <p>Loading your cart...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="cart-page">
            <header className="cart-header">
                <div className="cart-header-inner">
                    <button
                        className="cart-back-btn"
                        onClick={() => navigate("/")}
                    >
                        <svg
                            viewBox="0 0 24 24"
                            aria-hidden="true"
                        >
                            <path d="M15 18l-6-6 6-6" />
                        </svg>

                        <span>Continue shopping</span>
                    </button>

                    <div className="cart-brand">
                        <div className="cart-logo">
                            <svg
                                viewBox="0 0 24 24"
                                aria-hidden="true"
                            >
                                <path d="M6 3v7a3 3 0 0 0 6 0V3" />
                                <path d="M9 3v7" />
                                <path d="M12 3v7" />
                                <path d="M9 13v8" />
                                <path d="M18 3v18" />
                                <path d="M18 3c-2.2 1.2-3 3.1-3 5.4 0 2.3 1 4 3 4.8" />
                            </svg>
                        </div>

                        <span>Foodie</span>
                    </div>
                </div>
            </header>

            <main className="cart-main">
                <div className="cart-title-row">
                    <div>
                        <p className="cart-eyebrow">YOUR ORDER</p>
                        <h1>Your cart</h1>
                        <p>
                            Review your items before placing your order.
                        </p>
                    </div>

                    {cartItems.length > 0 && (
                        <button
                            className="clear-cart-btn"
                            onClick={clearCart}
                            disabled={clearing}
                        >
                            {clearing ? "Clearing..." : "Clear cart"}
                        </button>
                    )}
                </div>

                {error && (
                    <div className="cart-error">
                        <span>{error}</span>

                        <button onClick={fetchCart}>
                            Try again
                        </button>
                    </div>
                )}

                {cartItems.length === 0 ? (
                    <section className="empty-cart">
                        <div className="empty-cart-icon">
                            <svg
                                viewBox="0 0 24 24"
                                aria-hidden="true"
                            >
                                <path d="M6 8h12l1 12H5L6 8z" />
                                <path d="M9 8a3 3 0 0 1 6 0" />
                            </svg>
                        </div>

                        <h2>Your cart is empty</h2>

                        <p>
                            Looks like you haven't added anything yet.
                            Explore restaurants and find something delicious.
                        </p>

                        <button
                            className="browse-btn"
                            onClick={() => navigate("/")}
                        >
                            Browse restaurants
                        </button>
                    </section>
                ) : (
                    <div className="cart-layout">
                        <section className="cart-items-section">
                            <div className="cart-section-heading">
                                <h2>Items in your cart</h2>
                                <span>
                                    {cartItems.length}{" "}
                                    {cartItems.length === 1
                                        ? "item"
                                        : "items"}
                                </span>
                            </div>

                            <div className="cart-items">
                                {cartItems.map((item) => {
                                    const foodName = getItemName(item);
                                    const price = getItemPrice(item);
                                    const quantity = getQuantity(item);
                                    const image = getImageUrl(
                                        getItemImage(item)
                                    );

                                    const itemId =
                                        item?.id ||
                                        item?.cart_item_id;

                                    return (
                                        <article
                                            className="cart-item"
                                            key={itemId}
                                        >
                                            <div className="cart-item-image">
                                                {image ? (
                                                    <img
                                                        src={image}
                                                        alt={foodName}
                                                    />
                                                ) : (
                                                    <span>
                                                        {foodName
                                                            .charAt(0)
                                                            .toUpperCase()}
                                                    </span>
                                                )}
                                            </div>

                                            <div className="cart-item-info">
                                                <h3>{foodName}</h3>

                                                <p className="cart-item-price">
                                                    ₹{price.toFixed(2)}
                                                </p>

                                                <button
                                                    className="remove-btn"
                                                    onClick={() =>
                                                        removeItem(itemId)
                                                    }
                                                    disabled={
                                                        updatingId ===
                                                        itemId
                                                    }
                                                >
                                                    Remove
                                                </button>
                                            </div>

                                            <div className="cart-item-actions">
                                                <div className="quantity-control">
                                                    <button
                                                        onClick={() =>
                                                            updateQuantity(
                                                                itemId,
                                                                quantity - 1
                                                            )
                                                        }
                                                        disabled={
                                                            quantity <= 1 ||
                                                            updatingId ===
                                                                itemId
                                                        }
                                                    >
                                                        −
                                                    </button>

                                                    <span>
                                                        {updatingId ===
                                                        itemId
                                                            ? "..."
                                                            : quantity}
                                                    </span>

                                                    <button
                                                        onClick={() =>
                                                            updateQuantity(
                                                                itemId,
                                                                quantity + 1
                                                            )
                                                        }
                                                        disabled={
                                                            updatingId ===
                                                            itemId
                                                        }
                                                    >
                                                        +
                                                    </button>
                                                </div>

                                                <strong>
                                                    ₹
                                                    {(
                                                        price * quantity
                                                    ).toFixed(2)}
                                                </strong>
                                            </div>
                                        </article>
                                    );
                                })}
                            </div>
                        </section>

                        <aside className="order-summary">
                            <h2>Order summary</h2>

                            <div className="summary-row">
                                <span>Subtotal</span>
                                <strong>
                                    ₹{subtotal.toFixed(2)}
                                </strong>
                            </div>

                            <div className="summary-row">
                                <span>Delivery fee</span>
                                <strong>
                                    ₹{deliveryFee.toFixed(2)}
                                </strong>
                            </div>

                            <div className="summary-divider"></div>

                            <div className="summary-total">
                                <span>Total</span>
                                <strong>
                                    ₹{total.toFixed(2)}
                                </strong>
                            </div>

                            <button
                                className="checkout-btn"
                                onClick={() => navigate("/checkout")}
                            >
                                Proceed to checkout
                                <svg
                                    viewBox="0 0 24 24"
                                    aria-hidden="true"
                                >
                                    <path d="M5 12h14" />
                                    <path d="M13 6l6 6-6 6" />
                                </svg>
                            </button>

                            <div className="secure-note">
                                <svg
                                    viewBox="0 0 24 24"
                                    aria-hidden="true"
                                >
                                    <rect
                                        x="5"
                                        y="10"
                                        width="14"
                                        height="10"
                                        rx="2"
                                    />
                                    <path d="M8 10V7a4 4 0 018 0v3" />
                                </svg>

                                <span>
                                    Secure checkout
                                </span>
                            </div>
                        </aside>
                    </div>
                )}
            </main>
        </div>
    );
}

export default Cart;