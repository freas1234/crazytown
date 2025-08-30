'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { RoleGuard } from '../../components/RoleGuard';
import MaintenanceModeIndicator from '../../components/MaintenanceModeIndicator';
import { cn } from '../../lib/utils';
import { Button } from '../../components/ui/button';
import { Separator } from '../../components/ui/separator';
import { useState, useEffect } from 'react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../../components/ui/collapsible';
import { 
  ChevronDown, 
  ChevronRight, 
  Settings, 
  Users, 
  ShoppingBag, 
  FileText, 
  Home, 
  Layout, 
  Briefcase, 
  LogOut, 
  Menu, 
  X,
  LayoutDashboard,
  Store,
  FileCode,
  Gauge,
  BookOpen
} from 'lucide-react';
import { useTranslation } from '../../lib/hooks/useTranslation';
import { usePageContent } from '../../lib/usePageContent';
import { Badge } from '../../components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { useAuth } from '../../lib/AuthContext';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../../components/ui/tooltip';

export default function AdminSidebar() {
  const pathname = usePathname();
  const [contentOpen, setContentOpen] = useState(pathname?.startsWith('/admin/content'));
  const [collapsed, setCollapsed] = useState(false);
  const { t, locale, isRTL } = useTranslation();
  const { user } = useAuth();
  const [adminTranslations, setAdminTranslations] = useState<any>({
    dashboard: "Dashboard",
    content: "Content",
    store: "Store",
    users: "Users",
    orders: "Orders",
    settings: "Settings",
    backToSite: "Back to Site",
    adminPanel: "Admin Panel",
    rules: "Rules"
  });
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchAdminTranslations = async () => {
      try {
        const response = await fetch('/api/admin/content/admin');
        if (response.ok) {
          const data = await response.json();
          if (data.content && data.content[locale] && data.content[locale].sidebar) {
            setAdminTranslations({
              ...adminTranslations,
              ...data.content[locale].sidebar,
              adminPanel: data.content[locale].dashboard?.title || "Admin Panel"
            });
          }
        }
      } catch (error) {
        console.error('Error fetching admin translations:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAdminTranslations();
  }, [locale]);
  
  const isActive = (path: string) => {
    return pathname?.startsWith(path);
  };

  const navItems = [
    {
      name: adminTranslations.dashboard,
      href: '/admin',
      icon: <LayoutDashboard className="h-5 w-5" />,
      exact: true
    },
    {
      name: adminTranslations.content,
      href: '/admin/content',
      icon: <Layout className="h-5 w-5" />,
      hasSubmenu: true,
      badge: 'New'
    },
    {
      name: adminTranslations.store,
      href: '/admin/store',
      icon: <Store className="h-5 w-5" />,
    },
    {
      name: adminTranslations.users,
      href: '/admin/users',
      icon: <Users className="h-5 w-5" />,
    },
    {
      name: adminTranslations.orders,
      href: '/admin/orders',
      icon: <FileText className="h-5 w-5" />,
    },
    {
      name: adminTranslations.settings,
      href: '/admin/settings',
      icon: <Settings className="h-5 w-5" />,
    },
    {
      name: adminTranslations.rules,
      href: '/admin/rules',
      icon: <BookOpen className="h-5 w-5" />,
    }
  ];

  const contentItems = [
    { name: t('about_page', 'About'), href: '/admin/content/about' },
    { name: t('featured_cards', 'Featured Cards'), href: '/admin/content/featured-cards' },
    { name: t('contact_page', 'Contact'), href: '/admin/content/contact' },
    { name: t('site_metadata', 'Metadata'), href: '/admin/content/metadata' },
    { name: t('translations', 'Translations'), href: '/admin/content/translations' },
    { name: t('maintenance', 'Maintenance'), href: '/admin/content/maintenance', badge: 'New' },
  ];

  return (
    <RoleGuard
      allowedRoles={['admin', 'owner']}
      redirectTo="/login"
      fallback={<div>Loading...</div>}
    >
      <aside className={cn(
        "bg-secondary/90 backdrop-blur-lg border-r border-gray-800 h-screen flex-shrink-0 flex flex-col relative z-10 transition-all duration-300 shadow-xl shadow-black/20",
        collapsed ? "w-20" : "w-72",
        isRTL ? "border-l border-r-0" : "border-r border-l-0"
      )}>
      
        {/* Background effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 -left-20 w-40 h-40 bg-primary opacity-10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/4 -right-20 w-40 h-40 bg-primary opacity-10 rounded-full blur-3xl"></div>
          <div className="absolute inset-0 bg-cyber-grid opacity-5"></div>
          
          {/* Animated top border */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/0 via-primary/50 to-primary/0 animate-pulse-slow"></div>
        </div>
        
        <div className="relative z-10 flex flex-col h-full" dir={isRTL ? "rtl" : "ltr"}>
          {/* Header with logo and collapse button */}
          <div className="p-4 border-b border-gray-800/80 flex items-center justify-between">
            <div className={cn("flex items-center", collapsed && "justify-center")}>
              {!collapsed && (
                <h2 className="text-xl font-bold text-white flex items-center">
                  <span className="text-primary mr-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </span>
                  <span className="cyberpunk-border">{adminTranslations.adminPanel}</span>
                </h2>
              )}
              {collapsed && (
                <div className="flex justify-center w-full">
                  <span className="text-primary">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </span>
                </div>
              )}
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setCollapsed(!collapsed)}
              className="text-gray-400 hover:text-white hover:bg-gray-800/50 rounded-full"
            >
              {collapsed ? <Menu className="h-5 w-5" /> : <X className="h-5 w-5" />}
            </Button>
          </div>
          
          {/* Maintenance mode indicator */}
          <div className={cn("p-4", collapsed && "flex justify-center")}>
            <MaintenanceModeIndicator />
          </div>
          
          {/* Navigation menu */}
          <nav className="flex-1 overflow-y-auto py-4 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
            <div className="space-y-1 px-3">
              {navItems.map((item) => 
                item.hasSubmenu ? (
                  <Collapsible 
                    key={item.href} 
                    open={contentOpen} 
                    onOpenChange={setContentOpen}
                    className="w-full"
                  >
                    <CollapsibleTrigger asChild>
                      <Button
                        variant={isActive(item.href) ? "secondary" : "ghost"}
                        className={cn(
                          "w-full justify-between transition-all duration-300 mb-1",
                          isActive(item.href) 
                            ? "bg-primary/20 text-primary border border-primary/30 shadow-[0_0_10px_rgba(255,107,0,0.2)]" 
                            : "text-gray-300 hover:text-white hover:bg-gray-800/50",
                          collapsed && "px-0 justify-center"
                        )}
                      >
                        <div className="flex items-center">
                          <span className={`${!collapsed ? 'mr-3' : ''} ${isActive(item.href) ? 'text-primary' : ''}`}>{item.icon}</span>
                          {!collapsed && (
                            <span className="font-medium">{item.name}</span>
                          )}
                          {!collapsed && item.badge && (
                            <Badge className="ml-2 bg-blue-500 text-white text-[10px] py-0 px-1.5">{item.badge}</Badge>
                          )}
                        </div>
                        {!collapsed && (contentOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />)}
                      </Button>
                    </CollapsibleTrigger>
                    {!collapsed && (
                      <CollapsibleContent className="pl-4 pt-1 space-y-1">
                        {contentItems.map((subItem) => (
                          <Button
                            key={subItem.href}
                            variant="ghost"
                            className={cn(
                              "w-full justify-start transition-all duration-300 pl-6 mb-1",
                              isActive(subItem.href) 
                                ? "bg-primary/10 text-primary" 
                                : "text-gray-300 hover:text-white hover:bg-gray-800/30",
                              isRTL && "pr-6 pl-0"
                            )}
                            asChild
                          >
                            <Link href={subItem.href} className="flex items-center justify-between w-full">
                              <span>{subItem.name}</span>
                              {subItem.badge && (
                                <Badge className={cn(
                                  "bg-blue-500 text-white text-[10px] py-0 px-1.5",
                                  isRTL ? "mr-2" : "ml-2"
                                )}>
                                  {subItem.badge}
                                </Badge>
                              )}
                            </Link>
                          </Button>
                        ))}
                      </CollapsibleContent>
                    )}
                  </Collapsible>
                ) : (
                  <TooltipProvider key={item.href}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant={isActive(item.href) && (!item.exact || pathname === item.href) ? "secondary" : "ghost"}
                          className={cn(
                            "w-full justify-start transition-all duration-300 mb-1",
                            isActive(item.href) && (!item.exact || pathname === item.href)
                              ? "bg-primary/20 text-primary border border-primary/30 shadow-[0_0_10px_rgba(255,107,0,0.2)]" 
                              : "text-gray-300 hover:text-white hover:bg-gray-800/50",
                            collapsed && "px-0 justify-center",
                            isRTL && !collapsed && "pr-3 pl-0"
                          )}
                          asChild
                        >
                          <Link href={item.href} className="flex items-center">
                            <span className={cn(
                              isActive(item.href) && (!item.exact || pathname === item.href) ? 'text-primary' : '',
                              !collapsed ? (isRTL ? 'ml-3' : 'mr-3') : ''
                            )}>
                              {item.icon}
                            </span>
                            {!collapsed && (
                              <span className="flex items-center font-medium">
                                {item.name}
                                {item.badge && (
                                  <Badge className={cn(
                                    "bg-blue-500 text-white text-[10px] py-0 px-1.5",
                                    isRTL ? "mr-2" : "ml-2"
                                  )}>
                                    {item.badge}
                                  </Badge>
                                )}
                              </span>
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
                )
              )}
            </div>
          </nav>
          
          <Separator className="my-2 bg-gray-800" />
          
          {/* Back to site button */}
          <div className="p-4 relative z-10">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="outline" 
                    className={cn(
                      "w-full border-primary/30 hover:bg-primary/20 hover:text-primary transition-all duration-300",
                      collapsed ? "justify-center" : "justify-start"
                    )} 
                    asChild
                  >
                    <Link href="/" className="flex items-center text-gray-300 hover:text-primary">
                      <LogOut className={`h-5 w-5 ${!collapsed ? 'mr-2' : ''}`} />
                      {!collapsed && adminTranslations.backToSite}
                    </Link>
                  </Button>
                </TooltipTrigger>
                {collapsed && (
                  <TooltipContent side="right">
                    {adminTranslations.backToSite}
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