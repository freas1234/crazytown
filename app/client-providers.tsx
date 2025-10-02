'use client';

import { ReactNode, useEffect, useState } from 'react';
import { Toaster } from '../components/ui/sonner';
import MaintenanceMode from '../components/MaintenanceMode';
import { useAuth } from '../lib/AuthContext';
import { useRouter, usePathname } from 'next/navigation';

function MaintenanceWrapper({ children }: { children: ReactNode }) {
  const { user, isAdmin, isLoading: authLoading } = useAuth();
  const [isMaintenanceMode, setIsMaintenanceMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [maintenanceContent, setMaintenanceContent] = useState<any>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const checkMaintenanceMode = async () => {
      // Wait for auth to load first
      if (authLoading) return;
      
      try {
        console.log('Checking maintenance mode...');
        const response = await fetch('/api/maintenance');
        if (response.ok) {
          const data = await response.json();
          console.log('Maintenance API response:', data);
          if (data.success) {
            setIsMaintenanceMode(data.maintenanceMode);
            if (data.content) {
              setMaintenanceContent(data.content);
            }
            console.log('Maintenance mode is:', data.maintenanceMode);
            console.log('User is admin:', isAdmin);
            console.log('User role:', user?.role);
            console.log('Current pathname:', pathname);
            
            // If maintenance mode is on and user is not admin and not already on maintenance page or login page or admin pages
            if (data.maintenanceMode && !isAdmin && pathname !== '/maintenance' && pathname !== '/login' && !pathname.startsWith('/admin')) {
              console.log('Redirecting non-admin user to maintenance page');
              router.push('/maintenance');
            } else if (data.maintenanceMode && isAdmin && pathname.startsWith('/admin')) {
              console.log('Admin accessing admin panel during maintenance - allowing access');
            }
          }
        }
      } catch (error) {
        console.error('Error checking maintenance mode:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkMaintenanceMode();
  }, [authLoading, isAdmin, pathname, router, user]);

  // Additional effect to handle route changes
  useEffect(() => {
    if (!authLoading && !isLoading) {
      console.log('Route change detected - Maintenance mode:', isMaintenanceMode, 'Is admin:', isAdmin, 'User role:', user?.role, 'Pathname:', pathname);
    }
  }, [pathname, authLoading, isLoading, isMaintenanceMode, isAdmin, user]);

  if (isLoading || authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // If admin is accessing admin panel during maintenance, allow access
  if (isMaintenanceMode && isAdmin && pathname.startsWith('/admin')) {
    console.log('Admin accessing admin panel during maintenance - showing admin content');
    return <>{children}</>;
  }

  // If no user and trying to access admin panel, let middleware handle the redirect
  if (!user && pathname.startsWith('/admin')) {
    console.log('No user accessing admin panel - letting middleware handle redirect');
    return <>{children}</>;
  }

  // If user exists but isAdmin is false and trying to access admin panel, show maintenance page
  if (isMaintenanceMode && user && !isAdmin && pathname.startsWith('/admin')) {
    console.log('Non-admin user trying to access admin panel during maintenance - showing maintenance page');
    return <MaintenanceMode customTitle={maintenanceContent?.title} customMessage={maintenanceContent?.message} />;
  }

  // Show maintenance page only if maintenance mode is on AND user is not admin AND not on login page AND not on admin pages
  if (isMaintenanceMode && !isAdmin && pathname !== '/login' && !pathname.startsWith('/admin')) {
    console.log('Showing maintenance mode page for non-admin user');
    return <MaintenanceMode customTitle={maintenanceContent?.title} customMessage={maintenanceContent?.message} />;
  }

  console.log('Showing normal content - Maintenance mode:', isMaintenanceMode, 'Is admin:', isAdmin, 'User role:', user?.role, 'Pathname:', pathname);
  return <>{children}</>;
}

export default function ClientProviders({ children }: { children: ReactNode }) {
  return (
    <>
      <MaintenanceWrapper>
        {children}
      </MaintenanceWrapper>
      <Toaster />
    </>
  );
}
