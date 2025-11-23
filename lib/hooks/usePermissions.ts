"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../AuthContext";

export function usePermissions() {
  const { user } = useAuth();
  const [permissions, setPermissions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPermissions = async () => {
      if (!user) {
        setPermissions([]);
        setLoading(false);
        return;
      }

      // Owner and admin always have all permissions (check both single role and multiple roles)
      const userRoles = (user as any).roles || (user.role ? [user.role] : []);
      if (userRoles.includes("owner") || userRoles.includes("admin")) {
        setPermissions(["*"]); // Special marker for all permissions
        setLoading(false);
        return;
      }

      try {
        const response = await fetch("/api/admin/permissions/user", {
          credentials: "include",
        });

        if (response.ok) {
          const data = await response.json();
          setPermissions(data.permissions || []);
        }
      } catch (error) {
        console.error("Error fetching permissions:", error);
        setPermissions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPermissions();
  }, [user]);

  const hasPermission = (permission: string): boolean => {
    if (loading) return false;
    if (permissions.includes("*")) return true;
    return permissions.includes(permission);
  };

  const hasAnyPermission = (permissionList: string[]): boolean => {
    if (loading) return false;
    if (permissions.includes("*")) return true;
    return permissionList.some((perm) => permissions.includes(perm));
  };

  return {
    permissions,
    hasPermission,
    hasAnyPermission,
    loading,
  };
}
