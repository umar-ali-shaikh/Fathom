import { Navigate, Outlet } from "react-router";
import { useAuth } from "../../auth/hooks/useAuth";

const PublicRoute = () => {
  const { user, initializing } = useAuth();

  if (initializing) {
    return (
      <main className="route-loading">
        <p>Loading...</p>
      </main>
    );
  }

  if (user) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default PublicRoute;
