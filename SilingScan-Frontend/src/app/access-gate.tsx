import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router";
import {
  canAccessPath,
  getCurrentUser,
  getDefaultRouteForRole,
  type UserRole,
} from "../lib/auth";

type AccessGateProps = {
  allowedRoles: UserRole[];
  children: ReactNode;
};

export function AccessGate({ allowedRoles, children }: AccessGateProps) {
  const currentUser = getCurrentUser();
  const { pathname } = useLocation();

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  if (
    !allowedRoles.includes(currentUser.role) ||
    !canAccessPath(currentUser.role, pathname)
  ) {
    return <Navigate to={getDefaultRouteForRole(currentUser.role)} replace />;
  }

  return <>{children}</>;
}
