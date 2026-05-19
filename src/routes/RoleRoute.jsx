import React from "react";
import { useAuth } from "../context/AuthContext";
import { Navigate } from "react-router-dom";

function RoleRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth();

  if (loading) return <div>Loading...</div>;

  // not logged in → go login
  if (!user?.isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // role mapping for safe redirects
  const homeRoute = {
    admin: "/admin/overview",
    client: "/client/overview",
    worker: "/worker/overview",
  };

  // wrong role → redirect to THEIR overview, not generic one
  if (!allowedRoles.includes(user.user_type)) {
    return <Navigate to={homeRoute[user.user_type] || "/login"} replace />;
  }

  return children;
}

export default RoleRoute;
