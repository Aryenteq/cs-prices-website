import Cookies from "js-cookie";

let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

const subscribeTokenRefresh = (cb: (token: string) => void) => {
    refreshSubscribers.push(cb);
};

const onRrefreshed = (token: string) => {
    refreshSubscribers.forEach(cb => cb(token));
    refreshSubscribers = [];
};

export const getRefreshToken = () => {
    return Cookies.get('refresh_token');
};

const getAuthHeader = () => {
    const token = Cookies.get('access_token');
    if (!token) {
        return {} as Record<string, string>;
    }
    return { Authorization: `Bearer ${token}` };
};

export const saveTokens = (accessToken: string, refreshToken: string) => {
    Cookies.set('access_token', accessToken);
    Cookies.set('refresh_token', refreshToken, { expires: 30 });
};

export const authTokensFetch = async (url: string, options: RequestInit): Promise<any> => {
    const response = await fetch(url, {
        ...options,
        headers: {
            ...options.headers,
            ...getAuthHeader(),
        },
    });

    if (response.status === 401) {
        if (!isRefreshing) {
            isRefreshing = true;

            try {
                const refreshResponse = await fetch(`${import.meta.env.VITE_BACKEND_URL}/auth/refresh`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ refreshToken: getRefreshToken() }),
                });

                if (refreshResponse.ok) {
                    const data = await refreshResponse.json();

                    saveTokens(data.accessToken, data.refreshToken);
                    onRrefreshed(data.accessToken);

                    const retryResponse = await fetch(url, {
                        ...options,
                        headers: {
                            ...options.headers,
                            Authorization: `Bearer ${data.accessToken}`,
                        },
                    });

                    isRefreshing = false;
                    return await handleResponse(retryResponse);
                } else {
                    Cookies.remove('access_token');
                    Cookies.remove('refresh_token');

                    setTimeout(() => {
                        window.location.href = '/connect';
                    }, 500);

                    isRefreshing = false;
                    return;
                }
            } catch (error) {
                isRefreshing = false;
                throw new Error("Failed to refresh token.");
            }
        } else {
            // Token is already being refreshed; queue
            return new Promise((resolve, reject) => {
                subscribeTokenRefresh(async (newToken: string) => {
                    try {
                        const retryResponse = await fetch(url, {
                            ...options,
                            headers: {
                                ...options.headers,
                                Authorization: `Bearer ${newToken}`,
                            },
                        });
                        resolve(await handleResponse(retryResponse));
                    } catch (err) {
                        reject(err);
                    }
                });
            });
        }
    }

    return await handleResponse(response);
};

const handleResponse = async (response: Response): Promise<any> => {
    const contentType = response.headers.get("content-type");

    if (!response.ok) {
        if (contentType && contentType.includes("application/json")) {
            const errorResponse = await response.json();
            throw new Error(errorResponse.message || 'Failed to complete request.');
        } else {
            const errorText = await response.text();
            throw new Error(errorText || 'Failed to complete request.');
        }
    }

    if (contentType && contentType.includes("application/json")) {
        return await response.json();
    } else {
        return await response.text();
    }
};