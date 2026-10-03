import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Home.css";

const API_BASE = "http://127.0.0.1:8000/api";

const Icons = {
    logo: (
        <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M6 3v7a3 3 0 0 0 6 0V3" />
            <path d="M9 3v7" />
            <path d="M12 3v7" />
            <path d="M9 13v8" />
            <path d="M18 3v18" />
            <path d="M18 3c-2.2 1.2-3 3.1-3 5.4 0 2.3 1 4 3 4.8" />
        </svg>
    ),

    search: (
        <svg viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-4-4" />
        </svg>
    ),

    location: (
        <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" />
            <circle cx="12" cy="10" r="2.5" />
        </svg>
    ),

    cart: (
        <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M3 4h2l2.1 10.1a2 2 0 0 0 2 1.6h7.8a2 2 0 0 0 2-1.6L21 7H6" />
            <circle cx="10" cy="20" r="1" />
            <circle cx="18" cy="20" r="1" />
        </svg>
    ),

    clock: (
        <svg viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="12" cy="12" r="9" />
            <path d="M12 7v5l3 2" />
        </svg>
    ),

    arrow: (
        <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M5 12h14" />
            <path d="m13 6 6 6-6 6" />
        </svg>
    ),

    filter: (
        <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M4 6h16" />
            <path d="M7 12h10" />
            <path d="M10 18h4" />
        </svg>
    ),

    logout: (
        <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M10 17l5-5-5-5" />
            <path d="M15 12H3" />
            <path d="M14 4h5v16h-5" />
        </svg>
    ),

    moon: (
        <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M20.5 14.7A8.5 8.5 0 0 1 9.3 3.5 8.5 8.5 0 1 0 20.5 14.7Z" />
        </svg>
    ),

    sun: (
        <svg viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
        </svg>
    ),

    plus: (
        <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 5v14M5 12h14" />
        </svg>
    ),

    star: (
        <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9L12 3Z" />
        </svg>
    ),
};

function getList(data) {
    if (Array.isArray(data)) return data;

    if (Array.isArray(data?.results)) {
        return data.results;
    }

    return [];
}

function getImageUrl(image) {
    if (!image) return "";

    if (image.startsWith("http")) {
        return image;
    }

    return `http://127.0.0.1:8000${image}`;
}

function getCategoryName(food) {
    if (typeof food.category === "string") {
        return food.category;
    }

    if (food.category?.name) {
        return food.category.name;
    }

    return "Popular";
}

