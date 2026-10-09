import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function ProtectedRoute({ allowedRoles }) {
  const { user, isAuthenticated } = useAuth();

  // User is not logged in
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // User does not have permission for this route
  if (
    allowedRoles &&
    !allowedRoles.includes(user?.role)
  ) {
    // Admin
    if (user?.role === "Admin") {
      return <Navigate to="/admin/dashboard" replace />;
    }

    // Agent
    if (user?.role === "Agent") {
      return <Navigate to="/agent/dashboard" replace />;
    }

    // Employee
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}

export default ProtectedRoute;