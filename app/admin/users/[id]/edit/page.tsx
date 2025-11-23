"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "../../../../../lib/AuthContext";
import { RoleGuard } from "../../../../../components/RoleGuard";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../../../components/ui/card";
import { Button } from "../../../../../components/ui/button";
import { Input } from "../../../../../components/ui/input";
import { Label } from "../../../../../components/ui/label";
import { Textarea } from "../../../../../components/ui/textarea";
import { Badge } from "../../../../../components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../../../../../components/ui/popover";
import { Checkbox } from "../../../../../components/ui/checkbox";
import { ScrollArea } from "../../../../../components/ui/scroll-area";
import { toast } from "sonner";
import {
  ArrowLeft,
  Save,
  Mail,
  User,
  Shield,
  FileText,
  Hash,
  UserCircle,
  ChevronDown,
  Check,
} from "lucide-react";
import Link from "next/link";

interface UserDetails {
  id: string;
  email: string;
  username: string;
  role: string;
  roles?: string[];
  bio?: string;
  avatar?: string;
  discordId?: string;
  createdAt: string;
  updatedAt: string;
}

interface Role {
  id: string;
  name: string;
  isSystem: boolean;
}

// Multi-select component for roles (reused from users page)
function RoleMultiSelectEdit({
  selectedRoles,
  roles,
  currentUser,
  onChange,
  disabled,
}: {
  selectedRoles: string[];
  roles: Role[];
  currentUser: any;
  onChange: (roleIds: string[]) => void;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [tempSelectedRoles, setTempSelectedRoles] =
    useState<string[]>(selectedRoles);

  useEffect(() => {
    setTempSelectedRoles(selectedRoles);
  }, [selectedRoles]);

  const handleToggleRole = (roleId: string) => {
    const newRoles = tempSelectedRoles.includes(roleId)
      ? tempSelectedRoles.filter((id) => id !== roleId)
      : [...tempSelectedRoles, roleId];
    setTempSelectedRoles(newRoles);
  };

  const handleApply = () => {
    onChange(tempSelectedRoles);
    setOpen(false);
  };

  const getRoleName = (roleId: string) => {
    if (roleId === "owner") return "Owner";
    if (roleId === "admin") return "Admin";
    if (roleId === "user") return "User";
    return roles.find((r) => r.id === roleId)?.name || roleId;
  };

  const displayText =
    tempSelectedRoles.length === 0
      ? "No roles"
      : tempSelectedRoles.length === 1
      ? getRoleName(tempSelectedRoles[0])
      : `${tempSelectedRoles.length} roles`;

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
          className="w-full bg-gray-700 border-gray-600 text-white justify-between"
          disabled={disabled}
          type="button"
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
              const isChecked = tempSelectedRoles.includes(role.id);
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
                    id={`edit-${role.id}`}
                    checked={isChecked}
                    onCheckedChange={() => handleToggleRole(role.id)}
                  />
                  <Label
                    htmlFor={`edit-${role.id}`}
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
            type="button"
            onClick={() => {
              setTempSelectedRoles(selectedRoles);
              setOpen(false);
            }}
          >
            Cancel
          </Button>
          <Button size="sm" type="button" onClick={handleApply}>
            <Check className="h-4 w-4 mr-2" />
            Apply ({tempSelectedRoles.length})
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

export default function EditUserPage() {
  const params = useParams();
  const router = useRouter();
  const { user: currentUser } = useAuth();
  const [user, setUser] = useState<UserDetails | null>(null);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    email: "",
    username: "",
    roles: [] as string[],
    bio: "",
    avatar: "",
    discordId: "",
  });

  useEffect(() => {
    if (params.id) {
      fetchUser();
      fetchRoles();
    }
  }, [params.id]);

  const fetchUser = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/users/${params.id}`, {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch user");
      }

      const data = await response.json();
      if (data.success && data.user) {
        setUser(data.user);
        const userRoles =
          data.user.roles || (data.user.role ? [data.user.role] : ["user"]);
        setFormData({
          email: data.user.email || "",
          username: data.user.username || "",
          roles: userRoles,
          bio: data.user.bio || "",
          avatar: data.user.avatar || "",
          discordId: data.user.discordId || "",
        });
      } else {
        throw new Error(data.error || "User not found");
      }
    } catch (error) {
      console.error("Error fetching user:", error);
      setError(error instanceof Error ? error.message : "Failed to load user");
      toast.error("Failed to load user", {
        description: error instanceof Error ? error.message : "Unknown error",
      });
    } finally {
      setLoading(false);
    }
  };

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.email || !formData.username) {
      toast.error("Validation error", {
        description: "Email and username are required",
      });
      return;
    }

    try {
      setSaving(true);
      const response = await fetch(`/api/admin/users/${params.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update user");
      }

      toast.success("User updated successfully", {
        description: "User information has been saved",
      });

      router.push(`/admin/users/${params.id}`);
    } catch (error) {
      console.error("Error updating user:", error);
      toast.error("Failed to update user", {
        description: error instanceof Error ? error.message : "Unknown error",
      });
    } finally {
      setSaving(false);
    }
  };

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

  if (loading) {
    return (
      <RoleGuard allowedRoles={["admin", "owner"]}>
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-400">Loading user details...</p>
            </div>
          </div>
        </div>
      </RoleGuard>
    );
  }

  if (error || !user) {
    return (
      <RoleGuard allowedRoles={["admin", "owner"]}>
        <div className="container mx-auto px-4 py-8">
          <Card className="bg-red-500/10 border-red-500/20">
            <CardContent className="p-6">
              <p className="text-red-400 mb-4">{error || "User not found"}</p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => router.push("/admin/users")}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Users
                </Button>
                <Button variant="outline" onClick={fetchUser}>
                  Try Again
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </RoleGuard>
    );
  }

  const canEditRole =
    currentUser &&
    (currentUser.role === "owner" ||
      (currentUser.role === "admin" && user.role !== "owner"));

  return (
    <RoleGuard allowedRoles={["admin", "owner"]}>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={() => router.push(`/admin/users/${user.id}`)}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                <UserCircle className="h-8 w-8" />
                Edit User
              </h1>
              <p className="text-gray-400 mt-1">
                Update user information and settings
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Form */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="bg-gray-800/50 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Basic Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="email" className="text-white">
                      Email *
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      required
                      className="mt-1 bg-gray-700 border-gray-600 text-white"
                    />
                  </div>

                  <div>
                    <Label htmlFor="username" className="text-white">
                      Username *
                    </Label>
                    <Input
                      id="username"
                      value={formData.username}
                      onChange={(e) =>
                        setFormData({ ...formData, username: e.target.value })
                      }
                      required
                      className="mt-1 bg-gray-700 border-gray-600 text-white"
                    />
                  </div>

                  {canEditRole && (
                    <div>
                      <Label className="text-white mb-2 block">Roles</Label>
                      <RoleMultiSelectEdit
                        selectedRoles={formData.roles}
                        roles={roles}
                        currentUser={currentUser}
                        onChange={(roleIds) =>
                          setFormData({ ...formData, roles: roleIds })
                        }
                        disabled={
                          currentUser?.id === user.id ||
                          (currentUser?.role === "admin" &&
                            (user.roles?.includes("owner") ||
                              user.role === "owner"))
                        }
                      />
                      <p className="text-xs text-gray-400 mt-1">
                        Select multiple roles to assign to this user
                      </p>
                    </div>
                  )}

                  <div>
                    <Label htmlFor="avatar" className="text-white">
                      Avatar URL
                    </Label>
                    <Input
                      id="avatar"
                      type="url"
                      value={formData.avatar}
                      onChange={(e) =>
                        setFormData({ ...formData, avatar: e.target.value })
                      }
                      placeholder="https://example.com/avatar.jpg"
                      className="mt-1 bg-gray-700 border-gray-600 text-white"
                    />
                  </div>

                  <div>
                    <Label htmlFor="discordId" className="text-white">
                      Discord ID
                    </Label>
                    <Input
                      id="discordId"
                      value={formData.discordId}
                      onChange={(e) =>
                        setFormData({ ...formData, discordId: e.target.value })
                      }
                      placeholder="Discord User ID"
                      className="mt-1 bg-gray-700 border-gray-600 text-white"
                    />
                  </div>

                  <div>
                    <Label htmlFor="bio" className="text-white">
                      Bio
                    </Label>
                    <Textarea
                      id="bio"
                      value={formData.bio}
                      onChange={(e) =>
                        setFormData({ ...formData, bio: e.target.value })
                      }
                      rows={4}
                      placeholder="User biography..."
                      className="mt-1 bg-gray-700 border-gray-600 text-white"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <Card className="bg-gray-800/50 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Account Info</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-400 mb-1">User ID</p>
                    <p className="text-white font-mono text-xs break-all">
                      {user.id}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Created At</p>
                    <p className="text-white text-sm">
                      {new Date(user.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Last Updated</p>
                    <p className="text-white text-sm">
                      {new Date(user.updatedAt).toLocaleString()}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-800/50 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button type="submit" className="w-full" disabled={saving}>
                    <Save className="h-4 w-4 mr-2" />
                    {saving ? "Saving..." : "Save Changes"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() => router.push(`/admin/users/${user.id}`)}
                  >
                    Cancel
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </div>
    </RoleGuard>
  );
}
