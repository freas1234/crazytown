"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "../../../lib/AuthContext";
import { RoleGuard } from "../../../components/RoleGuard";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Badge } from "../../../components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../../../components/ui/popover";
import { Checkbox } from "../../../components/ui/checkbox";
import { Label } from "../../../components/ui/label";
import { ScrollArea } from "../../../components/ui/scroll-area";
import { toast } from "sonner";
import {
  Users,
  Search,
  Plus,
  Edit,
  Trash2,
  Eye,
  UserPlus,
  Shield,
  Calendar,
  ChevronDown,
  Check,
} from "lucide-react";

interface User {
  id: string;
  email: string;
  username: string;
  role: string;
  roles?: string[];
  createdAt: string;
}

interface Role {
  id: string;
  name: string;
  isSystem: boolean;
}

// Multi-select component for roles
function RoleMultiSelect({
  user,
  roles,
  currentUser,
  onChange,
  disabled,
}: {
  user: User;
  roles: Role[];
  currentUser: any;
  onChange: (roleIds: string[]) => void;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const userRoles = user.roles || (user.role ? [user.role] : []);
  const [selectedRoles, setSelectedRoles] = useState<string[]>(userRoles);

  useEffect(() => {
    const userRoles = user.roles || (user.role ? [user.role] : []);
    setSelectedRoles(userRoles);
  }, [user.roles, user.role]);

  const handleToggleRole = (roleId: string) => {
    const newRoles = selectedRoles.includes(roleId)
      ? selectedRoles.filter((id) => id !== roleId)
      : [...selectedRoles, roleId];
    setSelectedRoles(newRoles);
  };

  const handleApply = () => {
    onChange(selectedRoles);
    setOpen(false);
  };

  const getRoleName = (roleId: string) => {
    if (roleId === "owner") return "Owner";
    if (roleId === "admin") return "Admin";
    if (roleId === "user") return "User";
    return roles.find((r) => r.id === roleId)?.name || roleId;
  };

  const displayText =
    selectedRoles.length === 0
      ? "No roles"
      : selectedRoles.length === 1
      ? getRoleName(selectedRoles[0])
      : `${selectedRoles.length} roles`;

  const allAvailableRoles = [
    { id: "user", name: "User", isSystem: true },
    { id: "admin", name: "Admin", isSystem: true },
    ...(currentUser?.role === "owner"
      ? [{ id: "owner", name: "Owner", isSystem: true }]
      : []),
    ...roles.filter((r) => !r.isSystem),
  ];

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="flex-1 bg-gray-700 border-gray-600 text-white justify-between"
          disabled={disabled}
        >
          <span className="truncate">{displayText}</span>
          <ChevronDown className="h-4 w-4 ml-2 shrink-0" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 bg-gray-800 border-gray-700 p-0">
        <div className="p-4 border-b border-gray-700">
          <h4 className="font-semibold text-white mb-2">Select Roles</h4>
          <p className="text-sm text-gray-400">
            User can have multiple roles assigned
          </p>
        </div>
        <ScrollArea className="h-[300px] p-4">
          <div className="space-y-2">
            {allAvailableRoles.map((role) => {
              const isChecked = selectedRoles.includes(role.id);
              const isOwner = role.id === "owner";
              const canSelectOwner = currentUser?.role === "owner";

              if (isOwner && !canSelectOwner) return null;

              return (
                <div
                  key={role.id}
                  className="flex items-center space-x-2 p-2 hover:bg-gray-700/50 rounded cursor-pointer"
                  onClick={() => handleToggleRole(role.id)}
                >
                  <Checkbox
                    id={role.id}
                    checked={isChecked}
                    onCheckedChange={() => handleToggleRole(role.id)}
                  />
                  <Label
                    htmlFor={role.id}
                    className="text-white cursor-pointer flex-1"
                  >
                    {role.name}
                  </Label>
                  {role.isSystem && (
                    <Badge variant="outline" className="text-xs">
                      System
                    </Badge>
                  )}
                </div>
              );
            })}
          </div>
        </ScrollArea>
        <div className="p-4 border-t border-gray-700 flex justify-end gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSelectedRoles(userRoles);
              setOpen(false);
            }}
          >
            Cancel
          </Button>
          <Button size="sm" onClick={handleApply}>
            <Check className="h-4 w-4 mr-2" />
            Apply ({selectedRoles.length})
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

