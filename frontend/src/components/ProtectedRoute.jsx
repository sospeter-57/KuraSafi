import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children, role }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return <Navigate to="/" replace />;
  if (role) {
    const roles = user.role?.split(",").map((r) => r.trim()) || [];
    if (!roles.includes(role)) {
      const primaryRole = roles[0] || user.role;
      return <Navigate to={`/${primaryRole}/dashboard`} replace />;
    }
  }

  return children;
}
