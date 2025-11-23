import { connectToDatabase } from "../../lib/db";
import { v4 as uuidv4 } from "uuid";

export interface Permission {
  id: string;
  name: string;
  description: string;
  category: string;
}

export interface Role {
  id: string;
  name: string;
  description?: string;
  permissions: string[]; // Array of permission IDs
  isSystem: boolean; // System roles (admin, owner) cannot be deleted
  createdAt: Date;
  updatedAt: Date;
}

// Built-in permissions
export const BUILT_IN_PERMISSIONS: Permission[] = [
  // Dashboard
  {
    id: "dashboard.view",
    name: "View Dashboard",
    description: "Access the admin dashboard",
    category: "Dashboard",
  },

  // Store Management
  {
    id: "store.view",
    name: "View Store",
    description: "View store settings",
    category: "Store",
  },
  {
    id: "store.products.view",
    name: "View Products",
    description: "View products list",
    category: "Store",
  },
  {
    id: "store.products.create",
    name: "Create Products",
    description: "Create new products",
    category: "Store",
  },
  {
    id: "store.products.edit",
    name: "Edit Products",
    description: "Edit existing products",
    category: "Store",
  },
  {
    id: "store.products.delete",
    name: "Delete Products",
    description: "Delete products",
    category: "Store",
  },
  {
    id: "store.categories.view",
    name: "View Categories",
    description: "View categories",
    category: "Store",
  },
  {
    id: "store.categories.manage",
    name: "Manage Categories",
    description: "Create, edit, delete categories",
    category: "Store",
  },
  {
    id: "store.coupons.view",
    name: "View Coupons",
    description: "View coupons",
    category: "Store",
  },
  {
    id: "store.coupons.manage",
    name: "Manage Coupons",
    description: "Create, edit, delete coupons",
    category: "Store",
  },

  // Orders
  {
    id: "orders.view",
    name: "View Orders",
    description: "View all orders",
    category: "Orders",
  },
  {
    id: "orders.edit",
    name: "Edit Orders",
    description: "Edit order status",
    category: "Orders",
  },
  {
    id: "orders.delete",
    name: "Delete Orders",
    description: "Delete orders",
    category: "Orders",
  },

  // Jobs
  {
    id: "jobs.view",
    name: "View Jobs",
    description: "View job listings",
    category: "Jobs",
  },
  {
    id: "jobs.create",
    name: "Create Jobs",
    description: "Create new job postings",
    category: "Jobs",
  },
  {
    id: "jobs.edit",
    name: "Edit Jobs",
    description: "Edit job postings",
    category: "Jobs",
  },
  {
    id: "jobs.delete",
    name: "Delete Jobs",
    description: "Delete job postings",
    category: "Jobs",
  },
  {
    id: "jobs.applications.view",
    name: "View Applications",
    description: "View job applications",
    category: "Jobs",
  },
  {
    id: "jobs.applications.manage",
    name: "Manage Applications",
    description: "Approve/reject applications",
    category: "Jobs",
  },

  // Users
  {
    id: "users.view",
    name: "View Users",
    description: "View user list",
    category: "Users",
  },
  {
    id: "users.edit",
    name: "Edit Users",
    description: "Edit user information",
    category: "Users",
  },
  {
    id: "users.delete",
    name: "Delete Users",
    description: "Delete users",
    category: "Users",
  },
  {
    id: "users.roles.assign",
    name: "Assign Roles",
    description: "Assign roles to users",
    category: "Users",
  },

  // Roles & Permissions
  {
    id: "roles.view",
    name: "View Roles",
    description: "View roles and permissions",
    category: "Roles",
  },
  {
    id: "roles.create",
    name: "Create Roles",
    description: "Create new roles",
    category: "Roles",
  },
  {
    id: "roles.edit",
    name: "Edit Roles",
    description: "Edit roles and permissions",
    category: "Roles",
  },
  {
    id: "roles.delete",
    name: "Delete Roles",
    description: "Delete roles",
    category: "Roles",
  },

  // Content Management
  {
    id: "content.view",
    name: "View Content",
    description: "View content pages",
    category: "Content",
  },
  {
    id: "content.edit",
    name: "Edit Content",
    description: "Edit content pages",
    category: "Content",
  },
  {
    id: "content.translations",
    name: "Manage Translations",
    description: "Manage translations",
    category: "Content",
  },

  // Security
  {
    id: "security.view",
    name: "View Security",
    description: "View security logs",
    category: "Security",
  },
  {
    id: "security.manage",
    name: "Manage Security",
    description: "Manage security settings",
    category: "Security",
  },

  // Logs
  {
    id: "logs.view",
    name: "View Logs",
    description: "View application logs",
    category: "Logs",
  },
  {
    id: "logs.delete",
    name: "Delete Logs",
    description: "Delete logs",
    category: "Logs",
  },

  // Settings
  {
    id: "settings.view",
    name: "View Settings",
    description: "View site settings",
    category: "Settings",
  },
  {
    id: "settings.edit",
    name: "Edit Settings",
    description: "Edit site settings",
    category: "Settings",
  },

  // Maintenance
  {
    id: "maintenance.view",
    name: "View Maintenance",
    description: "View maintenance mode",
    category: "Maintenance",
  },
  {
    id: "maintenance.manage",
    name: "Manage Maintenance",
    description: "Enable/disable maintenance mode",
    category: "Maintenance",
  },
];

