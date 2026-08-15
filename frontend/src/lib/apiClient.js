import axios from "axios";

const baseURL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

export const apiClient = axios.create({
    baseURL,
    withCredentials: true,
});

let onUnauthorized = null;

export function setUnauthorizedHandler(handler) {
    onUnauthorized = handler;
}

apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401 && onUnauthorized) {
            onUnauthorized();
        }
        return Promise.reject(error);
    }
);
