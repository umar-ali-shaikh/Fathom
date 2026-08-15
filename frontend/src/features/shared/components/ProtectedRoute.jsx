import { Navigate, Outlet } from "react-router";
import { useAuth } from "../../auth/hooks/useAuth";

const ProtectedRoute = () => {
  const { user, initializing } = useAuth();

  if (initializing) {
    return (
      <main className="route-loading">
        <p>Loading...</p>
      </main>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
