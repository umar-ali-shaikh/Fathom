import { Link, Outlet } from "react-router";
import { useAuth } from "../../auth/hooks/useAuth";
import Avatar from "./ui/Avatar";
import TabBar from "./ui/TabBar";
import { HomeIcon, LogoutIcon } from "./ui/icons";
import "../style/layout.scss";

const tabs = (user) => [
  {
    to: "/",
    end: true,
    label: "Home",
    renderIcon: (active) => <HomeIcon active={active} />,
  },
  {
    to: "/profile",
    label: "Profile",
    renderIcon: (active) => (
      <Avatar src={user?.profileImage} name={user?.username} size="sm" ringed={active} />
    ),
  },
];

const Layout = () => {
  const { user, handleLogout } = useAuth();

  return (
    <div className="app-layout">
      <header className="app-header">
        <Link to="/" className="brand">
          Fathom
        </Link>
        <div className="app-header-user">
          <Link to="/profile" className="username-link">
            <Avatar src={user?.profileImage} name={user?.username} size="sm" />
            <span className="username">{user?.username}</span>
          </Link>
          <button
            type="button"
            className="button ghost-button icon-button"
            onClick={handleLogout}
            aria-label="Log out"
          >
            <LogoutIcon />
          </button>
        </div>
      </header>
      <main className="app-main">
        <Outlet />
      </main>
      <TabBar items={tabs(user)} />
    </div>
  );
};

export default Layout;
