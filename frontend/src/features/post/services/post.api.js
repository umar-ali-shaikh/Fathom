import { apiClient } from "../../../lib/apiClient";

export async function getFeed() {
    const response = await apiClient.get("/post/feed");
    return response.data;
}

export async function likePost(postId) {
    const response = await apiClient.post(`/post/like/${postId}`);
    return response.data;
}

export async function unlikePost(postId) {
    const response = await apiClient.delete(`/post/like/${postId}`);
    return response.data;
}

export async function getUserPosts(username) {
    const response = await apiClient.get(`/post/user/${username}`);
    return response.data;
}

export async function getPostDetail(postId) {
    const response = await apiClient.get(`/post/details/${postId}`);
    return response.data;
}
