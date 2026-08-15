import { Link } from "react-router";

const FollowListItem = ({ user, children }) => {
  return (
    <li className="follow-list-item">
      <Link to={`/u/${user.username}`} className="follow-list-item-user">
        <img src={user.profileImage} alt="" />
        <span>
          <span className="username">{user.username}</span>
          {user.fullName && <span className="full-name">{user.fullName}</span>}
        </span>
      </Link>
      {children && <div className="follow-list-item-actions">{children}</div>}
    </li>
  );
};

export default FollowListItem;
