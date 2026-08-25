import { api } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import type { Comment, Paginated, Post } from "@/lib/api/types";

function normalizeList<T>(payload: unknown): Paginated<T> {
  if (Array.isArray(payload)) return { items: payload as T[], nextCursor: null };
  const record = (payload ?? {}) as Record<string, unknown>;
  const items = (record["items"] ?? record["data"] ?? record["results"] ?? []) as T[];
  return {
    items: Array.isArray(items) ? items : [],
    nextCursor: (record["nextCursor"] as string | null | undefined) ?? null,
  };
}

export const postService = {
  feed: async (cursor?: string) =>
    normalizeList<Post>(
      await api.get<unknown>(ENDPOINTS.posts.feed, { query: { cursor: cursor ?? undefined } }),
    ),

  explore: async (cursor?: string) =>
    normalizeList<Post>(
      await api.get<unknown>(ENDPOINTS.posts.explore, { query: { cursor: cursor ?? undefined } }),
    ),

  detail: async (id: string) => (await api.get<{ post: Post }>(ENDPOINTS.posts.detail(id))).post,

  create: async (input: { caption: string; imageUrls: string[] }) =>
    (await api.post<{ post: Post }>(ENDPOINTS.posts.create, input)).post,

  update: async (id: string, input: { caption: string }) =>
    (await api.patch<{ post: Post }>(ENDPOINTS.posts.update(id), input)).post,

  remove: (id: string) => api.delete<void>(ENDPOINTS.posts.remove(id)),

  like: (id: string) => api.post<{ likeCount?: number }>(ENDPOINTS.posts.like(id)),

  unlike: (id: string) => api.delete<{ likeCount?: number }>(ENDPOINTS.posts.like(id)),

  comments: async (postId: string) =>
    normalizeList<Comment>(await api.get<unknown>(ENDPOINTS.posts.comments(postId))).items,

  addComment: async (postId: string, input: { body: string; parentId?: string | null }) =>
    (
      await api.post<{ comment: Comment }>(ENDPOINTS.posts.comments(postId), {
        body: input.body,
        parent: input.parentId ?? undefined,
      })
    ).comment,

  deleteComment: (commentId: string) => api.delete<void>(ENDPOINTS.comments.detail(commentId)),
};

export const uploadService = {
  /** Uploads a single file; returns the stored URL from the backend. */
  upload: async (file: File) => {
    const form = new FormData();
    form.append("file", file);
    const result = await api.post<{ url?: string; urls?: string[] }>(
      ENDPOINTS.uploads.create,
      form,
    );
    const url = result?.url ?? result?.urls?.[0];
    if (!url) throw new Error("Upload did not return a file URL");
    return url;
  },
};

export { normalizeList };
