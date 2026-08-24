import { Link } from "react-router";
import { useLikeToggle } from "../hook/useLikeToggle";
import Avatar from "../../shared/components/ui/Avatar";

const Post = ({ user, post, linkToDetail = true }) => {
  const { isLiked, likesCount, isSubmitting, handleToggleLike } = useLikeToggle(post);

  const detailHref = `/p/${post._id}`;

  return (
    <div className="post">
      <div className="user">
        <Link to={`/u/${user.username}`} className="post-avatar-link">
          <Avatar src={user.profileImage} name={user.username} size="md" />
        </Link>
        <Link to={`/u/${user.username}`} className="username-link">
          <p>{user.username}</p>
        </Link>
      </div>
      {linkToDetail ? (
        <Link to={detailHref} className="post-media">
          <img src={post.imgUrl} alt="" />
        </Link>
      ) : (
        <div className="post-media">
          <img src={post.imgUrl} alt="" />
        </div>
      )}
      <div className="icons">
        <div className="left">
          <button
            type="button"
            onClick={handleToggleLike}
            disabled={isSubmitting}
            aria-pressed={isLiked}
            aria-label={isLiked ? "Unlike post" : "Like post"}
          >
            <svg
              className={isLiked ? "like" : ""}
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M12 8.81056L13.6352 6.48845C14.2721 5.58412 15.3179 5 16.5 5C18.433 5 20 6.567 20 8.5C20 11.3788 18.0407 14.1215 15.643 16.3358C14.4877 17.4027 13.3237 18.2603 12.4451 18.8521C12.2861 18.9592 12.1371 19.0571 11.9999 19.1456C11.8627 19.0571 11.7137 18.9592 11.5547 18.8521C10.6761 18.2604 9.51216 17.4028 8.35685 16.3358C5.95926 14.1216 4 11.3788 4 8.5C4 6.567 5.567 5 7.5 5C8.68209 5 9.72794 5.58412 10.3648 6.48845L12 8.81056ZM10.5557 3.92626C9.68172 3.3412 8.63071 3 7.5 3C4.46243 3 2 5.46243 2 8.5C2 16 11.9999 21.4852 11.9999 21.4852C11.9999 21.4852 22 16 22 8.5C22 5.46243 19.5376 3 16.5 3C15.3693 3 14.3183 3.3412 13.4443 3.92626C12.8805 4.3037 12.3903 4.78263 12 5.33692C11.6097 4.78263 11.1195 4.3037 10.5557 3.92626Z"></path>
            </svg>
          </button>
          {linkToDetail ? (
            <Link to={detailHref} aria-label="View comments">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M5.76282 17H20V5H4V18.3851L5.76282 17ZM6.45455 19L2 22.5V4C2 3.44772 2.44772 3 3 3H21C21.5523 3 22 3.44772 22 4V18C22 18.5523 21.5523 19 21 19H6.45455Z"></path>
              </svg>
            </Link>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M5.76282 17H20V5H4V18.3851L5.76282 17ZM6.45455 19L2 22.5V4C2 3.44772 2.44772 3 3 3H21C21.5523 3 22 3.44772 22 4V18C22 18.5523 21.5523 19 21 19H6.45455Z"></path>
            </svg>
          )}
          <button type="button">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M13 14H11C7.54202 14 4.53953 15.9502 3.03239 18.8107C3.01093 18.5433 3 18.2729 3 18C3 12.4772 7.47715 8 13 8V2.5L23.5 11L13 19.5V14ZM11 12H15V15.3078L20.3214 11L15 6.69224V10H13C10.5795 10 8.41011 11.0749 6.94312 12.7735C8.20873 12.2714 9.58041 12 11 12Z"></path>
            </svg>
          </button>
        </div>
        <div className="right">
          <button type="button">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M5 2H19C19.5523 2 20 2.44772 20 3V22.1433C20 22.4194 19.7761 22.6434 19.5 22.6434C19.4061 22.6434 19.314 22.6168 19.2344 22.5669L12 18.0313L4.76559 22.5669C4.53163 22.7136 4.22306 22.6429 4.07637 22.4089C4.02647 22.3293 4 22.2373 4 22.1433V3C4 2.44772 4.44772 2 5 2ZM18 4H6V19.4324L12 15.6707L18 19.4324V4Z"></path>
            </svg>
          </button>
        </div>
      </div>
      <div className="bottom">
        <p className="likes-count">{likesCount} {likesCount === 1 ? "like" : "likes"}</p>
        <p className="caption">{post.caption}</p>
        {linkToDetail && post.commentsCount > 0 && (
          <Link to={detailHref} className="view-comments-link">
            View {post.commentsCount === 1 ? "1 comment" : `all ${post.commentsCount} comments`}
          </Link>
        )}
      </div>
    </div>
  );
};

export default Post;
