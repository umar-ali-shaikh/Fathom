import { Link } from "react-router";

const ProfileGrid = ({ posts, isLocked, isOwnProfile }) => {
  if (isLocked) {
    return (
      <div className="profile-grid-state">
        <p>Follow this account to see their posts.</p>
      </div>
    );
  }

  if (!posts || posts.length === 0) {
    return (
      <div className="profile-grid-state">
        <p>
          {isOwnProfile
            ? "You haven't shared any posts yet."
            : "No posts yet."}
        </p>
      </div>
    );
  }

  return (
    <div className="profile-grid">
      {posts.map((post) => (
        <Link className="profile-grid-item" key={post._id} to={`/p/${post._id}`}>
          <img src={post.imgUrl} alt="" />
        </Link>
      ))}
    </div>
  );
};

export default ProfileGrid;
