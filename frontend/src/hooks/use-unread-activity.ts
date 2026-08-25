import { useQuery } from "@tanstack/react-query";

import { activityService } from "@/lib/api/services/activity";

export function useUnreadActivity(enabled: boolean) {
  const { data } = useQuery({
    queryKey: ["activity", "unread-count"],
    queryFn: () => activityService.unreadCount(),
    enabled,
    staleTime: 30_000,
    refetchInterval: 60_000,
    retry: false,
  });

  return data ?? 0;
}
