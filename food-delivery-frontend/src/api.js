const API_BASE = "http://127.0.0.1:8000/api";

export async function refreshAccessToken() {
    const refreshToken = localStorage.getItem("refresh_token");

    if (!refreshToken) {
        return null;
    }

    try {
        const response = await fetch(
            `${API_BASE}/token/refresh/`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
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
            "Token refresh failed:",
            error
        );

        return null;
    }
}


export async function apiFetch(
    endpoint,
    options = {},
    retry = true
) {
    let accessToken =
        localStorage.getItem("access_token");

    const headers = {
        ...(options.headers || {}),
    };

    if (accessToken) {
        headers.Authorization =
            `Bearer ${accessToken}`;
    }

    if (
        options.body &&
        typeof options.body !== "string"
    ) {
        headers["Content-Type"] =
            "application/json";

        options.body =
            JSON.stringify(options.body);
    }

    let response = await fetch(
        `${API_BASE}${endpoint}`,
        {
            ...options,
            headers,
        }
    );

    // Access token expired
    if (
        response.status === 401 &&
        retry
    ) {
        const newAccessToken =
            await refreshAccessToken();

        if (newAccessToken) {
            return apiFetch(
                endpoint,
                options,
                false
            );
        }

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

        return response;
    }

    return response;
}

export { API_BASE };