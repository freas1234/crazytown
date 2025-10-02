'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { RoleGuard } from '../../components/RoleGuard';
import MaintenanceModeIndicator from '../../components/MaintenanceModeIndicator';
import { cn } from '../../lib/utils';
import { Button } from '../../components/ui/button';
import { Separator } from '../../components/ui/separator';
import { useState } from 'react';
import { 
  Settings, 
  Users, 
  ShoppingCart, 
  FileText, 
  LayoutDashboard,
  Store,
  FileCode,
  Globe,
  Wrench,
  LogOut,
  Menu,
  X,
  Package,
  ShoppingBag,
  BookOpen,
  Star,
  Shield,
  Lock
} from 'lucide-react';
import { useTranslation } from '../../lib/hooks/useTranslation';
import { useAuth } from '../../lib/AuthContext';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../../components/ui/tooltip';

export default function AdminSidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const { isRTL } = useTranslation();
  const { user } = useAuth();
  
  const isActive = (path: string) => {
    return pathname === path || (path !== '/admin' && pathname?.startsWith(path));
  };

  const navItems = [
    {
      name: 'Dashboard',
      href: '/admin',
      icon: <LayoutDashboard className="h-5 w-5" />,
      exact: true
    },
    {
      name: 'Store',
      href: '/admin/store',
      icon: <Store className="h-5 w-5" />,
    },
    {
      name: 'Products',
      href: '/admin/store/products',
      icon: <Package className="h-5 w-5" />,
    },
    {
      name: 'Categories',
      href: '/admin/store/categories',
      icon: <FileCode className="h-5 w-5" />,
    },
    {
      name: 'Featured Cards',
      href: '/admin/content/featured-cards',
      icon: <Star className="h-5 w-5" />,
    },
    {
      name: 'Maintenance',
      href: '/admin/content/maintenance',
      icon: <Shield className="h-5 w-5" />,
    },
    {
      name: 'Security',
      href: '/admin/security',
      icon: <Lock className="h-5 w-5" />,
    },
    {
      name: 'Orders',
      href: '/admin/orders',
      icon: <ShoppingCart className="h-5 w-5" />,
    },
    {
      name: 'Users',
      href: '/admin/users',
      icon: <Users className="h-5 w-5" />,
    },
    {
      name: 'Content',
      href: '/admin/content',
      icon: <FileText className="h-5 w-5" />,
    },
    {
      name: 'Translations',
      href: '/admin/content/translations',
      icon: <Globe className="h-5 w-5" />,
    },
    {
      name: 'Rules',
      href: '/admin/rules',
      icon: <BookOpen className="h-5 w-5" />,
    },
    {
      name: 'Settings',
      href: '/admin/settings',
      icon: <Settings className="h-5 w-5" />,
    }
  ];

  return (
    <RoleGuard
      allowedRoles={['admin', 'owner']}
      fallback={<div className="flex items-center justify-center min-h-screen bg-background">
        <div className="animate-pulse p-4">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>}
    >
      <aside className={cn(
        "bg-card/95 backdrop-blur-lg border-r border-border h-screen flex-shrink-0 flex flex-col relative z-10 transition-all duration-300",
        collapsed ? "w-16" : "w-64",
        isRTL ? "border-l border-r-0" : "border-r border-l-0"
      )}>
        
        <div className="relative z-10 flex flex-col h-full" dir={isRTL ? "rtl" : "ltr"}>
          {/* Header */}
          <div className="p-4 border-b border-border flex items-center justify-between">
              {!collapsed && (
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Wrench className="h-6 w-6 text-primary" />
                Admin
                </h2>
              )}
              {collapsed && (
              <Wrench className="h-6 w-6 text-primary mx-auto" />
            )}
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setCollapsed(!collapsed)}
              className="text-muted-foreground hover:text-foreground hover:bg-accent/10 rounded-md h-8 w-8"
            >
              {collapsed ? <Menu className="h-4 w-4" /> : <X className="h-4 w-4" />}
            </Button>
          </div>
          
          {/* Maintenance mode indicator */}
          <div className="p-4 border-b border-border">
            <div className={cn(
              "flex items-center",
              collapsed ? "justify-center" : "justify-start"
            )}>
              <MaintenanceModeIndicator />
            </div>
          </div>
          
          {/* Navigation menu */}
          <nav className="flex-1 overflow-y-auto py-4">
            <div className="space-y-1 px-3">
              {navItems.map((item) => (
                <TooltipProvider key={item.href}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant={isActive(item.href) ? "secondary" : "ghost"}
                        className={cn(
                          "w-full justify-start transition-all duration-200 mb-1 h-10",
                          isActive(item.href) 
                            ? "bg-primary/20 text-primary border border-primary/30 shadow-neon" 
                            : "text-muted-foreground hover:text-foreground hover:bg-accent/10",
                          collapsed && "px-0 justify-center"
                        )}
                        asChild
                      >
                        <Link href={item.href} className="flex items-center w-full">
                          <span className={cn(
                            isActive(item.href) ? 'text-primary' : '',
                            !collapsed ? (isRTL ? 'ml-3' : 'mr-3') : ''
                          )}>
                            {item.icon}
                          </span>
                          {!collapsed && (
                            <span className="font-medium">{item.name}</span>
                          )}
                        </Link>
                        </Button>
                      </TooltipTrigger>
                      {collapsed && (
                        <TooltipContent side="right">
                          {item.name}
                        </TooltipContent>
                      )}
                    </Tooltip>
                  </TooltipProvider>
              ))}
            </div>
          </nav>
          
          <Separator className="my-2 bg-border" />
          
          {/* User info and back to site */}
          <div className="p-4 space-y-3">
            {!collapsed && (
              <div className="flex items-center gap-3 p-2 bg-accent/10 rounded-lg border border-accent/20">
                <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                  <span className="text-primary text-sm font-medium">
                    {user?.name?.charAt(0) || 'A'}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {user?.name || 'Admin'}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {user?.role || 'Administrator'}
                  </p>
                </div>
              </div>
            )}
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="outline" 
                    className={cn(
                      "w-full border-border hover:bg-accent/10 hover:text-foreground transition-all duration-200",
                      collapsed ? "justify-center" : "justify-start"
                    )} 
                    asChild
                  >
                    <Link href="/" className="flex items-center text-muted-foreground hover:text-foreground">
                      <LogOut className={cn("h-4 w-4", !collapsed && (isRTL ? 'ml-2' : 'mr-2'))} />
                      {!collapsed && 'Back to Site'}
                    </Link>
                  </Button>
                </TooltipTrigger>
                {collapsed && (
                  <TooltipContent side="right">
                    Back to Site
                  </TooltipContent>
                )}
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </aside>
    </RoleGuard>
  );
} 