'use client';

import { useState } from 'react';
import Link from 'next/link';
import { RoleGuard } from '../../components/RoleGuard';
import { useAuth } from '../../lib/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import MaintenanceModeIndicator from '../../components/MaintenanceModeIndicator';
import { 
  Activity, 
  BarChart3, 
  CheckCircle, 
  Users, 
  Plus,
  UserPlus,
  Edit,
  FileCode,
  Settings,
  LayoutDashboard,
  Package,
  ShoppingCart,
  Globe,
  Shield,
  Database,
  RefreshCw
} from 'lucide-react';
import { useTranslation } from '../../lib/hooks/useTranslation';

export default function AdminDashboard() {
  const { user, isLoading } = useAuth();
  const { isRTL } = useTranslation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 p-4 md:p-6 lg:p-8">
        <div className="space-y-6">
          {/* Header Skeleton */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="space-y-2">
              <div className="h-8 w-64 bg-gray-800 rounded animate-pulse"></div>
              <div className="h-4 w-32 bg-gray-800 rounded animate-pulse"></div>
            </div>
            <div className="h-10 w-24 bg-gray-800 rounded animate-pulse"></div>
          </div>

          {/* System Status Skeleton */}
          <div className="bg-gray-800/50 rounded-lg p-4 md:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="h-3 w-3 bg-gray-700 rounded-full animate-pulse"></div>
                <div className="space-y-1">
                  <div className="h-4 w-24 bg-gray-700 rounded animate-pulse"></div>
                  <div className="h-3 w-32 bg-gray-700 rounded animate-pulse"></div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="h-4 w-16 bg-gray-700 rounded animate-pulse"></div>
                <div className="h-4 w-16 bg-gray-700 rounded animate-pulse"></div>
                <div className="h-4 w-16 bg-gray-700 rounded animate-pulse"></div>
              </div>
            </div>
          </div>

          {/* Stats Cards Skeleton */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-gray-800/50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <div className="h-4 w-16 bg-gray-700 rounded animate-pulse"></div>
                    <div className="h-6 w-12 bg-gray-700 rounded animate-pulse"></div>
                  </div>
                  <div className="h-8 w-8 bg-gray-700 rounded animate-pulse"></div>
                </div>
              </div>
            ))}
          </div>

          {/* Main Content Skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 bg-gray-800/50 rounded-lg p-4">
              <div className="space-y-3">
                <div className="h-6 w-24 bg-gray-700 rounded animate-pulse"></div>
                <div className="space-y-2">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-10 w-full bg-gray-700 rounded animate-pulse"></div>
                  ))}
                </div>
              </div>
            </div>
            <div className="lg:col-span-2 bg-gray-800/50 rounded-lg p-4">
              <div className="space-y-4">
                <div className="h-6 w-32 bg-gray-700 rounded animate-pulse"></div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-20 bg-gray-700 rounded animate-pulse"></div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Maintenance Mode Skeleton */}
          <div className="bg-gray-800/50 rounded-lg p-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="space-y-1">
                <div className="h-4 w-32 bg-gray-700 rounded animate-pulse"></div>
                <div className="h-3 w-48 bg-gray-700 rounded animate-pulse"></div>
              </div>
              <div className="h-8 w-24 bg-gray-700 rounded animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <RoleGuard allowedRoles={['admin', 'owner']} redirectTo="/login">
      <div className="min-h-screen bg-gray-900 p-4 md:p-6 lg:p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3">
                <LayoutDashboard className="h-6 w-6 md:h-8 md:w-8 text-primary" />
              <span className="cyberpunk-border inline-block">Admin Dashboard</span>
            </h1>
              <p className="text-gray-400 mt-2">Welcome back, {user?.name || 'Administrator'}</p>
          </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => window.location.reload()} 
              className="gap-2 border-primary/30 hover:bg-primary/20 hover:text-primary transition-all duration-300 w-fit"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
          </div>
        </div>
        
        {/* System Status */}
        <div className="mb-8">
          <Card className="bg-secondary/50 border-gray-800 backdrop-blur-sm">
            <CardContent className="p-4 md:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-4">
            <div className="h-3 w-3 bg-green-500 rounded-full animate-pulse"></div>
            <div>
              <h3 className="text-sm font-medium text-white">System Status</h3>
              <p className="text-xs text-gray-400">All systems operational</p>
            </div>
          </div>
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Database className="h-4 w-4 text-green-400" />
                    <span className="text-green-400">Database</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-green-400" />
                    <span className="text-green-400">Translations</span>
                          </div>
                          <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-green-400" />
                    <span className="text-green-400">Auth</span>
                  </div>
                          </div>
                        </div>
            </CardContent>
          </Card>
                    </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-gradient-to-br from-blue-500/20 to-blue-500/5 border-blue-500/20 text-blue-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-400">System</p>
                  <p className="text-2xl font-bold">Online</p>
                    </div>
                <Activity className="h-8 w-8 text-blue-500" />
                    </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500/20 to-green-500/5 border-green-500/20 text-green-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                          <div>
                  <p className="text-sm font-medium text-green-400">Users</p>
                  <p className="text-2xl font-bold">0</p>
                          </div>
                <Users className="h-8 w-8 text-green-500" />
                          </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500/20 to-purple-500/5 border-purple-500/20 text-purple-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-400">Orders</p>
                  <p className="text-2xl font-bold">0</p>
                        </div>
                <ShoppingCart className="h-8 w-8 text-purple-500" />
                    </div>
                </CardContent>
              </Card>
          
          <Card className="bg-gradient-to-br from-amber-500/20 to-amber-500/5 border-amber-500/20 text-amber-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-amber-400">Revenue</p>
                  <p className="text-2xl font-bold">$0</p>
                </div>
                <BarChart3 className="h-8 w-8 text-amber-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Quick Actions */}
          <Card className="lg:col-span-1 bg-secondary/50 border-gray-800 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                    Quick Actions
                  </CardTitle>
                  <CardDescription className="text-gray-400">Common admin tasks</CardDescription>
                </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start border-blue-500/30 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 gap-2" asChild>
                <Link href="/admin/store/products">
                      <Plus className="h-4 w-4" />
                  Add Product
                    </Link>
                  </Button>
                  
              <Button variant="outline" className="w-full justify-start border-green-500/30 bg-green-500/10 hover:bg-green-500/20 text-green-400 gap-2" asChild>
                    <Link href="/admin/users">
                      <UserPlus className="h-4 w-4" />
                  Add User
                    </Link>
                  </Button>
                  
              <Button variant="outline" className="w-full justify-start border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 gap-2" asChild>
                <Link href="/admin/content/translations">
                      <Edit className="h-4 w-4" />
                  Translations
                    </Link>
                  </Button>

              <Button variant="outline" className="w-full justify-start border-teal-500/30 bg-teal-500/10 hover:bg-teal-500/20 text-teal-400 gap-2" asChild>
                    <Link href="/admin/rules">
                      <FileCode className="h-4 w-4" />
                      Manage Rules
                    </Link>
                  </Button>
                  
              <Button variant="outline" className="w-full justify-start border-purple-500/30 bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 gap-2" asChild>
                    <Link href="/admin/settings">
                      <Settings className="h-4 w-4" />
                  Settings
                    </Link>
                  </Button>
                </CardContent>
              </Card>

          {/* Store Management */}
          <Card className="lg:col-span-2 bg-secondary/50 border-gray-800 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Package className="h-5 w-5 text-primary" />
                Store Management
                    </CardTitle>
              <CardDescription className="text-gray-400">Manage your online store</CardDescription>
              </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Button asChild className="h-20 flex flex-col items-center justify-center space-y-2 bg-blue-500/10 hover:bg-blue-500/20 border-blue-500/30 text-blue-400">
                  <Link href="/admin/store/products">
                    <Package className="h-6 w-6" />
                    <span>Products</span>
                  </Link>
                    </Button>
                
                <Button asChild className="h-20 flex flex-col items-center justify-center space-y-2 bg-green-500/10 hover:bg-green-500/20 border-green-500/30 text-green-400">
                  <Link href="/admin/store/categories">
                    <FileCode className="h-6 w-6" />
                    <span>Categories</span>
                          </Link>
                </Button>
                
                <Button asChild className="h-20 flex flex-col items-center justify-center space-y-2 bg-purple-500/10 hover:bg-purple-500/20 border-purple-500/30 text-purple-400">
                  <Link href="/admin/orders">
                    <ShoppingCart className="h-6 w-6" />
                    <span>Orders</span>
                            </Link>
                          </Button>
                
                <Button asChild className="h-20 flex flex-col items-center justify-center space-y-2 bg-amber-500/10 hover:bg-amber-500/20 border-amber-500/30 text-amber-400">
                  <Link href="/admin/content/translations">
                    <Globe className="h-6 w-6" />
                    <span>Translations</span>
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Maintenance Mode Status */}
        <Card className="bg-secondary/50 border-gray-800 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h3 className="text-sm font-medium text-white mb-1">Maintenance Mode</h3>
                <p className="text-xs text-gray-400">Control site maintenance status</p>
              </div>
              <MaintenanceModeIndicator />
            </div>
          </CardContent>
            </Card>
      </div>
    </RoleGuard>
  );
} 