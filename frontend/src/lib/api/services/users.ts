import { api } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import { normalizeList } from "@/lib/api/services/posts";
import type { FollowRequest, Post, User } from "@/lib/api/types";

export const userService = {
  profile: (username: string) => api.get<User>(ENDPOINTS.users.detail(username)),

  posts: async (username: string, cursor?: string) =>
    normalizeList<Post>(
      await api.get<unknown>(ENDPOINTS.users.posts(username), {
        query: { cursor: cursor ?? undefined },
      }),
    ),

  updateMe: async (input: { name?: string; username?: string; bio?: string; avatarUrl?: string }) =>
    (await api.patch<{ user: User }>(ENDPOINTS.users.me, input)).user,

  followers: async (username: string) =>
    normalizeList<User>(await api.get<unknown>(ENDPOINTS.users.followers(username))).items,

  following: async (username: string) =>
    normalizeList<User>(await api.get<unknown>(ENDPOINTS.users.following(username))).items,

  follow: (username: string) =>
    api.post<{ status?: "following" | "requested" }>(ENDPOINTS.users.follow(username)),

  unfollow: (username: string) => api.delete<void>(ENDPOINTS.users.follow(username)),

  search: async (query: string, signal?: AbortSignal) =>
    normalizeList<User>(
      await api.get<unknown>(ENDPOINTS.users.search, {
        query: { q: query },
        ...(signal ? { signal } : {}),
      }),
    ).items,

  followRequests: async () =>
    normalizeList<FollowRequest>(await api.get<unknown>(ENDPOINTS.follows.requests)).items,

  acceptFollowRequest: (id: string) => api.post<void>(ENDPOINTS.follows.accept(id)),

  rejectFollowRequest: (id: string) => api.post<void>(ENDPOINTS.follows.reject(id)),
};
