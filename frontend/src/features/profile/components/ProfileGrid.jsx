import { Link } from "react-router";
import EmptyState from "../../shared/components/ui/EmptyState";

const ProfileGrid = ({ posts, isLocked, isOwnProfile }) => {
  if (isLocked) {
    return <EmptyState title="This account is private" description="Follow this account to see their posts." />;
  }

  if (!posts || posts.length === 0) {
    return (
      <EmptyState
        title="No posts yet"
        description={isOwnProfile ? "You haven't shared any posts yet." : "This account hasn't posted yet."}
      />
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
