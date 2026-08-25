import { api } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import { normalizeList } from "@/lib/api/services/posts";
import type { Story, StoryGroup } from "@/lib/api/types";

/** Groups a flat story list by author so the rail can show one ring per person. */
function groupStories(stories: Story[]): StoryGroup[] {
  const groups = new Map<string, StoryGroup>();
  for (const story of stories) {
    const key = story.author?.id ?? story.author?.username ?? story.id;
    const existing = groups.get(key);
    if (existing) {
      existing.stories.push(story);
      existing.hasUnseen = existing.hasUnseen || !story.seen;
    } else {
      groups.set(key, {
        user: story.author,
        stories: [story],
        hasUnseen: !story.seen,
      });
    }
  }
  return [...groups.values()];
}

export const storyService = {
  /** Stories from the people the viewer follows (plus their own). */
  tray: async () => {
    const payload = await api.get<unknown>(ENDPOINTS.stories.tray);
    const record = (payload ?? {}) as Record<string, unknown>;
    if (Array.isArray(record["groups"])) return record["groups"] as StoryGroup[];
    return groupStories(normalizeList<Story>(payload).items);
  },

  create: async (input: { mediaUrl: string; caption?: string }) =>
    (await api.post<{ story: Story }>(ENDPOINTS.stories.create, input)).story,

  markSeen: (id: string) => api.post<void>(ENDPOINTS.stories.seen(id)),

  remove: (id: string) => api.delete<void>(ENDPOINTS.stories.detail(id)),
};

export { groupStories };