export default function UsersManagement() {
  const { user: currentUser, isLoading: authLoading } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [changingRoles, setChangingRoles] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchUsers();
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      const response = await fetch("/api/admin/roles", {
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        setRoles(data.roles || []);
      }
    } catch (error) {
      console.error("Error fetching roles:", error);
    }
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/users");

      if (!response.ok) {
        throw new Error("Failed to fetch users");
      }

      const data = await response.json();
      if (data.success) {
        setUsers(data.users);
      } else {
        throw new Error(data.error || "Failed to fetch users");
      }
    } catch (error: any) {
      setError(error.message);
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (
    userId: string,
    selectedRoleIds: string[]
  ) => {
    try {
      setChangingRoles((prev) => new Set(prev).add(userId));

      const response = await fetch(`/api/admin/users/${userId}/role`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ roleIds: selectedRoleIds }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update user roles");
      }

      const roleNames = selectedRoleIds
        .map((roleId) => {
          if (roleId === "owner") return "Owner";
          if (roleId === "admin") return "Admin";
          if (roleId === "user") return "User";
          return roles.find((r) => r.id === roleId)?.name || roleId;
        })
        .join(", ");

      toast.success(`Roles updated: ${roleNames}`, {
        description: "User roles have been successfully updated",
      });

      await fetchUsers();
    } catch (error) {
      console.error("Error updating user roles:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to update user roles";
      toast.error("Failed to update roles", {
        description: errorMessage,
      });
      setError(errorMessage);
    } finally {
      setChangingRoles((prev) => {
        const next = new Set(prev);
        next.delete(userId);
        return next;
      });
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this user? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete user");
      }

      fetchUsers();
    } catch (error) {
      console.error("Error deleting user:", error);
      setError("Failed to delete user");
    }
  };

  const filteredUsers = users.filter(
    (user) =>
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "owner":
        return "bg-purple-500/20 text-purple-400 border-purple-500/30";
      case "admin":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  return (
    <RoleGuard allowedRoles={["admin", "owner"]}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-3">
              <Users className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
              User Management
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage users and their roles
            </p>
          </div>
          <Button asChild className="gap-2 w-full sm:w-auto">
            <Link href="/admin/users/create">
              <UserPlus className="h-4 w-4" />
              Add User
            </Link>
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-gray-800/50 border-gray-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Total Users</p>
                  <p className="text-2xl font-bold text-white">
                    {users.length}
                  </p>
                </div>
                <Users className="h-8 w-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/50 border-gray-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Admins</p>
                  <p className="text-2xl font-bold text-white">
                    {
                      users.filter(
                        (u) => u.role === "admin" || u.role === "owner"
                      ).length
                    }
                  </p>
                </div>
                <Shield className="h-8 w-8 text-purple-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/50 border-gray-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Regular Users</p>
                  <p className="text-2xl font-bold text-white">
                    {users.filter((u) => u.role === "user").length}
                  </p>
                </div>
                <Users className="h-8 w-8 text-green-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <Card className="bg-gray-800/50 border-gray-700">
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search users by name, email or role..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-gray-700/50 border-gray-600 text-white placeholder-gray-400"
              />
            </div>
          </CardContent>
        </Card>

        {/* Loading State */}
        {(loading || authLoading) && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-400">Loading users...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <Card className="bg-red-500/10 border-red-500/20">
            <CardContent className="p-4">
              <p className="text-red-400 mb-3">{error}</p>
              <Button
                onClick={fetchUsers}
                variant="outline"
                className="border-red-500/30 text-red-400 hover:bg-red-500/20"
              >
                Try Again
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Users List */}
        {!loading && !authLoading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <Card
                  key={user.id}
                  className="bg-gray-800/50 border-gray-700 hover:bg-gray-800/70 transition-colors"
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-medium">
                          {user.username.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h3 className="font-medium text-white">
                            {user.username}
                          </h3>
                          <p className="text-sm text-gray-400">{user.email}</p>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {(user.roles || (user.role ? [user.role] : [])).map(
                          (roleId) => (
                            <Badge
                              key={roleId}
                              className={getRoleBadgeColor(roleId)}
                            >
                              {roleId === "owner"
                                ? "Owner"
                                : roleId === "admin"
                                ? "Admin"
                                : roleId === "user"
                                ? "User"
                                : roles.find((r) => r.id === roleId)?.name ||
                                  roleId}
                            </Badge>
                          )
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-gray-400 mb-4">
                      <Calendar className="h-4 w-4" />
                      <span>
                        {new Date(user.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {currentUser &&
                      (currentUser.role === "owner" ||
                        currentUser.role === "admin") ? (
                        <RoleMultiSelect
                          user={user}
                          roles={roles}
                          currentUser={currentUser}
                          onChange={(selectedRoles: string[]) =>
                            handleRoleChange(user.id, selectedRoles)
                          }
                          disabled={
                            (currentUser.role === "admin" &&
                              (user.roles?.includes("owner") ||
                                user.role === "owner")) ||
                            currentUser.id === user.id ||
                            changingRoles.has(user.id)
                          }
                        />
                      ) : null}

                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0 text-blue-400 hover:bg-blue-500/20"
                          asChild
                        >
                          <Link href={`/admin/users/${user.id}`}>
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>

                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0 text-amber-400 hover:bg-amber-500/20"
                          asChild
                        >
                          <Link href={`/admin/users/${user.id}/edit`}>
                            <Edit className="h-4 w-4" />
                          </Link>
                        </Button>

                        {(currentUser?.role === "owner" ||
                          (currentUser?.role === "admin" &&
                            user.role !== "owner")) &&
                          currentUser?.id !== user.id && (
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 w-8 p-0 text-red-400 hover:bg-red-500/20"
                              onClick={() => handleDeleteUser(user.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-white mb-2">
                  {searchTerm ? "No users found" : "No users yet"}
                </h3>
                <p className="text-gray-400 mb-4">
                  {searchTerm
                    ? "Try adjusting your search terms"
                    : "Get started by adding your first user"}
                </p>
                {!searchTerm && (
                  <Button asChild>
                    <Link href="/admin/users/create">
                      <UserPlus className="h-4 w-4 mr-2" />
                      Add First User
                    </Link>
                  </Button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </RoleGuard>
  );
}
