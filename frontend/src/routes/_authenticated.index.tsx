import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { Compass } from "lucide-react";
import { useEffect, useRef } from "react";

import { PageHeader } from "@/components/layout/app-shell";
import { EmptyState, ErrorState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { PostCard, PostCardSkeleton } from "@/features/post/post-card";
import { StoryRail } from "@/features/story/story-rail";
import { UserAvatar } from "@/components/shared/user-avatar";
import { toUserMessage } from "@/lib/api/client";
import { postService } from "@/lib/api/services/posts";
import { reelService } from "@/lib/api/services/reels";

export const Route = createFileRoute("/_authenticated/")({
  head: () => ({
    meta: [
      { title: "Your feed — Fathom" },
      { name: "description", content: "Photography from the people you follow on Fathom." },
      { property: "og:title", content: "Your feed — Fathom" },
      { property: "og:description", content: "Photography from the people you follow on Fathom." },
    ],
  }),
  component: FeedPage,
});

function ReelsRail() {
  const reels = useQuery({ queryKey: ["reels", "rail"], queryFn: () => reelService.feed() });
  const items = reels.data?.items.slice(0, 10) ?? [];
  if (items.length === 0) return null;

  return (
    <section aria-label="Reels" className="border-b border-border md:mt-6 md:rounded-2xl md:border">
      <div className="flex items-center justify-between px-4 pt-3">
        <h2 className="text-sm font-semibold">Reels</h2>
        <Link to="/reels" className="text-xs font-medium text-primary hover:underline">
          See all
        </Link>
      </div>
      <ul className="flex gap-3 overflow-x-auto px-4 py-3">
        {items.map((reel) => (
          <li key={reel.id} className="w-28 shrink-0">
            <Link to="/reels" className="block">
              <span className="block aspect-[9/16] w-full overflow-hidden rounded-xl bg-secondary">
                {reel.thumbnailUrl ? (
                  <img
                    src={reel.thumbnailUrl}
                    alt={reel.caption || `Reel by ${reel.author?.username}`}
                    loading="lazy"
                    className="size-full object-cover"
                  />
                ) : (
                  <video src={reel.videoUrl} muted className="size-full object-cover" />
                )}
              </span>
              <span className="mt-1.5 flex items-center gap-1.5">
                <UserAvatar user={reel.author} size="xs" />
                <span className="truncate text-xs text-muted-foreground">
                  {reel.author?.username}
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

function FeedPage() {
  const sentinel = useRef<HTMLDivElement | null>(null);
  const navigate = useNavigate();

  const feed = useInfiniteQuery({
    queryKey: ["feed"],
    queryFn: ({ pageParam }) => postService.feed(pageParam as string | undefined),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (last) => last.nextCursor ?? undefined,
  });

  useEffect(() => {
    const node = sentinel.current;
    if (!node) return;
    const observer = new IntersectionObserver((entries) => {
      if (entries[0]?.isIntersecting && feed.hasNextPage && !feed.isFetchingNextPage) {
        void feed.fetchNextPage();
      }
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, [feed]);

  const posts = feed.data?.pages.flatMap((page) => page.items) ?? [];

  return (
    <>
      <PageHeader title="Fathom" />
      <div className="mx-auto w-full max-w-xl md:py-6">
        <StoryRail onCreate={() => void navigate({ to: "/create", search: { tab: "status" } })} />
        <ReelsRail />
        {feed.isPending ? (
          <>
            <PostCardSkeleton />
            <PostCardSkeleton />
          </>
        ) : feed.isError ? (
          <ErrorState
            description={toUserMessage(feed.error, "We couldn't load your feed.")}
            onRetry={() => void feed.refetch()}
          />
        ) : posts.length === 0 ? (
          <EmptyState
            icon={Compass}
            title="Your feed is quiet"
            description="Follow a few people to fill this space with their work."
            action={
              <Button asChild>
                <Link to="/explore">Explore Fathom</Link>
              </Button>
            }
          />
        ) : (
          <>
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
            <div ref={sentinel} className="h-10" aria-hidden />
            {feed.isFetchingNextPage ? <PostCardSkeleton /> : null}
          </>
        )}
      </div>
    </>
  );
}
