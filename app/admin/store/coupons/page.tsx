"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { RoleGuard } from "../../../../components/RoleGuard";
import { Button } from "../../../../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../../components/ui/card";
import { Input } from "../../../../components/ui/input";
import { Label } from "../../../../components/ui/label";
import { Textarea } from "../../../../components/ui/textarea";
import { Switch } from "../../../../components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../../components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../../../components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../../components/ui/table";
import { Badge } from "../../../../components/ui/badge";
import { toast } from "sonner";
import { Plus, Edit, Trash2, Ticket } from "lucide-react";

interface Coupon {
  id: string;
  code: string;
  description?: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
  minPurchaseAmount?: number;
  maxDiscountAmount?: number;
  validFrom: string;
  validUntil: string;
  usageLimit?: number;
  usageCount: number;
  userLimit?: number;
  active: boolean;
  applicableCategories?: string[];
  applicableProducts?: string[];
  createdAt: string;
  updatedAt: string;
}

function CouponsContent() {
  const router = useRouter();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    code: "",
    description: "",
    discountType: "percentage" as "percentage" | "fixed",
    discountValue: 0,
    minPurchaseAmount: "",
    maxDiscountAmount: "",
    validFrom: "",
    validUntil: "",
    usageLimit: "",
    userLimit: "",
    active: true,
    applicableProducts: "",
  });

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/coupons");
      if (!response.ok) throw new Error("Failed to fetch coupons");
      const data = await response.json();
      setCoupons(data.coupons);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching coupons:", error);
      toast.error("Failed to load coupons");
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      code: "",
      description: "",
      discountType: "percentage",
      discountValue: 0,
      minPurchaseAmount: "",
      maxDiscountAmount: "",
      validFrom: "",
      validUntil: "",
      usageLimit: "",
      userLimit: "",
      active: true,
      applicableProducts: "",
    });
    setEditingCoupon(null);
  };

  const handleCreate = async () => {
    try {
      const payload = {
        ...formData,
        minPurchaseAmount: formData.minPurchaseAmount
          ? parseFloat(formData.minPurchaseAmount)
          : undefined,
        maxDiscountAmount: formData.maxDiscountAmount
          ? parseFloat(formData.maxDiscountAmount)
          : undefined,
        usageLimit: formData.usageLimit
          ? parseInt(formData.usageLimit)
          : undefined,
        userLimit: formData.userLimit
          ? parseInt(formData.userLimit)
          : undefined,
        applicableProducts: formData.applicableProducts
          ? formData.applicableProducts
              .split(",")
              .map((id) => id.trim())
              .filter(Boolean)
          : undefined,
      };

      const response = await fetch("/api/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create coupon");
      }

      toast.success("Coupon created successfully");
      setIsCreateDialogOpen(false);
      resetForm();
      fetchCoupons();
    } catch (error) {
      console.error("Error creating coupon:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to create coupon"
      );
    }
  };

  const handleEdit = (coupon: Coupon) => {
    setEditingCoupon(coupon);
    setFormData({
      code: coupon.code,
      description: coupon.description || "",
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      minPurchaseAmount: coupon.minPurchaseAmount?.toString() || "",
      maxDiscountAmount: coupon.maxDiscountAmount?.toString() || "",
      validFrom: new Date(coupon.validFrom).toISOString().slice(0, 16),
      validUntil: new Date(coupon.validUntil).toISOString().slice(0, 16),
      usageLimit: coupon.usageLimit?.toString() || "",
      userLimit: coupon.userLimit?.toString() || "",
      active: coupon.active,
      applicableProducts: coupon.applicableProducts?.join(", ") || "",
    });
    setIsCreateDialogOpen(true);
  };

  const handleUpdate = async () => {
    if (!editingCoupon) return;

    try {
      const payload = {
        ...formData,
        minPurchaseAmount: formData.minPurchaseAmount
          ? parseFloat(formData.minPurchaseAmount)
          : undefined,
        maxDiscountAmount: formData.maxDiscountAmount
          ? parseFloat(formData.maxDiscountAmount)
          : undefined,
        usageLimit: formData.usageLimit
          ? parseInt(formData.usageLimit)
          : undefined,
        userLimit: formData.userLimit
          ? parseInt(formData.userLimit)
          : undefined,
        applicableProducts: formData.applicableProducts
          ? formData.applicableProducts
              .split(",")
              .map((id) => id.trim())
              .filter(Boolean)
          : undefined,
      };

      const response = await fetch(`/api/coupons/${editingCoupon.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update coupon");
      }

      toast.success("Coupon updated successfully");
      setIsCreateDialogOpen(false);
      resetForm();
      fetchCoupons();
    } catch (error) {
      console.error("Error updating coupon:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to update coupon"
      );
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this coupon?")) return;

    try {
      const response = await fetch(`/api/coupons/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete coupon");

      toast.success("Coupon deleted successfully");
      fetchCoupons();
    } catch (error) {
      console.error("Error deleting coupon:", error);
      toast.error("Failed to delete coupon");
    }
  };

  const isExpired = (validUntil: string) => {
    return new Date(validUntil) < new Date();
  };

  const isActive = (coupon: Coupon) => {
    if (!coupon.active) return false;
    if (isExpired(coupon.validUntil)) return false;
    if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit)
      return false;
    return new Date(coupon.validFrom) <= new Date();
  };

  return (
    <RoleGuard allowedRoles={["admin", "owner"]}>
      <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8 gap-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
            <span className="cyberpunk-border inline-block">
              Coupons Management
            </span>
          </h1>
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <Button
              variant="outline"
              size="sm"
              asChild
              className="gap-1 border-primary/30 hover:bg-primary/20 hover:text-primary w-full sm:w-auto"
            >
              <Link href="/admin/store">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 mr-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                  />
                </svg>
                Back to Store
              </Link>
            </Button>
            <Dialog
              open={isCreateDialogOpen}
              onOpenChange={(open) => {
                setIsCreateDialogOpen(open);
                if (!open) resetForm();
              }}
            >
              <DialogTrigger asChild>
                <Button className="gap-2 bg-primary hover:bg-primary/90 w-full sm:w-auto">
                  <Plus className="h-4 w-4" />
                  Create Coupon
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {editingCoupon ? "Edit Coupon" : "Create New Coupon"}
                  </DialogTitle>
                  <DialogDescription>
                    {editingCoupon
                      ? "Update coupon details"
                      : "Create a new discount coupon for your store"}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="code">Coupon Code *</Label>
                      <Input
                        id="code"
                        value={formData.code}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            code: e.target.value.toUpperCase(),
                          })
                        }
                        placeholder="SAVE20"
                      />
                    </div>
                    <div>
                      <Label htmlFor="discountType">Discount Type *</Label>
                      <Select
                        value={formData.discountType}
                        onValueChange={(value: "percentage" | "fixed") =>
                          setFormData({ ...formData, discountType: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="percentage">Percentage</SelectItem>
                          <SelectItem value="fixed">Fixed Amount</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="discountValue">
                      Discount Value *{" "}
                      {formData.discountType === "percentage"
                        ? "(0-100)"
                        : "(USD)"}
                    </Label>
                    <Input
                      id="discountValue"
                      type="number"
                      min="0"
                      max={
                        formData.discountType === "percentage"
                          ? "100"
                          : undefined
                      }
                      step={
                        formData.discountType === "percentage" ? "1" : "0.01"
                      }
                      value={formData.discountValue}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          discountValue: parseFloat(e.target.value) || 0,
                        })
                      }
                    />
                  </div>

                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                      placeholder="Optional description for this coupon"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="minPurchaseAmount">
                        Minimum Purchase (USD)
                      </Label>
                      <Input
                        id="minPurchaseAmount"
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.minPurchaseAmount}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            minPurchaseAmount: e.target.value,
                          })
                        }
                        placeholder="0.00"
                      />
                    </div>
                    {formData.discountType === "percentage" && (
                      <div>
                        <Label htmlFor="maxDiscountAmount">
                          Max Discount (USD)
                        </Label>
                        <Input
                          id="maxDiscountAmount"
                          type="number"
                          min="0"
                          step="0.01"
                          value={formData.maxDiscountAmount}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              maxDiscountAmount: e.target.value,
                            })
                          }
                          placeholder="No limit"
                        />
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="validFrom">Valid From *</Label>
                      <Input
                        id="validFrom"
                        type="datetime-local"
                        value={formData.validFrom}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            validFrom: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="validUntil">Valid Until *</Label>
                      <Input
                        id="validUntil"
                        type="datetime-local"
                        value={formData.validUntil}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            validUntil: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="usageLimit">Total Usage Limit</Label>
                      <Input
                        id="usageLimit"
                        type="number"
                        min="1"
                        value={formData.usageLimit}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            usageLimit: e.target.value,
                          })
                        }
                        placeholder="Unlimited"
                      />
                    </div>
                    <div>
                      <Label htmlFor="userLimit">Per User Limit</Label>
                      <Input
                        id="userLimit"
                        type="number"
                        min="1"
                        value={formData.userLimit}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            userLimit: e.target.value,
                          })
                        }
                        placeholder="Unlimited"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="applicableProducts">
                      Applicable Product IDs (comma-separated)
                    </Label>
                    <Input
                      id="applicableProducts"
                      value={formData.applicableProducts}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          applicableProducts: e.target.value,
                        })
                      }
                      placeholder="product-id-1, product-id-2"
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="active"
                      checked={formData.active}
                      onCheckedChange={(checked) =>
                        setFormData({ ...formData, active: checked })
                      }
                    />
                    <Label htmlFor="active">Active</Label>
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setIsCreateDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={editingCoupon ? handleUpdate : handleCreate}
                    >
                      {editingCoupon ? "Update" : "Create"} Coupon
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {loading ? (
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className="h-16 bg-gray-800 rounded animate-pulse"
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        ) : coupons.length === 0 ? (
          <Card>
            <CardContent className="pt-12 pb-12 text-center">
              <Ticket className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                No coupons yet
              </h3>
              <p className="text-muted-foreground mb-4">
                Create your first coupon to start offering discounts
              </p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>All Coupons</CardTitle>
              <CardDescription>
                Manage discount coupons for your store
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Code</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Value</TableHead>
                      <TableHead>Valid Period</TableHead>
                      <TableHead>Usage</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {coupons.map((coupon) => (
                      <TableRow key={coupon.id}>
                        <TableCell className="font-mono font-semibold">
                          {coupon.code}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              coupon.discountType === "percentage"
                                ? "default"
                                : "secondary"
                            }
                          >
                            {coupon.discountType === "percentage" ? "%" : "$"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {coupon.discountType === "percentage"
                            ? `${coupon.discountValue}%`
                            : `$${coupon.discountValue.toFixed(2)}`}
                        </TableCell>
                        <TableCell className="text-sm">
                          <div>
                            {new Date(coupon.validFrom).toLocaleDateString()}
                          </div>
                          <div className="text-muted-foreground">
                            to{" "}
                            {new Date(coupon.validUntil).toLocaleDateString()}
                          </div>
                        </TableCell>
                        <TableCell>
                          {coupon.usageLimit
                            ? `${coupon.usageCount} / ${coupon.usageLimit}`
                            : coupon.usageCount}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              isActive(coupon) ? "default" : "destructive"
                            }
                          >
                            {isActive(coupon)
                              ? "Active"
                              : isExpired(coupon.validUntil)
                              ? "Expired"
                              : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(coupon)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(coupon.id)}
                              className="text-red-400 hover:text-red-300"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </RoleGuard>
  );
}

export default function CouponsPage() {
  return (
    <Suspense
      fallback={
        <RoleGuard allowedRoles={["admin", "owner"]}>
          <div className="container mx-auto px-4 py-8">
            <div className="flex justify-center items-center py-10">
              <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              <span className="ml-4 text-gray-400">Loading...</span>
            </div>
          </div>
        </RoleGuard>
      }
    >
      <CouponsContent />
    </Suspense>
  );
}
