import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

import { PageHeader } from "@/components/layout/app-shell";
import { ErrorState } from "@/components/shared/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { CommentThread } from "@/features/post/comment-thread";
import { PostCard } from "@/features/post/post-card";
import { toUserMessage } from "@/lib/api/client";
import { postService } from "@/lib/api/services/posts";

export const Route = createFileRoute("/_authenticated/post/$id")({
  head: () => ({
    meta: [
      { title: "Post — Fathom" },
      { name: "description", content: "View a photo, its caption and the conversation around it." },
      { property: "og:title", content: "Post — Fathom" },
      {
        property: "og:description",
        content: "View a photo, its caption and the conversation around it.",
      },
    ],
  }),
  component: PostDetailPage,
});

function PostDetailPage() {
  const { id } = Route.useParams();

  const post = useQuery({ queryKey: ["post", id], queryFn: () => postService.detail(id) });
  const comments = useQuery({
    queryKey: ["post", id, "comments"],
    queryFn: () => postService.comments(id),
  });

  return (
    <>
      <PageHeader title="Post" />
      <div className="mx-auto w-full max-w-xl md:py-6">
        {post.isPending ? (
          <Skeleton className="aspect-square w-full" />
        ) : post.isError || !post.data ? (
          <ErrorState
            description={toUserMessage(post.error, "We couldn't load this post.")}
            onRetry={() => void post.refetch()}
          />
        ) : (
          <>
            <PostCard post={post.data} />
            {comments.isPending ? (
              <div className="space-y-2 p-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : (
              <CommentThread postId={id} comments={comments.data ?? []} />
            )}
          </>
        )}
      </div>
    </>
  );
}
