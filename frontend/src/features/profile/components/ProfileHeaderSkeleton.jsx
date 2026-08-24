import Skeleton from "../../shared/components/ui/Skeleton";

const ProfileHeaderSkeleton = () => (
  <header className="profile-header">
    <Skeleton variant="avatar" style={{ width: "5rem", height: "5rem" }} />
    <div className="profile-header-body">
      <Skeleton variant="text" style={{ width: "8rem" }} />
      <Skeleton variant="text" style={{ width: "12rem" }} />
      <Skeleton variant="text" style={{ width: "10rem" }} />
    </div>
  </header>
);

export default ProfileHeaderSkeleton;
