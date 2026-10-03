const API_BASE = "http://127.0.0.1:8000/api";

const originalFetch = window.fetch.bind(window);

let refreshPromise = null;


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

    let url;

    if (typeof input === "string") {
        url = input;
    } else {
        url = input?.url || "";
    }


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
        input,
        {
            ...init,
            headers,
        }
    );


    /*
    |--------------------------------------------------------------------------
    | If request is successful
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

    /*
       Agar multiple API requests same time
       401 deti hain to sirf ek refresh request
       jayegi.
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
        input,
        {
            ...init,
            headers: retryHeaders,
        }
    );
};