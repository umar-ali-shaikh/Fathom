import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";
import { Bell } from "lucide-react";
import { useEffect } from "react";

import { PageHeader } from "@/components/layout/app-shell";
import { EmptyState, ErrorState } from "@/components/shared/empty-state";
import { UserAvatar } from "@/components/shared/user-avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { toUserMessage } from "@/lib/api/client";
import { activityService } from "@/lib/api/services/activity";
import { relativeTime } from "@/lib/utils/format";
import type { ActivityItem } from "@/lib/api/types";

export const Route = createFileRoute("/_authenticated/activity")({
  head: () => ({
    meta: [
      { title: "Activity — Fathom" },
      { name: "description", content: "Likes, comments and new followers on your Fathom posts." },
      { property: "og:title", content: "Activity — Fathom" },
      {
        property: "og:description",
        content: "Likes, comments and new followers on your Fathom posts.",
      },
    ],
  }),
  component: ActivityPage,
});

function describe(item: ActivityItem): string {
  switch (item.type) {
    case "like":
      return "liked your post";
    case "comment":
      return item.commentPreview ? `commented: ${item.commentPreview}` : "commented on your post";
    case "follow":
      return "started following you";
    case "follow_request":
      return "requested to follow you";
    default:
      return "mentioned you";
  }
}

function ActivityPage() {
  const queryClient = useQueryClient();
  const activity = useQuery({ queryKey: ["activity"], queryFn: () => activityService.list() });

  useEffect(() => {
    void activityService.markAllRead().then(() => {
      void queryClient.invalidateQueries({ queryKey: ["activity", "unread"] });
    });
  }, [queryClient]);

  return (
    <>
      <PageHeader title="Activity" />
      <div className="mx-auto w-full max-w-xl p-4">
        {activity.isPending ? (
          <div className="space-y-2">
            {[0, 1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-14 w-full rounded-xl" />
            ))}
          </div>
        ) : activity.isError ? (
          <ErrorState
            description={toUserMessage(activity.error, "We couldn't load your activity.")}
            onRetry={() => void activity.refetch()}
          />
        ) : activity.data?.length ? (
          <ul className="space-y-1">
            {activity.data.map((item) => (
              <li
                key={item.id}
                className="flex items-center gap-3 rounded-xl p-2 hover:bg-secondary"
              >
                <Link to="/u/$username" params={{ username: item.actor?.username ?? "" }}>
                  <UserAvatar user={item.actor} size="sm" />
                </Link>
                <p className="min-w-0 flex-1 text-sm">
                  <Link
                    to="/u/$username"
                    params={{ username: item.actor?.username ?? "" }}
                    className="font-semibold hover:underline"
                  >
                    {item.actor?.username}
                  </Link>{" "}
                  {describe(item)}{" "}
                  <span className="text-muted-foreground">{relativeTime(item.createdAt)}</span>
                </p>
                {item.post?.id ? (
                  <Link to="/post/$id" params={{ id: item.post.id }} aria-label="Open post">
                    <img
                      src={item.post.thumbnailUrl ?? undefined}
                      alt=""
                      className="size-11 rounded-md object-cover"
                      loading="lazy"
                    />
                  </Link>
                ) : null}
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState
            icon={Bell}
            title="No activity yet"
            description="Likes and follows will show up here."
          />
        )}
      </div>
    </>
  );
}
