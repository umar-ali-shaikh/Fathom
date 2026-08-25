import { Link } from "@tanstack/react-router";
import { Heart, MessageCircle, Play } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { OwnerMenu } from "@/features/post/owner-menu";
import { UserAvatar } from "@/components/shared/user-avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { toUserMessage } from "@/lib/api/client";
import { reelService } from "@/lib/api/services/reels";
import { cn } from "@/lib/utils";
import { compactNumber, relativeTime } from "@/lib/utils/format";
import type { Reel } from "@/lib/api/types";

export function ReelCard({
  reel,
  isOwner,
  onChanged,
}: {
  reel: Reel;
  isOwner?: boolean;
  onChanged?: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [liked, setLiked] = useState(reel.likedByMe);
  const [likeCount, setLikeCount] = useState(reel.likeCount ?? 0);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const node = videoRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries[0]?.isIntersecting;
        if (visible) void node.play().catch(() => undefined);
        else node.pause();
      },
      { threshold: 0.6 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  async function toggleLike() {
    const next = !liked;
    setLiked(next);
    setLikeCount((count) => Math.max(0, count + (next ? 1 : -1)));
    try {
      if (next) await reelService.like(reel.id);
      else await reelService.unlike(reel.id);
      onChanged?.();
    } catch (error) {
      setLiked(!next);
      setLikeCount((count) => Math.max(0, count + (next ? -1 : 1)));
      toast.error(toUserMessage(error, "Couldn't update your like."));
    }
  }

  return (
    <article className="relative mb-4 overflow-hidden rounded-2xl border border-border bg-surface">
      <div className="relative bg-secondary">
        <video
          ref={videoRef}
          src={reel.videoUrl}
          poster={reel.thumbnailUrl ?? undefined}
          loop
          muted
          playsInline
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          onClick={() => {
            const node = videoRef.current;
            if (!node) return;
            if (node.paused) void node.play().catch(() => undefined);
            else node.pause();
          }}
          className="aspect-[9/16] max-h-[75vh] w-full bg-black object-cover"
        />
        {!playing ? (
          <span className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <Play className="size-12 text-background/90" aria-hidden />
          </span>
        ) : null}
      </div>

      <header className="flex items-center gap-3 px-4 py-3">
        <Link to="/u/$username" params={{ username: reel.author?.username ?? "" }}>
          <UserAvatar user={reel.author} size="sm" />
        </Link>
        <div className="min-w-0 flex-1">
          <Link
            to="/u/$username"
            params={{ username: reel.author?.username ?? "" }}
            className="block truncate text-sm font-semibold hover:underline"
          >
            {reel.author?.username}
          </Link>
          <p className="text-xs text-muted-foreground">{relativeTime(reel.createdAt)}</p>
        </div>
        {isOwner ? (
          <OwnerMenu
            kind="reel"
            id={reel.id}
            caption={reel.caption ?? ""}
            onChanged={() => onChanged?.()}
          />
        ) : null}
      </header>

      <div className="flex items-center gap-1 px-2 pb-2">
        <button
          type="button"
          onClick={() => void toggleLike()}
          aria-pressed={liked}
          aria-label={liked ? "Unlike reel" : "Like reel"}
          className="flex items-center gap-2 rounded-full px-3 py-2 text-sm hover:bg-secondary"
        >
          <Heart
            className={cn("size-5", liked && "fill-destructive text-destructive")}
            aria-hidden
          />
          {compactNumber(likeCount)}
        </button>
        <span className="flex items-center gap-2 rounded-full px-3 py-2 text-sm text-muted-foreground">
          <MessageCircle className="size-5" aria-hidden />
          {compactNumber(reel.commentCount)}
        </span>
      </div>

      {reel.caption ? <p className="px-4 pb-4 text-sm leading-relaxed">{reel.caption}</p> : null}
    </article>
  );
}

export function ReelCardSkeleton() {
  return <Skeleton className="mb-4 aspect-[9/16] max-h-[75vh] w-full rounded-2xl" />;
}
