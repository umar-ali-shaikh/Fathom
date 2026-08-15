import { Link } from "react-router";

const FOLLOW_BUTTON_LABEL = {
  accepted: "Following",
  pending: "Requested",
};

const ProfileHeader = ({ profile, onFollowToggle, followPending }) => {
  const {
    username,
    fullName,
    bio,
    profileImage,
    isOwnProfile,
    isPrivate,
    isLocked,
    followStatus,
    postsCount,
    followersCount,
    followingCount,
  } = profile;

  const followLabel = followStatus ? FOLLOW_BUTTON_LABEL[followStatus] : "Follow";
  const followButtonClass = followStatus ? "secondary-button" : "primary-button";

  return (
    <header className="profile-header">
      <div className="avatar-wrapper">
        <img src={profileImage} alt="" />
      </div>

      <div className="profile-header-body">
        <div className="profile-header-top">
          <h1 className="username">{username}</h1>

          {isOwnProfile ? (
            <Link to="/profile/edit" className="button secondary-button">
              Edit Profile
            </Link>
          ) : (
            <button
              type="button"
              className={`button ${followButtonClass}`}
              onClick={onFollowToggle}
              disabled={followPending}
            >
              {followPending ? "..." : followLabel}
            </button>
          )}

          {isOwnProfile && (
            <Link to="/profile/requests" className="button ghost-button">
              Requests
            </Link>
          )}
        </div>

        {fullName && <p className="full-name">{fullName}</p>}
        {bio && <p className="bio">{bio}</p>}

        <div className="stats">
          <span className="stat">
            <strong>{postsCount}</strong> posts
          </span>
          <Link className="stat" to={`/u/${username}/followers`}>
            <strong>{followersCount}</strong> followers
          </Link>
          <Link className="stat" to={`/u/${username}/following`}>
            <strong>{followingCount}</strong> following
          </Link>
        </div>

        {isPrivate && !isOwnProfile && (
          <p className="privacy-note">
            {isLocked
              ? "This account is private. Follow to see their posts."
              : "This account is private."}
          </p>
        )}
      </div>
    </header>
  );
};

export default ProfileHeader;
