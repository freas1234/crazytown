'use client';

import { ReactNode, useEffect, useState } from 'react';
import { Toaster } from '../components/ui/sonner';
import MaintenanceMode from '../components/MaintenanceMode';
import { useAuth } from '../lib/AuthContext';
import { useRouter, usePathname } from 'next/navigation';

function MaintenanceWrapper({ children }: { children: ReactNode }) {
  const { user, isAdmin } = useAuth();
  const [isMaintenanceMode, setIsMaintenanceMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [maintenanceContent, setMaintenanceContent] = useState<any>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const checkMaintenanceMode = async () => {
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
            
            // If maintenance mode is on and user is not admin and not already on maintenance page
            if (data.maintenanceMode && !isAdmin && pathname !== '/maintenance') {
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
  }, [isAdmin, pathname, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-950">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (isMaintenanceMode && !isAdmin) {
    console.log('Showing maintenance mode page');
    return <MaintenanceMode customTitle={maintenanceContent?.title} customMessage={maintenanceContent?.message} />;
  }

  console.log('Not in maintenance mode or user is admin, showing normal content');
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
