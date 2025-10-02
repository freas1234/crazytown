'use client';

import { useMaintenanceMode } from '../lib/MaintenanceContext';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';

export default function MaintenanceModeIndicator() {
  const { isMaintenanceMode, toggleMaintenanceMode } = useMaintenanceMode();
  const [isToggling, setIsToggling] = useState(false);
  const [localMaintenanceMode, setLocalMaintenanceMode] = useState(false);

  useEffect(() => {
    setLocalMaintenanceMode(isMaintenanceMode);
  }, [isMaintenanceMode]);

  const handleToggle = async () => {
    setIsToggling(true);
    try {
      console.log('Current maintenance mode before toggle:', localMaintenanceMode);
      // We want to toggle to the opposite state
      const newState = !localMaintenanceMode;
      console.log('Attempting to set maintenance mode to:', newState);
      
      const result = await toggleMaintenanceMode(newState);
      console.log('Toggle result:', result);
      
      setLocalMaintenanceMode(result);
      const status = result ? 'enabled' : 'disabled';
      toast.success(`Maintenance mode ${status}`);
    } catch (error) {
      console.error('Failed to toggle maintenance mode:', error);
      toast.error('Failed to toggle maintenance mode');
    } finally {
      setIsToggling(false);
    }
  };

  return (
    <div className="flex items-center">
      <button
        onClick={handleToggle}
        disabled={isToggling}
        className={`flex items-center px-3 py-1.5 rounded-md transition-colors ${
          isToggling ? 'opacity-70 cursor-not-allowed' : ''
        } ${
          localMaintenanceMode 
            ? 'bg-primary/20 text-primary hover:bg-primary/30 border border-primary/30' 
            : 'bg-accent/20 text-accent hover:bg-accent/30 border border-accent/30'
        }`}
      >
        {isToggling ? (
          <span className="w-2 h-2 rounded-full mr-2 bg-gray-400 animate-pulse"></span>
        ) : (
          <span className={`w-2 h-2 rounded-full mr-2 ${localMaintenanceMode ? 'bg-primary' : 'bg-accent'}`}></span>
        )}
        <span>{isToggling ? 'Updating...' : localMaintenanceMode ? 'Maintenance Mode' : 'Site Online'}</span>
      </button>
    </div>
  );
} 