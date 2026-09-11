import { Navigate, useLocation } from "react-router-dom";
import useAuth from "../Hooks/useAuth";

const StudentRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-base-200">
        <div className="text-center">
          <span className="loading loading-spinner loading-lg text-primary" />
          <p className="mt-3 text-sm text-base-content/60">
            Checking student access...
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (user.status === "blocked") {
    return <Navigate to="/" replace />;
  }

  if (user.role !== "student") {
    return <Navigate to="/dashboard/admin" replace />;
  }

  return children;
};

export default StudentRoute;
