import { apiClient } from "../../../lib/apiClient";

export async function register(username, email, password) {
    const response = await apiClient.post("/auth/register", {
        username,
        email,
        password,
    });

    return response.data;
}

export async function login(username, password) {
    const response = await apiClient.post("/auth/login", {
        username,
        password,
    });

    return response.data;
}

export async function getMe() {
    const response = await apiClient.get("/auth/get-me");

    return response.data;
}

export async function logout() {
    const response = await apiClient.post("/auth/logout");

    return response.data;
}