// System roles (cannot be deleted)
export const SYSTEM_ROLES = {
  OWNER: "owner",
  ADMIN: "admin",
  USER: "user",
};

export const getAllPermissions = (): Permission[] => {
  return BUILT_IN_PERMISSIONS;
};

export const getPermissionById = (id: string): Permission | undefined => {
  return BUILT_IN_PERMISSIONS.find((p) => p.id === id);
};

export const getPermissionsByCategory = (): Record<string, Permission[]> => {
  const grouped: Record<string, Permission[]> = {};
  BUILT_IN_PERMISSIONS.forEach((permission) => {
    if (!grouped[permission.category]) {
      grouped[permission.category] = [];
    }
    grouped[permission.category].push(permission);
  });
  return grouped;
};

// Create default roles
export const createDefaultRoles = async () => {
  const { db } = await connectToDatabase();
  const rolesCollection = db.collection("roles");

  const defaultRoles = [
    {
      id: SYSTEM_ROLES.OWNER,
      name: "Owner",
      description: "Full access to everything",
      permissions: BUILT_IN_PERMISSIONS.map((p) => p.id),
      isSystem: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: SYSTEM_ROLES.ADMIN,
      name: "Admin",
      description: "Administrative access",
      permissions: BUILT_IN_PERMISSIONS.map((p) => p.id),
      isSystem: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: SYSTEM_ROLES.USER,
      name: "User",
      description: "Regular user",
      permissions: [],
      isSystem: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  for (const role of defaultRoles) {
    const existing = await rolesCollection.findOne({ id: role.id });
    if (!existing) {
      await rolesCollection.insertOne(role);
    }
  }
};

// Role CRUD operations
export const createRole = async (
  roleData: Omit<Role, "id" | "createdAt" | "updatedAt">
): Promise<Role> => {
  const { db } = await connectToDatabase();
  const rolesCollection = db.collection("roles");

  const now = new Date();
  const newRole: Role = {
    id: uuidv4(),
    ...roleData,
    createdAt: now,
    updatedAt: now,
  };

  await rolesCollection.insertOne(newRole);
  return newRole;
};

export const getRole = async (id: string): Promise<Role | null> => {
  const { db } = await connectToDatabase();
  const rolesCollection = db.collection("roles");

  return rolesCollection.findOne({ id });
};

export const getAllRoles = async (): Promise<Role[]> => {
  const { db } = await connectToDatabase();
  const rolesCollection = db.collection("roles");

  return rolesCollection.find({}).sort({ createdAt: -1 }).toArray();
};

export const updateRole = async (
  id: string,
  roleData: Partial<Role>
): Promise<Role | null> => {
  const { db } = await connectToDatabase();
  const rolesCollection = db.collection("roles");

  const updateData = {
    ...roleData,
    updatedAt: new Date(),
  };

  await rolesCollection.updateOne({ id }, { $set: updateData });
  return getRole(id);
};

export const deleteRole = async (id: string): Promise<boolean> => {
  const { db } = await connectToDatabase();
  const rolesCollection = db.collection("roles");

  // Check if it's a system role
  const role = await getRole(id);
  if (role?.isSystem) {
    throw new Error("Cannot delete system role");
  }

  const result = await rolesCollection.deleteOne({ id });
  return result.deletedCount > 0;
};

// Permission checking
export const hasPermission = (
  userPermissions: string[],
  permissionId: string
): boolean => {
  return userPermissions.includes(permissionId);
};

export const hasAnyPermission = (
  userPermissions: string[],
  permissionIds: string[]
): boolean => {
  return permissionIds.some((id) => userPermissions.includes(id));
};

export const hasAllPermissions = (
  userPermissions: string[],
  permissionIds: string[]
): boolean => {
  return permissionIds.every((id) => userPermissions.includes(id));
};

// Get user permissions from roles
export const getUserPermissions = async (userId: string): Promise<string[]> => {
  const { db } = await connectToDatabase();
  const usersCollection = db.collection("users");

  const user = await usersCollection.findOne({ id: userId });
  if (!user) return [];

  // Get all roles (support both old single role and new multiple roles)
  const userRoles: string[] = user.roles || (user.role ? [user.role] : []);

  // If user has owner or admin role, they have all permissions
  if (
    userRoles.includes(SYSTEM_ROLES.OWNER) ||
    userRoles.includes(SYSTEM_ROLES.ADMIN)
  ) {
    return BUILT_IN_PERMISSIONS.map((p) => p.id);
  }

  // Collect permissions from all roles
  const allPermissions = new Set<string>();

  for (const roleId of userRoles) {
    // Skip system roles (already handled above)
    if (roleId === SYSTEM_ROLES.USER) continue;

    const role = await getRole(roleId);
    if (role) {
      role.permissions.forEach((perm) => allPermissions.add(perm));
    }
  }

  return Array.from(allPermissions);
};

// Assign roles to user (replaces all roles)
export const assignRolesToUser = async (
  userId: string,
  roleIds: string[]
): Promise<boolean> => {
  const { db } = await connectToDatabase();
  const usersCollection = db.collection("users");

  // Verify all roles exist
  for (const roleId of roleIds) {
    const role = await getRole(roleId);
    if (!role) {
      throw new Error(`Role not found: ${roleId}`);
    }
  }

  // Update user with new roles array
  await usersCollection.updateOne(
    { id: userId },
    {
      $set: {
        roles: roleIds,
        // Keep role for backward compatibility (use first role or primary role)
        role: roleIds[0] || "user",
        updatedAt: new Date(),
      },
    }
  );

  return true;
};

// Add role to user (adds to existing roles)
export const addRoleToUser = async (
  userId: string,
  roleId: string
): Promise<boolean> => {
  const { db } = await connectToDatabase();
  const usersCollection = db.collection("users");

  // Verify role exists
  const role = await getRole(roleId);
  if (!role) {
    throw new Error("Role not found");
  }

  const user = await usersCollection.findOne({ id: userId });
  if (!user) {
    throw new Error("User not found");
  }

  // Get current roles
  const currentRoles: string[] = user.roles || (user.role ? [user.role] : []);

  // Add role if not already present
  if (!currentRoles.includes(roleId)) {
    const newRoles = [...currentRoles, roleId];
    await usersCollection.updateOne(
      { id: userId },
      {
        $set: {
          roles: newRoles,
          role: newRoles[0] || "user", // Keep for backward compatibility
          updatedAt: new Date(),
        },
      }
    );
  }

  return true;
};

// Remove role from user
export const removeRoleFromUser = async (
  userId: string,
  roleId: string
): Promise<boolean> => {
  const { db } = await connectToDatabase();
  const usersCollection = db.collection("users");

  const user = await usersCollection.findOne({ id: userId });
  if (!user) {
    throw new Error("User not found");
  }

  // Get current roles
  const currentRoles: string[] = user.roles || (user.role ? [user.role] : []);

  // Remove role
  const newRoles = currentRoles.filter((id) => id !== roleId);

  // Ensure user has at least one role
  if (newRoles.length === 0) {
    newRoles.push(SYSTEM_ROLES.USER);
  }

  await usersCollection.updateOne(
    { id: userId },
    {
      $set: {
        roles: newRoles,
        role: newRoles[0] || "user", // Keep for backward compatibility
        updatedAt: new Date(),
      },
    }
  );

  return true;
};

// Legacy function for backward compatibility
export const assignRoleToUser = async (
  userId: string,
  roleId: string
): Promise<boolean> => {
  return assignRolesToUser(userId, [roleId]);
};
