import { useEffect } from "react";
import { useParams } from "react-router";
import { useFollowList } from "../hook/useFollowList";
import FollowListItem from "../components/FollowListItem";
import "../style/profile.scss";

const FollowList = ({ type }) => {
  const { username } = useParams();
  const { users, error, handleLoad } = useFollowList(type);

  useEffect(() => {
    if (username) handleLoad(username);
  }, [username, handleLoad]);

  return (
    <main className="profile-page">
      <h1 className="follow-list-title">
        {type === "followers" ? "Followers" : "Following"}
      </h1>

      {error && <p className="profile-status profile-status-error">{error}</p>}

      {!error && !users && <p className="profile-status">Loading...</p>}

      {!error && users && users.length === 0 && (
        <p className="profile-status">Nobody here yet.</p>
      )}

      {users && users.length > 0 && (
        <ul className="follow-list">
          {users.map((u) => (
            <FollowListItem key={u._id} user={u} />
          ))}
        </ul>
      )}
    </main>
  );
};

export default FollowList;
