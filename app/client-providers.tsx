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
            console.log('Current pathname:', pathname);
            
            // If maintenance mode is on and user is not admin and not already on maintenance page or login page
            if (data.maintenanceMode && !isAdmin && pathname !== '/maintenance' && pathname !== '/login') {
              console.log('Redirecting non-admin user to maintenance page');
              router.push('/maintenance');
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
  }, [authLoading, isAdmin, pathname, router]);

  if (isLoading || authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-950">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Show maintenance page only if maintenance mode is on AND user is not admin AND not on login page
  if (isMaintenanceMode && !isAdmin && pathname !== '/login') {
    console.log('Showing maintenance mode page for non-admin user');
    return <MaintenanceMode customTitle={maintenanceContent?.title} customMessage={maintenanceContent?.message} />;
  }

  console.log('Showing normal content - Maintenance mode:', isMaintenanceMode, 'Is admin:', isAdmin, 'Pathname:', pathname);
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
