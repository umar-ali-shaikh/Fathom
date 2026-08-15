import { useEffect } from "react";
import { useComments } from "../hook/useComments";
import CommentComposer from "./CommentComposer";
import CommentItem from "./CommentItem";

const CommentList = ({ postId, currentUsername, isPostOwner }) => {
  const {
    comments,
    repliesByParent,
    error,
    handleLoad,
    handleLoadReplies,
    handleAddComment,
    handleDeleteComment,
  } = useComments(postId);

  useEffect(() => {
    handleLoad();
  }, [handleLoad]);

  return (
    <div className="comment-list">
      <CommentComposer onSubmit={(body) => handleAddComment(body)} />

      {error && <p className="profile-status profile-status-error">{error}</p>}

      {!error && !comments && <p className="profile-status">Loading comments...</p>}

      {comments && comments.length === 0 && (
        <p className="profile-status">No comments yet. Be the first.</p>
      )}

      {comments && comments.length > 0 && (
        <ul className="comment-thread">
          {comments.map((comment) => (
            <CommentItem
              key={comment._id}
              comment={comment}
              currentUsername={currentUsername}
              isPostOwner={isPostOwner}
              replies={repliesByParent[comment._id]}
              onReply={handleAddComment}
              onDelete={handleDeleteComment}
              onLoadReplies={handleLoadReplies}
            />
          ))}
        </ul>
      )}
    </div>
  );
};

export default CommentList;
