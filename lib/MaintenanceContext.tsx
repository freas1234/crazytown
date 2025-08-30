'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { useRouter } from 'next/navigation';

interface MaintenanceContextType {
  isMaintenanceMode: boolean;
  toggleMaintenanceMode: (enabled?: boolean) => Promise<boolean>;
}

const MaintenanceContext = createContext<MaintenanceContextType>({
  isMaintenanceMode: false,
  toggleMaintenanceMode: async () => false,
});

export function MaintenanceProvider({ children }: { children: ReactNode }) {
  const [isMaintenanceMode, setIsMaintenanceMode] = useState(false);
  const { isAdmin } = useAuth();
  const router = useRouter();

  useEffect(() => {
    fetchMaintenanceStatus();
  }, []);

  const fetchMaintenanceStatus = async () => {
    try {
      console.log('Fetching maintenance status...');
      const response = await fetch('/api/maintenance');
      if (response.ok) {
        const data = await response.json();
        console.log('Maintenance status response:', data);
        if (data.success !== false) {
          setIsMaintenanceMode(data.maintenanceMode);
          console.log('Set maintenance mode to:', data.maintenanceMode);
          
          // If maintenance mode is enabled and user is not admin, redirect to maintenance page
          if (data.maintenanceMode && !isAdmin) {
            router.push('/maintenance');
          }
        }
      }
    } catch (error) {
      console.error('Error fetching maintenance status:', error);
    }
  };

  const toggleMaintenanceMode = async (enabled?: boolean) => {
    try {
      const action = enabled !== undefined ? (enabled ? 'enable' : 'disable') : 'toggle';
      console.log('Toggling maintenance mode with action:', action);
      
      const response = await fetch('/api/admin/maintenance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to toggle maintenance mode');
      }
      
      const data = await response.json();
      console.log('Toggle maintenance mode response:', data);
      
      if (data.success) {
        setIsMaintenanceMode(data.maintenanceMode);
        return data.maintenanceMode;
      }
      
      return false;
    } catch (error) {
      console.error('Error toggling maintenance mode:', error);
      throw error; // Re-throw the error so it can be caught by the component
    }
  };

  return (
    <MaintenanceContext.Provider value={{ isMaintenanceMode, toggleMaintenanceMode }}>
      {children}
    </MaintenanceContext.Provider>
  );
}

export function useMaintenanceMode() {
  return useContext(MaintenanceContext);
} 