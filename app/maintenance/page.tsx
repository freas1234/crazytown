'use client';

import { useState, useEffect } from 'react';
import MaintenanceMode from '../../components/MaintenanceMode';
import { useTranslation } from '../../lib/hooks/useTranslation';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../lib/AuthContext';

export default function MaintenancePage() {
  const [customContent, setCustomContent] = useState<{
    title: { en: string; ar: string };
    message: { en: string; ar: string };
  } | null>(null);
  const [isMaintenanceMode, setIsMaintenanceMode] = useState(true);
  const [loading, setLoading] = useState(true);
  const { locale } = useTranslation();
  const router = useRouter();
  const { isAdmin } = useAuth();

  useEffect(() => {
    const fetchMaintenanceContent = async () => {
      try {
        console.log('Maintenance page: Fetching content');
        const response = await fetch('/api/maintenance');
        if (response.ok) {
          const data = await response.json();
          console.log('Maintenance page: API response', data);
          
          // If maintenance mode is disabled, redirect non-admin users to home
          if (!data.maintenanceMode && !isAdmin) {
            console.log('Maintenance mode is disabled, redirecting to home');
            router.push('/');
            return;
          }
          
          setIsMaintenanceMode(data.maintenanceMode);
          
          if (data.content) {
            setCustomContent({
              title: {
                en: data.content.en?.title || '',
                ar: data.content.ar?.title || ''
              },
              message: {
                en: data.content.en?.message || '',
                ar: data.content.ar?.message || ''
              }
            });
          }
        }
      } catch (error) {
        console.error('Error fetching maintenance content:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMaintenanceContent();
  }, [locale, router, isAdmin]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-950">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Show maintenance page for everyone except admins when maintenance mode is enabled
  // Admins can see the page regardless of maintenance status (for preview purposes)
  if (!isMaintenanceMode && !isAdmin) {
    console.log('Maintenance mode is disabled and user is not admin, returning null');
    return null;
  }

  console.log('Showing maintenance page');
  return <MaintenanceMode 
    customTitle={customContent?.title} 
    customMessage={customContent?.message} 
  />;
} 