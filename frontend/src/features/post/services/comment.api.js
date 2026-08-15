import { apiClient } from "../../../lib/apiClient";

export async function getComments(postId, parent) {
    const response = await apiClient.get(`/comment/post/${postId}`, {
        params: parent ? { parent } : undefined,
    });
    return response.data;
}

export async function createComment(postId, body, parent) {
    const response = await apiClient.post(`/comment/post/${postId}`, { body, parent });
    return response.data;
}

export async function deleteComment(commentId) {
    const response = await apiClient.delete(`/comment/${commentId}`);
    return response.data;
}
