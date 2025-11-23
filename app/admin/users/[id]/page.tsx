"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "../../../../lib/AuthContext";
import { RoleGuard } from "../../../../components/RoleGuard";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../../components/ui/card";
import { Button } from "../../../../components/ui/button";
import { Badge } from "../../../../components/ui/badge";
import { toast } from "sonner";
import {
  ArrowLeft,
  Edit,
  Mail,
  User,
  Shield,
  Calendar,
  UserCircle,
  FileText,
  Hash,
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

export default function UserDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user: currentUser } = useAuth();
  const [user, setUser] = useState<UserDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (params.id) {
      fetchUser();
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

  return (
    <RoleGuard allowedRoles={["admin", "owner"]}>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={() => router.push("/admin/users")}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                <UserCircle className="h-8 w-8" />
                User Details
              </h1>
              <p className="text-gray-400 mt-1">
                View and manage user information
              </p>
            </div>
          </div>
          <Link href={`/admin/users/${user.id}/edit`}>
            <Button>
              <Edit className="h-4 w-4 mr-2" />
              Edit User
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Info Card */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Basic Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.username}
                      className="w-20 h-20 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center text-primary text-2xl font-medium">
                      {user.username.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <h2 className="text-2xl font-bold text-white">
                      {user.username}
                    </h2>
                    <div className="flex flex-wrap gap-2 mt-2">
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
                              : roleId}
                          </Badge>
                        )
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-3 pt-4 border-t border-gray-700">
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-400">Email</p>
                      <p className="text-white">{user.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <User className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-400">Username</p>
                      <p className="text-white">{user.username}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Shield className="h-5 w-5 text-gray-400" />
                    <div className="flex-1">
                      <p className="text-sm text-gray-400 mb-2">Roles</p>
                      <div className="flex flex-wrap gap-2">
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
                                : roleId}
                            </Badge>
                          )
                        )}
                      </div>
                    </div>
                  </div>

                  {user.discordId && (
                    <div className="flex items-center gap-3">
                      <Hash className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-400">Discord ID</p>
                        <p className="text-white font-mono">{user.discordId}</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {user.bio && (
              <Card className="bg-gray-800/50 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Bio
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-300 whitespace-pre-wrap">
                    {user.bio}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Account Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-gray-400 mb-1">Created At</p>
                  <p className="text-white">
                    {new Date(user.createdAt).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-400 mb-1">Last Updated</p>
                  <p className="text-white">
                    {new Date(user.updatedAt).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-400 mb-1">User ID</p>
                  <p className="text-white font-mono text-xs break-all">
                    {user.id}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Link href={`/admin/users/${user.id}/edit`} className="block">
                  <Button variant="outline" className="w-full">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit User
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => router.push("/admin/users")}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Users
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </RoleGuard>
  );
}
