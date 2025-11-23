/**
 * Permission checking utilities
 */

import {
  getUserPermissions,
  hasPermission,
  hasAnyPermission,
} from "../app/models/Role";

export interface PermissionCheckOptions {
  userId: string;
  permission: string;
  permissions?: string[];
}

/**
 * Check if a user has a specific permission
 */
export async function checkPermission(
  userId: string,
  permission: string
): Promise<boolean> {
  const userPerms = await getUserPermissions(userId);
  return hasPermission(userPerms, permission);
}

/**
 * Check if a user has any of the specified permissions
 */
export async function checkAnyPermission(
  userId: string,
  permissions: string[]
): Promise<boolean> {
  const userPerms = await getUserPermissions(userId);
  return hasAnyPermission(userPerms, permissions);
}

/**
 * Get user's role and permissions
 */
export async function getUserRoleAndPermissions(userId: string): Promise<{
  role: string;
  permissions: string[];
}> {
  const { connectToDatabase } = await import("./db");
  const { db } = await connectToDatabase();
  const usersCollection = db.collection("users");

  const user = await usersCollection.findOne({ id: userId });
  if (!user) {
    return { role: "user", permissions: [] };
  }

  const permissions = await getUserPermissions(userId);

  return {
    role: user.role || "user",
    permissions,
  };
}
