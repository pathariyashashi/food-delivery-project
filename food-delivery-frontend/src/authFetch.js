/*
|--------------------------------------------------------------------------
| API Base URL
|--------------------------------------------------------------------------
| Local:
|   VITE_API_URL=http://127.0.0.1:8000
|
| Production:
|   VITE_API_URL=https://food-delivery-backend-z8iv.onrender.com
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

    // Old localhost / 127.0.0.1 API URLs
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

    // Relative API URLs such as /api/login/
    if (url.startsWith("/api/")) {
        return `${API_ROOT}${url}`;
    }

    return url;
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

    localStorage.removeItem(
        "access_token"
    );

    localStorage.removeItem(
        "refresh_token"
    );

    localStorage.removeItem(
        "user_email"
    );

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
    | Login / Refresh ko intercept nahi karna
    |--------------------------------------------------------------------------
    */

    const isLoginRequest =
        url.includes("/api/login/");

    const isRefreshRequest =
        url.includes("/api/token/refresh/");


    /*
    |--------------------------------------------------------------------------
    | Existing headers copy
    |--------------------------------------------------------------------------
    */

    const headers = new Headers(
        init.headers || {}
    );


    /*
    |--------------------------------------------------------------------------
    | Access Token automatically attach
    |--------------------------------------------------------------------------
    */

    const accessToken =
        localStorage.getItem("access_token");


    if (
        accessToken &&
        !headers.has("Authorization") &&
        !isLoginRequest &&
        !isRefreshRequest
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
        isRefreshRequest
    ) {

        return response;
    }


    /*
    |--------------------------------------------------------------------------
    | Access Token expired
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
    | Refresh failed
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