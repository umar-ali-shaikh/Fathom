import { createBrowserRouter } from "react-router";
import Login from "./features/auth/pages/Login";
import Register from "./features/auth/pages/Register";
import Feed from "./features/post/pages/Feed";
import PostDetail from "./features/post/pages/PostDetail";
import Profile from "./features/profile/pages/Profile";
import EditProfile from "./features/profile/pages/EditProfile";
import FollowList from "./features/profile/pages/FollowList";
import FollowRequests from "./features/profile/pages/FollowRequests";
import ProtectedRoute from "./features/shared/components/ProtectedRoute";
import PublicRoute from "./features/shared/components/PublicRoute";
import Layout from "./features/shared/components/Layout";
import NotFound from "./features/shared/components/NotFound";

export const routes = createBrowserRouter([
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <Layout />,
        children: [
          { path: "/", element: <Feed /> },
          { path: "/p/:postId", element: <PostDetail /> },
          { path: "/profile", element: <Profile /> },
          { path: "/profile/edit", element: <EditProfile /> },
          { path: "/profile/requests", element: <FollowRequests /> },
          { path: "/u/:username", element: <Profile /> },
          { path: "/u/:username/followers", element: <FollowList type="followers" /> },
          { path: "/u/:username/following", element: <FollowList type="following" /> },
        ],
      },
    ],
  },
  {
    element: <PublicRoute />,
    children: [
      { path: "/login", element: <Login /> },
      { path: "/register", element: <Register /> },
    ],
  },
  { path: "*", element: <NotFound /> },
]);
