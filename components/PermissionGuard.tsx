"use client";

import { ReactNode, useEffect, useState } from "react";
import { useAuth } from "../lib/AuthContext";
import { checkPermission } from "../lib/permissions";

interface PermissionGuardProps {
  children: ReactNode;
  permission: string;
  fallback?: ReactNode;
  showError?: boolean;
}

export function PermissionGuard({
  children,
  permission,
  fallback = null,
  showError = false,
}: PermissionGuardProps) {
  const { user } = useAuth();
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAccess = async () => {
      if (!user) {
        setHasAccess(false);
        setLoading(false);
        return;
      }

      // Owner and admin always have access (check both single role and multiple roles)
      const userRoles = (user as any).roles || (user.role ? [user.role] : []);
      if (userRoles.includes("owner") || userRoles.includes("admin")) {
        setHasAccess(true);
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `/api/admin/permissions/check?permission=${permission}`,
          {
            credentials: "include",
          }
        );

        if (response.ok) {
          const data = await response.json();
          setHasAccess(data.hasPermission || false);
        } else {
          setHasAccess(false);
        }
      } catch (error) {
        console.error("Error checking permission:", error);
        setHasAccess(false);
      } finally {
        setLoading(false);
      }
    };

    checkAccess();
  }, [user, permission]);

  if (loading) {
    return <div className="animate-pulse p-4">Loading...</div>;
  }

  if (!hasAccess) {
    if (showError) {
      return (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
          <p className="text-red-400">
            You don't have permission to access this resource.
          </p>
        </div>
      );
    }
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
