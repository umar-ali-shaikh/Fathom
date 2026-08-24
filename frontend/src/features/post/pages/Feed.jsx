import { useEffect } from "react";
import Post from "../components/Post";
import PostSkeleton from "../components/PostSkeleton";
import { usePost } from "../hook/usePost";
import EmptyState from "../../shared/components/ui/EmptyState";
import "../style/post.scss";

const Feed = () => {
  const { feed, handleGetFeed, loading, error } = usePost();

  useEffect(() => {
    handleGetFeed();
  }, [handleGetFeed]);

  if (loading && !feed) {
    return (
      <main className="feed-page">
        <div className="feed">
          <div className="posts">
            <PostSkeleton />
            <PostSkeleton />
          </div>
        </div>
      </main>
    );
  }

  if (error && !feed) {
    return (
      <main className="feed-page">
        <p className="feed-status feed-status-error">{error}</p>
        <button type="button" className="button primary-button" onClick={handleGetFeed}>
          Retry
        </button>
      </main>
    );
  }

  if (!feed || feed.length === 0) {
    return (
      <main className="feed-page">
        <EmptyState
          title="No posts yet"
          description="Follow people to see their posts here."
        />
      </main>
    );
  }

  return (
    <main className="feed-page">
      <div className="feed">
        <div className="posts">
          {feed.map((post) => {
            return <Post key={post._id} user={post.user} post={post} />;
          })}
        </div>
      </div>
    </main>
  );
};

export default Feed;
