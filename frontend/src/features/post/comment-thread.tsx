import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { Loader2, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { UserAvatar } from "@/components/shared/user-avatar";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toUserMessage } from "@/lib/api/client";
import { postService } from "@/lib/api/services/posts";
import { relativeTime } from "@/lib/utils/format";
import { useAuth } from "@/providers/auth-provider";
import type { Comment } from "@/lib/api/types";

/** Builds a two-level thread (comment -> replies) from a flat or nested list. */
function buildThread(comments: Comment[]): Comment[] {
  if (comments.some((comment) => comment.replies?.length)) return comments;
  const roots: Comment[] = [];
  const byId = new Map<string, Comment>();
  comments.forEach((comment) => byId.set(comment.id, { ...comment, replies: [] }));
  byId.forEach((comment) => {
    const parent = comment.parentId ? byId.get(comment.parentId) : undefined;
    if (parent) parent.replies?.push(comment);
    else roots.push(comment);
  });
  return roots;
}

function CommentRow({
  comment,
  postId,
  depth = 0,
  onReply,
}: {
  comment: Comment;
  postId: string;
  depth?: number;
  onReply: (comment: Comment) => void;
}) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const remove = useMutation({
    mutationFn: () => postService.deleteComment(comment.id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["post", postId, "comments"] });
    },
    onError: (error) => toast.error(toUserMessage(error, "Couldn't delete that comment.")),
  });

  if (comment.deleted || comment.body === null) {
    return (
      <li className={depth ? "pl-11" : undefined}>
        <p className="py-2 text-sm italic text-muted-foreground">This comment was deleted.</p>
        {comment.replies?.map((reply) => (
          <CommentRow key={reply.id} comment={reply} postId={postId} depth={1} onReply={onReply} />
        ))}
      </li>
    );
  }

  const isOwn = user?.id && comment.author?.id === user.id;

  return (
    <li className={depth ? "pl-11" : undefined}>
      <div className="flex gap-3 py-2">
        <Link to="/u/$username" params={{ username: comment.author?.username ?? "" }}>
          <UserAvatar user={comment.author} size="xs" />
        </Link>
        <div className="min-w-0 flex-1">
          <p className="text-sm leading-relaxed">
            <Link
              to="/u/$username"
              params={{ username: comment.author?.username ?? "" }}
              className="mr-2 font-semibold hover:underline"
            >
              {comment.author?.username}
            </Link>
            {comment.body}
          </p>
          <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
            <span>{relativeTime(comment.createdAt)}</span>
            {depth === 0 ? (
              <button
                type="button"
                className="font-medium hover:text-foreground"
                onClick={() => onReply(comment)}
              >
                Reply
              </button>
            ) : null}
            {isOwn ? (
              <button
                type="button"
                className="inline-flex items-center gap-1 font-medium hover:text-destructive"
                onClick={() => remove.mutate()}
                disabled={remove.isPending}
                aria-label="Delete comment"
              >
                <Trash2 className="size-3" aria-hidden /> Delete
              </button>
            ) : null}
          </div>
        </div>
      </div>
      {comment.replies?.length ? (
        <ul className="space-y-0">
          {comment.replies.map((reply) => (
            <CommentRow
              key={reply.id}
              comment={reply}
              postId={postId}
              depth={1}
              onReply={onReply}
            />
          ))}
        </ul>
      ) : null}
    </li>
  );
}

export function CommentThread({ postId, comments }: { postId: string; comments: Comment[] }) {
  const queryClient = useQueryClient();
  const [body, setBody] = useState("");
  const [replyTo, setReplyTo] = useState<Comment | null>(null);
  const thread = useMemo(() => buildThread(comments), [comments]);

  const add = useMutation({
    mutationFn: () =>
      postService.addComment(postId, { body: body.trim(), parentId: replyTo?.id ?? null }),
    onSuccess: () => {
      setBody("");
      setReplyTo(null);
      void queryClient.invalidateQueries({ queryKey: ["post", postId] });
    },
    onError: (error) => toast.error(toUserMessage(error, "Couldn't post your comment.")),
  });

  return (
    <section aria-label="Comments" className="px-4 pb-28 md:pb-6">
      {thread.length === 0 ? (
        <EmptyState title="No comments yet" description="Be the first to add one." />
      ) : (
        <ul className="divide-y divide-border/60">
          {thread.map((comment) => (
            <CommentRow key={comment.id} comment={comment} postId={postId} onReply={setReplyTo} />
          ))}
        </ul>
      )}

      <form
        className="fixed inset-x-0 bottom-14 z-20 border-t border-border bg-background p-3 md:static md:mt-4 md:border-0 md:p-0"
        onSubmit={(event) => {
          event.preventDefault();
          if (body.trim()) add.mutate();
        }}
      >
        {replyTo ? (
          <p className="mb-2 flex items-center gap-2 text-xs text-muted-foreground">
            Replying to @{replyTo.author?.username}
            <button
              type="button"
              className="font-medium underline"
              onClick={() => setReplyTo(null)}
            >
              cancel
            </button>
          </p>
        ) : null}
        <div className="flex items-end gap-2">
          <label htmlFor="comment-body" className="sr-only">
            Add a comment
          </label>
          <Textarea
            id="comment-body"
            value={body}
            onChange={(event) => setBody(event.target.value)}
            placeholder="Add a comment…"
            rows={1}
            className="min-h-11 resize-none rounded-2xl"
          />
          <Button type="submit" disabled={!body.trim() || add.isPending} className="rounded-full">
            {add.isPending ? <Loader2 className="size-4 animate-spin" aria-hidden /> : "Post"}
          </Button>
        </div>
      </form>
    </section>
  );
}