function getCartItems(data) {
    if (Array.isArray(data)) {
        return data;
    }

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

function getCartCount(data) {
    const items = getCartItems(data);

    return items.reduce(
        (total, item) =>
            total + Number(item?.quantity || 1),
        0
    );
}

function Home() {
    const navigate = useNavigate();

    const [restaurants, setRestaurants] = useState([]);
    const [foodItems, setFoodItems] = useState([]);
    const [allFoodItems, setAllFoodItems] = useState([]);

    const [search, setSearch] = useState("");
    const [activeCategory, setActiveCategory] = useState("All");
    const [restaurantFilter, setRestaurantFilter] = useState("all");
    const [foodTypeFilter, setFoodTypeFilter] = useState("all");
    const [minPrice, setMinPrice] = useState("");
    const [maxPrice, setMaxPrice] = useState("");

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [cartCount, setCartCount] = useState(0);
    const [addingItemId, setAddingItemId] = useState(null);
    const [cartMessage, setCartMessage] = useState("");

    const [darkMode, setDarkMode] = useState(() => {
        return (
            localStorage.getItem("foodie_theme") ===
            "dark"
        );
    });

    const userEmail =
        localStorage.getItem("user_email") ||
        "Customer";

    /* ================================
       INITIAL LOAD
    ================================= */

    useEffect(() => {
        loadHomeData();
        loadCartCount();
    }, []);

    /* ================================
       THEME
    ================================= */

    useEffect(() => {
        localStorage.setItem(
            "foodie_theme",
            darkMode ? "dark" : "light"
        );
    }, [darkMode]);

    /* ================================
       CART MESSAGE AUTO HIDE
    ================================= */

    useEffect(() => {
        if (!cartMessage) {
            return;
        }

        const timer = setTimeout(() => {
            setCartMessage("");
        }, 3000);

        return () => clearTimeout(timer);
    }, [cartMessage]);

    /* ================================
       LOAD HOME DATA
    ================================= */

    const loadFoodItems = async (overrides = {}) => {
        try {
            setLoading(true);
            setError("");

            const category =
                overrides.category ?? activeCategory;
            const restaurant =
                overrides.restaurant ?? restaurantFilter;
            const foodType =
                overrides.foodType ?? foodTypeFilter;
            const min =
                overrides.minPrice ?? minPrice;
            const max =
                overrides.maxPrice ?? maxPrice;

            const params = new URLSearchParams();

            if (restaurant && restaurant !== "all") {
                params.set("restaurant", restaurant);
            }

            if (category && category !== "All") {
                params.set("category", category);
            }

            if (foodType === "veg") {
                params.set("is_veg", "true");
            } else if (foodType === "nonveg") {
                params.set("is_veg", "false");
            }

            if (min !== "" && min !== null && min !== undefined) {
                params.set("min_price", min);
            }

            if (max !== "" && max !== null && max !== undefined) {
                params.set("max_price", max);
            }

            const query = params.toString();
            const url = query
                ? `${API_BASE}/food-items/?${query}`
                : `${API_BASE}/food-items/`;

            const response = await fetch(url);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data?.detail ||
                    "Unable to load food items."
                );
            }

            setFoodItems(getList(data));
        } catch (err) {
            console.error("FOOD FILTER API ERROR:", err);
            setError(
                "We couldn't load the food data. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    const loadHomeData = async () => {
        try {
            setLoading(true);
            setError("");

            const [restaurantsResponse, foodResponse] =
                await Promise.all([
                    fetch(`${API_BASE}/restaurants/`),
                    fetch(`${API_BASE}/food-items/`),
                ]);

            const restaurantData =
                await restaurantsResponse.json();
            const foodData =
                await foodResponse.json();

            if (!restaurantsResponse.ok) {
                throw new Error(
                    "Unable to load restaurants."
                );
            }

            if (!foodResponse.ok) {
                throw new Error(
                    "Unable to load food items."
                );
            }

            const restaurantList =
                getList(restaurantData);
            const foodList = getList(foodData);

            setRestaurants(restaurantList);
            setAllFoodItems(foodList);
            setFoodItems(foodList);
        } catch (err) {
            console.error(
                "HOME API ERROR:",
                err
            );

            setError(
                "We couldn't load the food data. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    const applyFilters = async () => {
        await loadFoodItems();
        scrollToFood();
    };

    const clearFilters = async () => {
        setActiveCategory("All");
        setRestaurantFilter("all");
        setFoodTypeFilter("all");
        setMinPrice("");
        setMaxPrice("");
        setSearch("");

        await loadFoodItems({
            category: "All",
            restaurant: "all",
            foodType: "all",
            minPrice: "",
            maxPrice: "",
        });
    };

    /* ================================
       LOAD CART COUNT
    ================================= */

    const loadCartCount = async () => {
        const token =
            localStorage.getItem(
                "access_token"
            );

        if (!token) {
            setCartCount(0);
            return;
        }

        try {
            const response = await fetch(
                `${API_BASE}/cart/`,
                {
                    method: "GET",

                    headers: {
                        Authorization:
                            `Bearer ${token}`,

                        Accept:
                            "application/json",
                    },
                }
            );

            if (response.status === 401) {
                setCartCount(0);
                return;
            }

            const data =
                await response.json();

            if (!response.ok) {
                console.error(
                    "CART LOAD ERROR:",
                    data
                );

                return;
            }

            setCartCount(
                getCartCount(data)
            );
        } catch (err) {
            console.error(
                "CART COUNT ERROR:",
                err
            );
        }
    };

    /* ================================
       ADD TO CART
    ================================= */

    const addToCart = async (
        foodItemId
    ) => {
        const token =
            localStorage.getItem(
                "access_token"
            );

        if (!token) {
            navigate("/login");
            return;
        }

        try {
            setAddingItemId(
                foodItemId
            );

            setCartMessage("");

            const response =
                await fetch(
                    `${API_BASE}/cart/add/`,
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json",

                            Authorization:
                                `Bearer ${token}`,

                            Accept:
                                "application/json",
                        },

                        body: JSON.stringify({
                            food_item:
                                foodItemId,

                            quantity: 1,
                        }),
                    }
                );

            const data =
                await response
                    .json()
                    .catch(
                        () => ({})
                    );

            if (!response.ok) {
                console.error(
                    "ADD TO CART ERROR:",
                    data
                );

                setCartMessage(
                    data?.detail ||
                    data?.message ||
                    "Unable to add item to cart."
                );

                return;
            }

            setCartMessage(
                "Added to cart"
            );

            await loadCartCount();
        } catch (err) {
            console.error(
                "ADD TO CART ERROR:",
                err
            );

            setCartMessage(
                "Something went wrong. Please try again."
            );
        } finally {
            setAddingItemId(null);
        }
    };

    /* ================================
       CATEGORIES
    ================================= */

    const categories = useMemo(() => {
        const unique = [];

        allFoodItems.forEach((food) => {
            const category =
                getCategoryName(food);

            if (
                category &&
                category !== "Popular" &&
                !unique.includes(category)
            ) {
                unique.push(category);
            }
        });

        return [
            "All",
            ...unique.slice(0, 6),
        ];
    }, [allFoodItems]);

    /* ================================
       FILTER FOOD
    ================================= */

    const filteredFood = useMemo(() => {
        const query =
            search
                .trim()
                .toLowerCase();

        if (!query) {
            return foodItems;
        }

        return foodItems.filter((food) => {
            const foodName =
                food.name?.toLowerCase() || "";

            const description =
                food.description?.toLowerCase() || "";

            const category =
                getCategoryName(food).toLowerCase();

            return (
                foodName.includes(query) ||
                description.includes(query) ||
                category.includes(query)
            );
        });
    }, [foodItems, search]);

    /* ================================
       FILTER RESTAURANTS
    ================================= */

    const filteredRestaurants =
        useMemo(() => {
            const query =
                search
                    .trim()
                    .toLowerCase();

            if (!query) {
                return restaurants;
            }

            return restaurants.filter(
                (restaurant) => {
                    const name =
                        restaurant.name
                            ?.toLowerCase() ||
                        "";

                    const description =
                        restaurant.description
                            ?.toLowerCase() ||
                        "";

                    const address =
                        restaurant.address
                            ?.toLowerCase() ||
                        "";

                    return (
                        name.includes(
                            query
                        ) ||
                        description.includes(
                            query
                        ) ||
                        address.includes(
                            query
                        )
                    );
                }
            );
        }, [
            restaurants,
            search,
        ]);

    /* ================================
       LOGOUT
    ================================= */

    const handleLogout = () => {
        localStorage.removeItem(
            "access_token"
        );

        localStorage.removeItem(
            "refresh_token"
        );

        localStorage.removeItem(
            "user_email"
        );

        navigate("/login");
    };

    /* ================================
       SCROLL
    ================================= */

    const scrollToFood = () => {
        document
            .getElementById(
                "food-section"
            )
            ?.scrollIntoView({
                behavior: "smooth",
                block: "start",
            });
    };

    return (
        <div
            className={`foodie-home ${
                darkMode
                    ? "dark-theme"
                    : "light-theme"
            }`}
        >
            {/* ================================
                CART TOAST
            ================================= */}

            {cartMessage && (
                <div
                    className={`cart-toast ${
                        cartMessage ===
                        "Added to cart"
                            ? "success"
                            : "error"
                    }`}
                >
                    <span>
                        {cartMessage}
                    </span>

                    {cartMessage ===
                        "Added to cart" && (
                        <button
                            onClick={() =>
                                navigate(
                                    "/cart"
                                )
                            }
                        >
                            View cart
                        </button>
                    )}
                </div>
            )}

            {/* ================================
                NAVBAR
            ================================= */}

            <header className="home-navbar">
                <div className="navbar-inner">
                    <button
                        className="brand"
                        onClick={() =>
                            window.scrollTo({
                                top: 0,
                                behavior:
                                    "smooth",
                            })
                        }
                    >
                        <div className="brand-mark">
                            {Icons.logo}
                        </div>

                        <span>
                            foodie
                        </span>
                    </button>

                    <div className="delivery-location">
                        <div className="location-icon">
                            {
                                Icons.location
                            }
                        </div>

                        <div>
                            <small>
                                DELIVERING TO
                            </small>

                            <strong>
                                Your location
                            </strong>
                        </div>
                    </div>

                    <div className="navbar-right">

    {/* Theme Toggle */}
    <button
        className="theme-toggle"
        onClick={() =>
            setDarkMode((value) => !value)
        }
        title={
            darkMode
                ? "Switch to light mode"
                : "Switch to dark mode"
        }
        aria-label="Toggle theme"
    >
        {darkMode ? Icons.sun : Icons.moon}
    </button>

    {/* My Orders */}
    <button
        className="nav-orders"
        onClick={() => navigate("/orders")}
        title="My Orders"
    >
        <span className="nav-orders-icon">
            
        </span>

        <span>
            My Orders
        </span>
    </button>

    {/* Cart */}
    <button
        className="nav-cart"
        onClick={() => navigate("/cart")}
        title="Shopping Cart"
    >
        <span className="nav-cart-icon">
            {Icons.cart}

            {cartCount > 0 && (
                <span className="cart-count">
                    {cartCount > 99
                        ? "99+"
                        : cartCount}
                </span>
            )}
        </span>

        <span>
            Cart
        </span>
    </button>

    {/* User */}
    <div className="user-menu">

        <div className="user-avatar">
            {userEmail
                .charAt(0)
                .toUpperCase()}
        </div>

        <div className="user-details">
            <strong>
                {userEmail}
            </strong>

            <span>
                Customer
            </span>
        </div>

        <button
            className="logout-btn"
            onClick={handleLogout}
            title="Logout"
        >
            {Icons.logout}
        </button>

    </div>

</div>
                </div>
            </header>

            {/* ================================
                HERO
            ================================= */}

            <section className="hero">
                <div className="hero-inner">
                    <div className="hero-copy">
                        <span className="hero-eyebrow">
                            FRESH FOOD • FAST
                            DELIVERY
                        </span>

                        <h1>
                            Your favorite food,
                            <br />

                            <span>
                                delivered fresh.
                            </span>
                        </h1>

                        <p>
                            Discover the best
                            restaurants around
                            you and order
                            delicious meals in
                            just a few clicks.
                        </p>

                        <div className="hero-search">
                            <span className="search-icon">
                                {
                                    Icons.search
                                }
                            </span>

                            <input
                                type="text"
                                value={search}
                                onChange={(e) =>
                                    setSearch(
                                        e.target
                                            .value
                                    )
                                }
                                placeholder="Search restaurants or dishes"
                            />

                            <button
                                onClick={
                                    scrollToFood
                                }
                            >
                                Search
                            </button>
                        </div>

                        <div className="hero-trust">
                            <div>
                                <strong>
                                    Fast
                                </strong>

                                <span>
                                    delivery
                                </span>
                            </div>

                            <div>
                                <strong>
                                    Fresh
                                </strong>

                                <span>
                                    ingredients
                                </span>
                            </div>

                            <div>
                                <strong>
                                    Easy
                                </strong>

                                <span>
                                    ordering
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="hero-visual">
                        <div className="hero-image-card">
                            <div className="food-image-placeholder">
                                <div className="plate">
                                    <div className="plate-food">
                                        <span></span>
                                        <span></span>
                                        <span></span>
                                        <span></span>
                                    </div>
                                </div>
                            </div>

                            <div className="hero-floating-card">
                                <div className="mini-avatar">
                                    F
                                </div>

                                <div>
                                    <strong>
                                        Fresh & tasty
                                    </strong>

                                    <span>
                                        Delivered to
                                        your door
                                    </span>
                                </div>

                                <div className="mini-check">
                                    ✓
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ================================
                MAIN
            ================================= */}

            <main className="home-main">
                {/* Categories */}

                <section className="categories-section">
                    <div className="section-header">
                        <div>
                            <span className="section-label">
                                EXPLORE
                            </span>

                            <h2>
                                What are you
                                craving?
                            </h2>

                            <p>
                                Browse popular food
                                categories.
                            </p>
                        </div>
                    </div>

                    <div className="category-list">
                        {categories.map(
                            (category) => (
                                <button
                                    key={
                                        category
                                    }
                                    className={
                                        activeCategory ===
                                        category
                                            ? "category-pill active"
                                            : "category-pill"
                                    }
                                    onClick={async () => {
                                        setActiveCategory(category);
                                        await loadFoodItems({
                                            category,
                                        });
                                        scrollToFood();
                                    }}
                                >
                                    {category}
                                </button>
                            )
                        )}
                    </div>
                </section>

                {/* Restaurants */}

                <section className="restaurants-section">
                    <div className="section-header row">
                        <div>
                            <span className="section-label">
                                NEAR YOU
                            </span>

                            <h2>
                                Popular
                                restaurants
                            </h2>

                            <p>
                                Great food from
                                restaurants you
                                can trust.
                            </p>
                        </div>

                        <button
                            className="section-link"
                            onClick={() =>
                                document
                                    .querySelector(
                                        ".restaurants-section"
                                    )
                                    ?.scrollIntoView(
                                        {
                                            behavior:
                                                "smooth",
                                            block:
                                                "start",
                                        }
                                    )
                            }
                        >
                            View all

                            <span>
                                {
                                    Icons.arrow
                                }
                            </span>
                        </button>
                    </div>

                    {loading ? (
                        <div className="loading-state">
                            <div className="loader"></div>

                            <p>
                                Finding
                                restaurants...
                            </p>
                        </div>
                    ) : filteredRestaurants.length ===
                      0 ? (
                        <div className="empty-state">
                            <div className="empty-icon">
                                {
                                    Icons.search
                                }
                            </div>

                            <h3>
                                No restaurants
                                found
                            </h3>

                            <p>
                                Try another
                                search.
                            </p>
                        </div>
                    ) : (
                        <div className="restaurant-grid">
                            {filteredRestaurants
                                .slice(
                                    0,
                                    6
                                )
                                .map(
                                    (
                                        restaurant
                                    ) => {
                                        const image =
                                            getImageUrl(
                                                restaurant.image
                                            );

                                        return (
                                            <article
                                                className="restaurant-card"
                                                key={
                                                    restaurant.id
                                                }
                                            >
                                                <div className="restaurant-cover">
                                                    {image ? (
                                                        <img
                                                            src={
                                                                image
                                                            }
                                                            alt={
                                                                restaurant.name
                                                            }
                                                        />
                                                    ) : (
                                                        <div className="restaurant-cover-fallback">
                                                            <span>
                                                                {restaurant.name
                                                                    ?.charAt(
                                                                        0
                                                                    )
                                                                    .toUpperCase()}
                                                            </span>
                                                        </div>
                                                    )}

                                                    <div className="rating-badge">
                                                        {
                                                            Icons.star
                                                        }

                                                        <span>
                                                            4.5
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="restaurant-body">
                                                    <h3>
                                                        {
                                                            restaurant.name
                                                        }
                                                    </h3>

                                                    <p>
                                                        {restaurant.description ||
                                                            "Delicious food and great taste."}
                                                    </p>

                                                    <div className="restaurant-info">
                                                        <span>
                                                            {
                                                                Icons.clock
                                                            }

                                                            25–35
                                                            min
                                                        </span>

                                                        <span>
                                                            Free
                                                            delivery
                                                        </span>
                                                    </div>
                                                </div>
                                            </article>
                                        );
                                    }
                                )}
                        </div>
                    )}
                </section>

                {/* Food */}

                <section
                    className="food-section"
                    id="food-section"
                >
                    <div className="section-header row">
                        <div>
                            <span className="section-label">
                                MENU
                            </span>

                            <h2>
                                Your favorite
                                food
                            </h2>

                            <p>
                                Hand-picked dishes
                                for your next
                                meal.
                            </p>
                        </div>

                        <div className="food-filter-actions">
                            <button
                                className="filter-btn"
                                onClick={applyFilters}
                                disabled={loading}
                            >
                                {Icons.filter}
                                Apply Filters
                            </button>

                            <button
                                className="clear-filter-btn"
                                onClick={clearFilters}
                                disabled={loading}
                            >
                                Clear
                            </button>
                        </div>
                    </div>

                    <div className="food-filter-panel">
                        <div className="filter-field">
                            <label htmlFor="restaurant-filter">Restaurant</label>
                            <select
                                id="restaurant-filter"
                                value={restaurantFilter}
                                onChange={(e) =>
                                    setRestaurantFilter(e.target.value)
                                }
                            >
                                <option value="all">All restaurants</option>
                                {restaurants.map((restaurant) => (
                                    <option
                                        key={restaurant.id}
                                        value={restaurant.id}
                                    >
                                        {restaurant.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="filter-field">
                            <label htmlFor="food-type-filter">Food type</label>
                            <select
                                id="food-type-filter"
                                value={foodTypeFilter}
                                onChange={(e) =>
                                    setFoodTypeFilter(e.target.value)
                                }
                            >
                                <option value="all">All</option>
                                <option value="veg">Vegetarian</option>
                                <option value="nonveg">Non-Vegetarian</option>
                            </select>
                        </div>

                        <div className="filter-field">
                            <label htmlFor="min-price">Min price</label>
                            <input
                                id="min-price"
                                type="number"
                                min="0"
                                placeholder="₹ Min"
                                value={minPrice}
                                onChange={(e) =>
                                    setMinPrice(e.target.value)
                                }
                            />
                        </div>

                        <div className="filter-field">
                            <label htmlFor="max-price">Max price</label>
                            <input
                                id="max-price"
                                type="number"
                                min="0"
                                placeholder="₹ Max"
                                value={maxPrice}
                                onChange={(e) =>
                                    setMaxPrice(e.target.value)
                                }
                            />
                        </div>
                    </div>

                    {loading ? (
                        <div className="loading-state">
                            <div className="loader"></div>

                            <p>
                                Loading menu...
                            </p>
                        </div>
                    ) : error ? (
                        <div className="error-state">
                            <h3>
                                Something went
                                wrong
                            </h3>

                            <p>
                                {error}
                            </p>

                            <button
                                onClick={
                                    loadHomeData
                                }
                            >
                                Try again
                            </button>
                        </div>
                    ) : filteredFood.length ===
                      0 ? (
                        <div className="empty-state">
                            <div className="empty-icon">
                                {
                                    Icons.search
                                }
                            </div>

                            <h3>
                                No dishes found
                            </h3>

                            <p>
                                Try changing your
                                search or filters.
                            </p>
                        </div>
                    ) : (
                        <div className="food-grid">
                            {filteredFood.map(
                                (food) => {
                                    const image =
                                        getImageUrl(
                                            food.image
                                        );

                                    return (
                                        <article
                                            className="food-card"
                                            key={
                                                food.id
                                            }
                                        >
                                            <div className="food-card-image">
                                                {image ? (
                                                    <img
                                                        src={
                                                            image
                                                        }
                                                        alt={
                                                            food.name
                                                        }
                                                    />
                                                ) : (
                                                    <div className="food-image-fallback">
                                                        <span>
                                                            {food.name
                                                                ?.charAt(
                                                                    0
                                                                )
                                                                .toUpperCase()}
                                                        </span>
                                                    </div>
                                                )}

                                                {food.is_veg && (
                                                    <span className="veg-tag">
                                                        VEG
                                                    </span>
                                                )}
                                            </div>

                                            <div className="food-card-body">
                                                <div className="food-card-top">
                                                    <div>
                                                        <h3>
                                                            {
                                                                food.name
                                                            }
                                                        </h3>

                                                        <span className="food-category">
                                                            {getCategoryName(
                                                                food
                                                            )}
                                                        </span>
                                                    </div>

                                                    <strong className="food-price">
                                                        ₹
                                                        {
                                                            food.price
                                                        }
                                                    </strong>
                                                </div>

                                                <p>
                                                    {food.description ||
                                                        "Freshly prepared and full of flavor."}
                                                </p>

                                                <button
                                                    className="add-food-btn"
                                                    onClick={() =>
                                                        addToCart(
                                                            food.id
                                                        )
                                                    }
                                                    disabled={
                                                        addingItemId ===
                                                        food.id
                                                    }
                                                >
                                                    <span>
                                                        {
                                                            Icons.plus
                                                        }
                                                    </span>

                                                    {addingItemId ===
                                                    food.id
                                                        ? "Adding..."
                                                        : "Add to cart"}
                                                </button>
                                            </div>
                                        </article>
                                    );
                                }
                            )}
                        </div>
                    )}
                </section>
            </main>

            {/* ================================
                FOOTER
            ================================= */}

            <footer className="home-footer">
                <div className="footer-inner">
                    <div className="footer-brand">
                        <div className="brand-mark">
                            {Icons.logo}
                        </div>

                        <strong>
                            foodie
                        </strong>
                    </div>

                    <p>
                        Good food. Great
                        moments.
                    </p>

                    <span>
                        © 2026 Foodie. ClumpCoder pvt. ltd. All
                        rights reserved.
                    </span>
                </div>
            </footer>
        </div>
    );
}

export default Home;