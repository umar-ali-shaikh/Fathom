import { api } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import { normalizeList } from "@/lib/api/services/posts";
import type { Reel } from "@/lib/api/types";

export const reelService = {
  feed: async (cursor?: string) =>
    normalizeList<Reel>(
      await api.get<unknown>(ENDPOINTS.reels.feed, { query: { cursor: cursor ?? undefined } }),
    ),

  byUser: async (username: string) =>
    normalizeList<Reel>(await api.get<unknown>(ENDPOINTS.reels.byUser(username))).items,

  detail: async (id: string) => (await api.get<{ reel: Reel }>(ENDPOINTS.reels.detail(id))).reel,

  create: async (input: { caption: string; videoUrl: string; thumbnailUrl?: string }) =>
    (await api.post<{ reel: Reel }>(ENDPOINTS.reels.create, input)).reel,

  update: async (id: string, input: { caption: string }) =>
    (await api.patch<{ reel: Reel }>(ENDPOINTS.reels.detail(id), input)).reel,

  remove: (id: string) => api.delete<void>(ENDPOINTS.reels.detail(id)),

  like: (id: string) => api.post<{ likeCount?: number }>(ENDPOINTS.reels.like(id)),

  unlike: (id: string) => api.delete<{ likeCount?: number }>(ENDPOINTS.reels.like(id)),
};
