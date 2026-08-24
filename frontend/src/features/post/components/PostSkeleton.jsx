import Skeleton from "../../shared/components/ui/Skeleton";

const PostSkeleton = () => (
  <div className="post post-skeleton">
    <div className="user">
      <Skeleton variant="avatar" />
      <Skeleton variant="text" style={{ width: "6rem" }} />
    </div>
    <Skeleton variant="block" />
    <Skeleton variant="text" style={{ width: "4rem" }} />
    <Skeleton variant="text" style={{ width: "80%" }} />
  </div>
);

export default PostSkeleton;
