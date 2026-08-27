import { Link } from "@tanstack/react-router";
import { Heart, MessageCircle, Share2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { OwnerMenu } from "@/features/post/owner-menu";
import { UserAvatar } from "@/components/shared/user-avatar";
import { useAuth } from "@/providers/auth-provider";
import { Skeleton } from "@/components/ui/skeleton";
import { postService } from "@/lib/api/services/posts";
import { toUserMessage } from "@/lib/api/client";
import { compactNumber, relativeTime } from "@/lib/utils/format";
import { cn } from "@/lib/utils";
import type { Post } from "@/lib/api/types";

export function PostImages({ post }: { post: Post }) {
  const [index, setIndex] = useState(0);
  const images = post.images ?? [];
  if (images.length === 0) return null;
  const current = images[Math.min(index, images.length - 1)];

  return (
    <div className="relative overflow-hidden bg-secondary">
      <img
        src={current?.url}
        alt={current?.alt || post.caption || `Post by ${post.author?.username ?? "a member"}`}
        loading="lazy"
        decoding="async"
        className="aspect-square w-full object-cover"
      />
      {images.length > 1 ? (
        <div className="absolute inset-x-0 bottom-3 flex justify-center gap-1.5">
          {images.map((image, i) => (
            <button
              key={image.id ?? image.url}
              type="button"
              aria-label={`Show image ${i + 1} of ${images.length}`}
              aria-current={i === index}
              onClick={() => setIndex(i)}
              className={cn(
                "size-1.5 rounded-full transition-all",
                i === index ? "w-4 bg-background" : "bg-background/60",
              )}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

export function PostCard({ post, onChanged }: { post: Post; onChanged?: () => void }) {
  const [liked, setLiked] = useState(post.likedByMe);
  const [likeCount, setLikeCount] = useState(post.likeCount ?? 0);
  const [pending, setPending] = useState(false);
  const { user } = useAuth();
  const isOwner = Boolean(user && post.author?.username === user.username);

  async function toggleLike() {
    if (pending) return;
    const next = !liked;
    setLiked(next);
    setLikeCount((count) => Math.max(0, count + (next ? 1 : -1)));
    setPending(true);
    try {
      if (next) await postService.like(post.id);
      else await postService.unlike(post.id);
      onChanged?.();
    } catch (error) {
      setLiked(!next);
      setLikeCount((count) => Math.max(0, count + (next ? -1 : 1)));
      toast.error(toUserMessage(error, "Couldn't update your like."));
    } finally {
      setPending(false);
    }
  }

  async function share() {
    const url = `${window.location.origin}/post/${post.id}`;
    try {
      if (navigator.share) await navigator.share({ url, title: "Fathom post" });
      else {
        await navigator.clipboard.writeText(url);
        toast.success("Link copied");
      }
    } catch {
      /* user dismissed the share sheet */
    }
  }

  return (
    <article className="mb-4 border-b border-border bg-surface md:mb-6 md:rounded-2xl md:border md:shadow-[var(--shadow-soft)]">
      <header className="flex items-center gap-3 px-4 py-3">
        <Link to="/u/$username" params={{ username: post.author?.username ?? "" }}>
          <UserAvatar user={post.author} size="sm" />
        </Link>
        <div className="min-w-0">
          <Link
            to="/u/$username"
            params={{ username: post.author?.username ?? "" }}
            className="block truncate text-sm font-semibold hover:underline"
          >
            {post.author?.username}
          </Link>
          <p className="text-xs text-muted-foreground">{relativeTime(post.createdAt)}</p>
        </div>
        {isOwner ? (
          <div className="ml-auto">
            <OwnerMenu
              kind="post"
              id={post.id}
              caption={post.caption ?? ""}
              onChanged={() => onChanged?.()}
            />
          </div>
        ) : null}
      </header>

      <Link to="/post/$id" params={{ id: post.id }} aria-label="Open post">
        <PostImages post={post} />
      </Link>

      <div className="flex items-center gap-1 px-2 py-2">
        <button
          type="button"
          onClick={() => void toggleLike()}
          aria-pressed={liked}
          aria-label={liked ? "Unlike post" : "Like post"}
          className="flex items-center gap-2 rounded-full px-3 py-2 text-sm transition-colors hover:bg-secondary"
        >
          <Heart
            className={cn("size-5", liked && "fill-destructive text-destructive")}
            aria-hidden
          />
          {compactNumber(likeCount)}
        </button>
        <Link
          to="/post/$id"
          params={{ id: post.id }}
          className="flex items-center gap-2 rounded-full px-3 py-2 text-sm transition-colors hover:bg-secondary"
          aria-label="View comments"
        >
          <MessageCircle className="size-5" aria-hidden />
          {compactNumber(post.commentCount)}
        </Link>
        <button
          type="button"
          onClick={() => void share()}
          className="ml-auto rounded-full p-2 transition-colors hover:bg-secondary"
          aria-label="Share post"
        >
          <Share2 className="size-5" aria-hidden />
        </button>
      </div>

      {post.caption ? (
        <p className="px-4 pb-4 text-sm leading-relaxed">
          <Link
            to="/u/$username"
            params={{ username: post.author?.username ?? "" }}
            className="mr-2 font-semibold hover:underline"
          >
            {post.author?.username}
          </Link>
          {post.caption}
        </p>
      ) : null}
    </article>
  );
}

export function PostCardSkeleton() {
  return (
    <div className="mb-4 border-b border-border bg-surface md:mb-6 md:rounded-2xl md:border">
      <div className="flex items-center gap-3 px-4 py-3">
        <Skeleton className="size-9 rounded-full" />
        <div className="space-y-1.5">
          <Skeleton className="h-3 w-28" />
          <Skeleton className="h-2.5 w-16" />
        </div>
      </div>
      <Skeleton className="aspect-square w-full rounded-none" />
      <div className="space-y-2 p-4">
        <Skeleton className="h-3 w-40" />
        <Skeleton className="h-3 w-3/4" />
      </div>
    </div>
  );
}
