"use client";

import { useState, useEffect } from "react";
import { useTranslation } from "../../../lib/hooks/useTranslation";
import { RoleGuard } from "../../../components/RoleGuard";
import { PermissionGuard } from "../../../components/PermissionGuard";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Textarea } from "../../../components/ui/textarea";
import { Badge } from "../../../components/ui/badge";
import { Checkbox } from "../../../components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../../components/ui/dialog";
import { toast } from "sonner";
import { Plus, Edit, Trash2, Save, X, Shield, RefreshCw } from "lucide-react";
import { ScrollArea } from "../../../components/ui/scroll-area";

interface Permission {
  id: string;
  name: string;
  description: string;
  category: string;
}

interface Role {
  id: string;
  name: string;
  description?: string;
  permissions: string[];
  isSystem: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function RolesPage() {
  const { t } = useTranslation();
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    permissions: [] as string[],
  });

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/roles", {
        credentials: "include",
      });

      if (!response.ok) throw new Error("Failed to fetch roles");

      const data = await response.json();
      setRoles(data.roles || []);
      setPermissions(data.permissions || []);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching roles:", error);
      toast.error("Failed to load roles");
      setLoading(false);
    }
  };

  const handleOpenDialog = (role?: Role) => {
    if (role) {
      setEditingRole(role);
      setFormData({
        name: role.name,
        description: role.description || "",
        permissions: role.permissions || [],
      });
    } else {
      setEditingRole(null);
      setFormData({
        name: "",
        description: "",
        permissions: [],
      });
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingRole(null);
    setFormData({
      name: "",
      description: "",
      permissions: [],
    });
  };

  const handleTogglePermission = (permissionId: string) => {
    setFormData((prev) => ({
      ...prev,
      permissions: prev.permissions.includes(permissionId)
        ? prev.permissions.filter((id) => id !== permissionId)
        : [...prev.permissions, permissionId],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const url = editingRole
        ? `/api/admin/roles/${editingRole.id}`
        : "/api/admin/roles";
      const method = editingRole ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to save role");
      }

      toast.success(
        editingRole ? "Role updated successfully" : "Role created successfully"
      );
      handleCloseDialog();
      fetchRoles();
    } catch (error) {
      console.error("Error saving role:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to save role"
      );
    }
  };

  const handleDelete = async (roleId: string) => {
    if (!confirm("Are you sure you want to delete this role?")) return;

    try {
      const response = await fetch(`/api/admin/roles/${roleId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete role");
      }

      toast.success("Role deleted successfully");
      fetchRoles();
    } catch (error) {
      console.error("Error deleting role:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to delete role"
      );
    }
  };

  const permissionsByCategory = permissions.reduce((acc, perm) => {
    if (!acc[perm.category]) {
      acc[perm.category] = [];
    }
    acc[perm.category].push(perm);
    return acc;
  }, {} as Record<string, Permission[]>);

  return (
    <RoleGuard allowedRoles={["admin", "owner"]}>
      <PermissionGuard permission="roles.view">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                Roles & Permissions
              </h1>
              <p className="text-gray-400">
                Create and manage roles with custom permissions
              </p>
            </div>
            <PermissionGuard permission="roles.create">
              <Button onClick={() => handleOpenDialog()}>
                <Plus className="h-4 w-4 mr-2" />
                Create Role
              </Button>
            </PermissionGuard>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {roles.map((role) => (
                <Card key={role.id} className="bg-secondary/30 border-gray-800">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-white flex items-center gap-2">
                          <Shield className="h-5 w-5" />
                          {role.name}
                        </CardTitle>
                        {role.description && (
                          <p className="text-gray-400 text-sm mt-1">
                            {role.description}
                          </p>
                        )}
                        {role.isSystem && (
                          <Badge className="mt-2 bg-blue-500/20 text-blue-400">
                            System Role
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <p className="text-sm text-gray-400">
                        <strong>{role.permissions.length}</strong> permissions
                      </p>
                      <div className="flex gap-2">
                        <PermissionGuard permission="roles.edit">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenDialog(role)}
                            disabled={role.isSystem}
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                        </PermissionGuard>
                        <PermissionGuard permission="roles.delete">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(role.id)}
                            disabled={role.isSystem}
                            className="text-red-400 hover:text-red-300"
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Delete
                          </Button>
                        </PermissionGuard>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
              <DialogHeader>
                <DialogTitle>
                  {editingRole ? "Edit Role" : "Create New Role"}
                </DialogTitle>
                <DialogDescription>
                  {editingRole
                    ? "Update role name, description, and permissions"
                    : "Create a new role with custom permissions"}
                </DialogDescription>
              </DialogHeader>

              <form
                onSubmit={handleSubmit}
                className="flex-1 flex flex-col overflow-hidden"
              >
                <div className="space-y-4 flex-1 overflow-y-auto pr-2">
                  <div>
                    <Label htmlFor="name" className="text-white">
                      Role Name *
                    </Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      required
                      className="mt-1"
                      disabled={editingRole?.isSystem}
                    />
                  </div>

                  <div>
                    <Label htmlFor="description" className="text-white">
                      Description
                    </Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                      className="mt-1"
                      rows={2}
                    />
                  </div>

                  <div>
                    <Label className="text-white mb-3 block">
                      Permissions *
                    </Label>
                    <ScrollArea className="h-[400px] border border-gray-800 rounded-lg p-4">
                      <div className="space-y-6">
                        {Object.entries(permissionsByCategory).map(
                          ([category, perms]) => (
                            <div key={category}>
                              <h3 className="text-white font-semibold mb-2">
                                {category}
                              </h3>
                              <div className="space-y-2">
                                {perms.map((perm) => (
                                  <div
                                    key={perm.id}
                                    className="flex items-start space-x-2 p-2 hover:bg-gray-800/50 rounded"
                                  >
                                    <Checkbox
                                      id={perm.id}
                                      checked={formData.permissions.includes(
                                        perm.id
                                      )}
                                      onCheckedChange={() =>
                                        handleTogglePermission(perm.id)
                                      }
                                      disabled={editingRole?.isSystem}
                                    />
                                    <div className="flex-1">
                                      <Label
                                        htmlFor={perm.id}
                                        className="text-white cursor-pointer"
                                      >
                                        {perm.name}
                                      </Label>
                                      <p className="text-xs text-gray-400">
                                        {perm.description}
                                      </p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )
                        )}
                      </div>
                    </ScrollArea>
                    <p className="text-xs text-gray-400 mt-2">
                      Selected: {formData.permissions.length} permissions
                    </p>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t border-gray-800 mt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCloseDialog}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                  <Button type="submit" disabled={editingRole?.isSystem}>
                    <Save className="h-4 w-4 mr-2" />
                    {editingRole ? "Update" : "Create"} Role
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </PermissionGuard>
    </RoleGuard>
  );
}
