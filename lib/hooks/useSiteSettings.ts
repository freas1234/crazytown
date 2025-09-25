import { useState, useEffect } from 'react';

interface SiteSettings {
  siteName: string;
  siteDescription: string;
  contactEmail: string;
  discordInviteUrl: string;
  enableRegistration: boolean;
  enableStore: boolean;
  enableJobs: boolean;
  maintenanceMode: boolean;
  maintenanceContent: {
    en: {
      title: string;
      message: string;
    };
    ar: {
      title: string;
      message: string;
    };
  };
}

export function useSiteSettings() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/admin/settings');
        
        if (!response.ok) {
          throw new Error('Failed to fetch settings');
        }
        
        const data = await response.json();
        if (data.success && data.settings) {
          setSettings(data.settings);
        } else {
          // Fallback to default settings
          setSettings({
            siteName: 'Crazy Town',
            siteDescription: 'The official Crazy Town community website',
            contactEmail: 'admin@crazytown.com',
            discordInviteUrl: 'https://discord.gg/crazytown',
            enableRegistration: true,
            enableStore: true,
            enableJobs: false,
            maintenanceMode: false,
            maintenanceContent: {
              en: {
                title: "Site Under Maintenance",
                message: "We're currently performing scheduled maintenance. Please check back soon."
              },
              ar: {
                title: "الموقع تحت الصيانة",
                message: "نحن نقوم حاليًا بإجراء صيانة مجدولة. يرجى التحقق مرة أخرى قريبًا."
              }
            }
          });
        }
      } catch (error) {
        console.error('Error fetching site settings:', error);
        setError('Failed to load site settings');
        // Set fallback settings
        setSettings({
          siteName: 'Crazy Town',
          siteDescription: 'The official Crazy Town community website',
          contactEmail: 'admin@crazytown.com',
          discordInviteUrl: 'https://discord.gg/crazytown',
          enableRegistration: true,
          enableStore: true,
          enableJobs: false,
          maintenanceMode: false,
          maintenanceContent: {
            en: {
              title: "Site Under Maintenance",
              message: "We're currently performing scheduled maintenance. Please check back soon."
            },
            ar: {
              title: "الموقع تحت الصيانة",
              message: "نحن نقوم حاليًا بإجراء صيانة مجدولة. يرجى التحقق مرة أخرى قريبًا."
            }
          }
        });
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
    
    // Listen for settings updates
    const handleSettingsUpdate = () => {
      fetchSettings();
    };
    
    window.addEventListener('settingsUpdated', handleSettingsUpdate);
    
    return () => {
      window.removeEventListener('settingsUpdated', handleSettingsUpdate);
    };
  }, []);

  return { settings, loading, error };
}
