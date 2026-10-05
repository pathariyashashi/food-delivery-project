/*
|--------------------------------------------------------------------------
| API Base URL
|--------------------------------------------------------------------------
*/

const API_ROOT =
    import.meta.env.VITE_API_URL ||
    "http://127.0.0.1:8000";

const API_BASE = `${API_ROOT}/api`;

const originalFetch = window.fetch.bind(window);

let refreshPromise = null;


/*
|--------------------------------------------------------------------------
| Convert Local API URL → Production API URL
|--------------------------------------------------------------------------
*/

function getApiUrl(url) {

    if (!url) {
        return url;
    }

    if (
        url.startsWith("http://127.0.0.1:8000") ||
        url.startsWith("http://localhost:8000")
    ) {
        return url
            .replace(
                "http://127.0.0.1:8000",
                API_ROOT
            )
            .replace(
                "http://localhost:8000",
                API_ROOT
            );
    }

    if (url.startsWith("/api/")) {
        return `${API_ROOT}${url}`;
    }

    return url;
}


/*
|--------------------------------------------------------------------------
| Check Public API
|--------------------------------------------------------------------------
| In APIs ko JWT ki zarurat nahi hai.
|--------------------------------------------------------------------------
*/

function isPublicApi(url) {

    const publicEndpoints = [
        "/api/food-items/",
        "/api/categories/",
        "/api/restaurants/",
    ];

    return publicEndpoints.some(
        (endpoint) => url.includes(endpoint)
    );
}


/*
|--------------------------------------------------------------------------
| Refresh Access Token
|--------------------------------------------------------------------------
*/

async function refreshAccessToken() {

    const refreshToken =
        localStorage.getItem("refresh_token");

    if (!refreshToken) {
        return null;
    }

    try {

        const response = await originalFetch(
            `${API_BASE}/token/refresh/`,
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                },

                body: JSON.stringify({
                    refresh: refreshToken,
                }),
            }
        );

        if (!response.ok) {
            return null;
        }

        const data = await response.json();

        if (!data.access) {
            return null;
        }

        localStorage.setItem(
            "access_token",
            data.access
        );

        return data.access;

    } catch (error) {

        console.error(
            "Token refresh error:",
            error
        );

        return null;
    }
}


/*
|--------------------------------------------------------------------------
| Logout
|--------------------------------------------------------------------------
*/

function forceLogout() {

    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user_email");
    localStorage.removeItem("user_role");
    localStorage.removeItem("user_data");

    window.location.href = "/login";
}


/*
|--------------------------------------------------------------------------
| Global Fetch Interceptor
|--------------------------------------------------------------------------
*/

window.fetch = async function (
    input,
    init = {}
) {

    let originalUrl;

    if (typeof input === "string") {
        originalUrl = input;
    } else {
        originalUrl = input?.url || "";
    }


    /*
    |--------------------------------------------------------------------------
    | Convert API URL
    |--------------------------------------------------------------------------
    */

    const url = getApiUrl(originalUrl);


    /*
    |--------------------------------------------------------------------------
    | Special Requests
    |--------------------------------------------------------------------------
    */

    const isLoginRequest =
        url.includes("/api/login/");

    const isRefreshRequest =
        url.includes("/api/token/refresh/");

    const publicApi =
        isPublicApi(url);


    /*
    |--------------------------------------------------------------------------
    | Existing Headers
    |--------------------------------------------------------------------------
    */

    const headers = new Headers(
        init.headers || {}
    );


    /*
    |--------------------------------------------------------------------------
    | Access Token
    |--------------------------------------------------------------------------
    */

    const accessToken =
        localStorage.getItem("access_token");


    /*
    |--------------------------------------------------------------------------
    | Attach JWT only when required
    |--------------------------------------------------------------------------
    */

    if (
        accessToken &&
        !headers.has("Authorization") &&
        !isLoginRequest &&
        !isRefreshRequest &&
        !publicApi
    ) {

        headers.set(
            "Authorization",
            `Bearer ${accessToken}`
        );
    }


    /*
    |--------------------------------------------------------------------------
    | First Request
    |--------------------------------------------------------------------------
    */

    let response = await originalFetch(
        url,
        {
            ...init,
            headers,
        }
    );


    /*
    |--------------------------------------------------------------------------
    | Successful response
    |--------------------------------------------------------------------------
    */

    if (
        response.status !== 401 ||
        isLoginRequest ||
        isRefreshRequest ||
        publicApi
    ) {

        return response;
    }


    /*
    |--------------------------------------------------------------------------
    | Access Token Expired
    |--------------------------------------------------------------------------
    */

    if (!refreshPromise) {

        refreshPromise =
            refreshAccessToken()
                .finally(() => {
                    refreshPromise = null;
                });
    }


    const newAccessToken =
        await refreshPromise;


    /*
    |--------------------------------------------------------------------------
    | Refresh Failed
    |--------------------------------------------------------------------------
    */

    if (!newAccessToken) {

        forceLogout();

        return response;
    }


    /*
    |--------------------------------------------------------------------------
    | Retry Original Request
    |--------------------------------------------------------------------------
    */

    const retryHeaders = new Headers(
        init.headers || {}
    );

    retryHeaders.set(
        "Authorization",
        `Bearer ${newAccessToken}`
    );


    return originalFetch(
        url,
        {
            ...init,
            headers: retryHeaders,
        }
    );
};