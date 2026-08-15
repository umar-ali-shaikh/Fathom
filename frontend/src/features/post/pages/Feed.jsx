import { useEffect } from "react";
import Post from "../components/Post";
import { usePost } from "../hook/usePost";
import "../style/post.scss";

const Feed = () => {
  const { feed, handleGetFeed, loading, error } = usePost();

  useEffect(() => {
    handleGetFeed();
  }, [handleGetFeed]);

  if (loading && !feed) {
    return (
      <main className="feed-page">
        <p className="feed-status">Loading feed...</p>
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
        <p className="feed-status">No posts yet. Follow people to see their posts here.</p>
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
