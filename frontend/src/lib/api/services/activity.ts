import { api } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import { normalizeList } from "@/lib/api/services/posts";
import type { ActivityItem } from "@/lib/api/types";

export const activityService = {
  list: async () =>
    normalizeList<ActivityItem>(await api.get<unknown>(ENDPOINTS.activity.list)).items,

  unreadCount: async () => {
    const result = await api.get<{ count?: number } | number>(ENDPOINTS.activity.unreadCount);
    return typeof result === "number" ? result : (result?.count ?? 0);
  },

  markAllRead: () => api.post<void>(ENDPOINTS.activity.markRead),
};
