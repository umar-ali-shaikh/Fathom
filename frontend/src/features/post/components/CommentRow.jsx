import { Link } from "react-router";

const CommentRow = ({ comment, canDelete, onDelete, children }) => {
  return (
    <div className="comment-row">
      <Link to={`/u/${comment.user.username}`} className="comment-avatar">
        <img src={comment.user.profileImage} alt="" />
      </Link>
      <div className="comment-body">
        <p>
          <Link to={`/u/${comment.user.username}`} className="comment-username">
            {comment.user.username}
          </Link>{" "}
          {comment.isDeleted ? (
            <span className="comment-deleted">[deleted]</span>
          ) : (
            comment.body
          )}
        </p>
        <div className="comment-actions">
          {children}
          {canDelete && (
            <button
              type="button"
              className="comment-action comment-action-danger"
              onClick={() => onDelete(comment._id)}
            >
              Delete
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CommentRow;
