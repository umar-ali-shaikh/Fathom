import { useState } from "react";
import CommentRow from "./CommentRow";
import CommentComposer from "./CommentComposer";

const CommentItem = ({ comment, currentUsername, isPostOwner, replies, onReply, onDelete, onLoadReplies }) => {
  const [showReplyBox, setShowReplyBox] = useState(false);
  const [repliesOpen, setRepliesOpen] = useState(false);

  const canDelete = !comment.isDeleted && (comment.user?.username === currentUsername || isPostOwner);

  function handleToggleReplies() {
    if (!repliesOpen && !replies) {
      onLoadReplies(comment._id);
    }
    setRepliesOpen((open) => !open);
  }

  async function handleReplySubmit(body) {
    await onReply(body, comment._id);
    setShowReplyBox(false);
    if (!repliesOpen) {
      onLoadReplies(comment._id);
      setRepliesOpen(true);
    }
  }

  return (
    <li className="comment-item">
      <CommentRow comment={comment} canDelete={canDelete} onDelete={onDelete}>
        {!comment.isDeleted && (
          <button
            type="button"
            className="comment-action"
            onClick={() => setShowReplyBox((s) => !s)}
          >
            Reply
          </button>
        )}
        {comment.repliesCount > 0 && (
          <button type="button" className="comment-action" onClick={handleToggleReplies}>
            {repliesOpen
              ? "Hide replies"
              : `View ${comment.repliesCount} ${comment.repliesCount === 1 ? "reply" : "replies"}`}
          </button>
        )}
      </CommentRow>

      {showReplyBox && (
        <div className="comment-reply-composer">
          <CommentComposer
            placeholder={`Reply to ${comment.user.username}`}
            onSubmit={handleReplySubmit}
            onCancel={() => setShowReplyBox(false)}
            autoFocus
          />
        </div>
      )}

      {repliesOpen && replies && replies.length > 0 && (
        <ul className="comment-replies">
          {replies.map((reply) => (
            <li className="comment-item comment-reply" key={reply._id}>
              <CommentRow
                comment={reply}
                canDelete={!reply.isDeleted && (reply.user?.username === currentUsername || isPostOwner)}
                onDelete={(replyId) => onDelete(replyId, comment._id)}
              />
            </li>
          ))}
        </ul>
      )}
    </li>
  );
};

export default CommentItem;
