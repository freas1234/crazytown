"use client";

import { ReactNode, useEffect } from "react";
import { useAuth } from "../lib/AuthContext";
import { useRouter } from "next/navigation";

interface RoleGuardProps {
  children: ReactNode;
  allowedRoles?: string[];
  fallback?: ReactNode;
  redirectTo?: string;
}

export function RoleGuard({
  children,
  allowedRoles = ["admin", "owner"],
  fallback = null,
  redirectTo,
}: RoleGuardProps) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  // Check if user has any of the allowed roles
  const hasAllowedRole = () => {
    if (!user) return false;
    const userRoles = (user as any).roles || (user.role ? [user.role] : []);
    return allowedRoles.some((role) => userRoles.includes(role));
  };

  useEffect(() => {
    // Only redirect if we're not loading and user doesn't have access
    if (!isLoading && (!user || !hasAllowedRole())) {
      if (redirectTo) {
        // Add a small delay to prevent immediate redirects during initial load
        const timer = setTimeout(() => {
          router.push(redirectTo);
        }, 100);
        return () => clearTimeout(timer);
      }
    }
  }, [user, isLoading, allowedRoles, redirectTo, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse p-4">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (!user || !hasAllowedRole()) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
