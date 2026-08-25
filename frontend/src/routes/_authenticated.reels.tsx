import { useInfiniteQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Clapperboard } from "lucide-react";

import { PageHeader } from "@/components/layout/app-shell";
import { EmptyState, ErrorState } from "@/components/shared/empty-state";
import { ReelCard, ReelCardSkeleton } from "@/features/reel/reel-card";
import { toUserMessage } from "@/lib/api/client";
import { reelService } from "@/lib/api/services/reels";
import { useAuth } from "@/providers/auth-provider";

export const Route = createFileRoute("/_authenticated/reels")({
  head: () => ({
    meta: [
      { title: "Reels — Fathom" },
      { name: "description", content: "Short videos from photographers you follow on Fathom." },
      { property: "og:title", content: "Reels — Fathom" },
      {
        property: "og:description",
        content: "Short videos from photographers you follow on Fathom.",
      },
    ],
  }),
  component: ReelsPage,
});

function ReelsPage() {
  const { user } = useAuth();
  const reels = useInfiniteQuery({
    queryKey: ["reels"],
    queryFn: ({ pageParam }) => reelService.feed(pageParam as string | undefined),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (last) => last.nextCursor ?? undefined,
  });

  const items = reels.data?.pages.flatMap((page) => page.items) ?? [];

  return (
    <>
      <PageHeader title="Reels" />
      <div className="mx-auto w-full max-w-md p-4">
        {reels.isPending ? (
          <ReelCardSkeleton />
        ) : reels.isError ? (
          <ErrorState
            description={toUserMessage(reels.error, "We couldn't load reels.")}
            onRetry={() => void reels.refetch()}
          />
        ) : items.length === 0 ? (
          <EmptyState
            icon={Clapperboard}
            title="No reels yet"
            description="Create the first short video on Fathom."
          />
        ) : (
          items.map((reel) => (
            <ReelCard
              key={reel.id}
              reel={reel}
              isOwner={reel.author?.username === user?.username}
              onChanged={() => void reels.refetch()}
            />
          ))
        )}
      </div>
    </>
  );
}
