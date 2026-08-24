import { useEffect } from "react";
import { useParams } from "react-router";
import { useAuth } from "../../auth/hooks/useAuth";
import { useProfile } from "../hook/useProfile";
import ProfileHeader from "../components/ProfileHeader";
import ProfileHeaderSkeleton from "../components/ProfileHeaderSkeleton";
import ProfileGrid from "../components/ProfileGrid";
import "../style/profile.scss";

const Profile = () => {
  const { username: routeUsername } = useParams();
  const { user } = useAuth();
  const username = routeUsername || user?.username;

  const { profile, posts, loading, error, followPending, handleLoadProfile, handleFollowToggle } =
    useProfile();

  useEffect(() => {
    if (username) handleLoadProfile(username);
  }, [username, handleLoadProfile]);

  if (loading && !profile) {
    return (
      <main className="profile-page">
        <ProfileHeaderSkeleton />
      </main>
    );
  }

  if (error && !profile) {
    return (
      <main className="profile-page">
        <p className="profile-status profile-status-error">{error}</p>
      </main>
    );
  }

  if (!profile) return null;

  return (
    <main className="profile-page">
      <ProfileHeader
        profile={profile}
        onFollowToggle={handleFollowToggle}
        followPending={followPending}
      />
      {error && <p className="profile-status profile-status-error">{error}</p>}
      <ProfileGrid
        posts={posts}
        isLocked={profile.isLocked}
        isOwnProfile={profile.isOwnProfile}
      />
    </main>
  );
};

export default Profile;
