import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../context/useAuth";

interface RoleProtectedRouteProps {
  allowedRoles: string[];
}

function RoleProtectedRoute({ allowedRoles }: RoleProtectedRouteProps) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <main className="auth-loading" role="status">
        در حال بررسی حساب کاربری...
      </main>
    );
  }

  // کاربر لاگین نیست
  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // کاربر لاگین است ولی نقش مجاز ندارد
  if (typeof user.role !== "string" || !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}

export default RoleProtectedRoute;
