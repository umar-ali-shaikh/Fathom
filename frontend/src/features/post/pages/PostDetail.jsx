import { useEffect } from "react";
import { useParams } from "react-router";
import { useAuth } from "../../auth/hooks/useAuth";
import { usePostDetail } from "../hook/usePostDetail";
import Post from "../components/Post";
import CommentList from "../components/CommentList";
import "../style/post.scss";
import "../style/comments.scss";

const PostDetail = () => {
  const { postId } = useParams();
  const { user } = useAuth();
  const { post, loading, error, handleLoad } = usePostDetail();

  useEffect(() => {
    if (postId) handleLoad(postId);
  }, [postId, handleLoad]);

  if (loading && !post) {
    return (
      <main className="feed-page">
        <p className="feed-status">Loading post...</p>
      </main>
    );
  }

  if (error && !post) {
    return (
      <main className="feed-page">
        <p className="feed-status feed-status-error">{error}</p>
      </main>
    );
  }

  if (!post) return null;

  return (
    <main className="post-detail-page">
      <Post user={post.user} post={post} linkToDetail={false} />
      <CommentList
        postId={post._id}
        currentUsername={user?.username}
        isPostOwner={post.user.username === user?.username}
      />
    </main>
  );
};

export default PostDetail;
