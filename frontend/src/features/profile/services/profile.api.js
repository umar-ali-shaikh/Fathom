import { apiClient } from "../../../lib/apiClient";

export async function getProfile(username) {
    const response = await apiClient.get(`/user/${username}`);
    return response.data;
}

export async function getFollowers(username) {
    const response = await apiClient.get(`/user/${username}/followers`);
    return response.data;
}

export async function getFollowing(username) {
    const response = await apiClient.get(`/user/${username}/following`);
    return response.data;
}

export async function updateProfile(data) {
    const response = await apiClient.patch("/user/me", data);
    return response.data;
}

export async function followUser(userId) {
    const response = await apiClient.post(`/user/follow/${userId}`);
    return response.data;
}

export async function unfollowUser(userId) {
    const response = await apiClient.delete(`/user/follow/${userId}`);
    return response.data;
}

export async function getFollowRequests() {
    const response = await apiClient.get("/user/follow-requests");
    return response.data;
}

export async function acceptFollowRequest(userId) {
    const response = await apiClient.post(`/user/follow-requests/${userId}/accept`);
    return response.data;
}

export async function rejectFollowRequest(userId) {
    const response = await apiClient.post(`/user/follow-requests/${userId}/reject`);
    return response.data;
}
