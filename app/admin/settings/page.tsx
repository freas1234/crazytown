'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../../lib/AuthContext';
import { RoleGuard } from '../../../components/RoleGuard';

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

export default function AdminSettings() {
  const { user: currentUser, isLoading: authLoading } = useAuth();
  const [settings, setSettings] = useState<SiteSettings>({
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
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

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
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      setError('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);
      
      const response = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      });
      
      if (!response.ok) {
        throw new Error('Failed to save settings');
      }
      
      const data = await response.json();
      if (data.success) {
        setSuccess('Settings saved successfully');
        // Dispatch event to update all pages
        window.dispatchEvent(new CustomEvent('settingsUpdated'));
        // Refresh the page to show updated settings
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else {
        throw new Error(data.error || 'Failed to save settings');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      setError('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleMaintenanceModeToggle = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const enabled = e.target.checked;
    
    try {
      setError(null);
      
      const response = await fetch('/api/admin/maintenance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          enabled,
          content: settings.maintenanceContent
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to toggle maintenance mode');
      }
      
      const data = await response.json();
      if (data.success) {
        setSettings(prev => ({
          ...prev,
          maintenanceMode: data.maintenanceMode
        }));
        
        setSuccess(`Maintenance mode ${data.maintenanceMode ? 'enabled' : 'disabled'}`);
      } else {
        throw new Error(data.error || 'Failed to toggle maintenance mode');
      }
    } catch (error) {
      console.error('Error toggling maintenance mode:', error);
      setError('Failed to toggle maintenance mode');
      
      setSettings(prev => ({
        ...prev,
        maintenanceMode: !enabled
      }));
    }
  };

  const handleMaintenanceContentChange = (
    lang: 'en' | 'ar', 
    field: 'title' | 'message', 
    value: string
  ) => {
    setSettings(prev => ({
      ...prev,
      maintenanceContent: {
        ...prev.maintenanceContent,
        [lang]: {
          ...prev.maintenanceContent[lang],
          [field]: value
        }
      }
    }));
  };

  const saveMaintenanceContent = async () => {
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);
      
      const response = await fetch('/api/admin/maintenance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          content: settings.maintenanceContent
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to save maintenance content');
      }
      
      const data = await response.json();
      if (data.success) {
        setSuccess('Maintenance content saved successfully');
      } else {
        throw new Error(data.error || 'Failed to save maintenance content');
      }
    } catch (error) {
      console.error('Error saving maintenance content:', error);
      setError('Failed to save maintenance content');
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);
        
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSuccess('Settings saved successfully');
    } catch (error) {
      console.error('Error saving settings:', error);
      setError('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <RoleGuard allowedRoles={['admin', 'owner']} redirectTo="/login">
      {(loading || authLoading) ? (
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-400">Loading settings...</p>
          </div>
        </div>
      ) : (
        <div>
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-white">
              <span className="cyberpunk-border inline-block">Site Settings</span>
            </h1>
            <p className="text-gray-400 mt-1">Configure your website settings</p>
          </div>
          
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-6 animate-fade-in">
              <p className="text-red-400">{error}</p>
            </div>
          )}
          
          {success && (
            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 mb-6 animate-fade-in">
              <p className="text-green-400">{success}</p>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="game-card border-gray-800 bg-secondary/80 backdrop-blur-sm">
              <h2 className="text-xl font-semibold text-white mb-4">
                <span className="text-primary">General Settings</span>
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="siteName" className="block text-sm font-medium text-gray-300 mb-1">
                    Site Name
                  </label>
                  <input
                    type="text"
                    id="siteName"
                    name="siteName"
                    value={settings.siteName}
                    onChange={handleChange}
                    className="w-full bg-gray-700/80 border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:border-primary"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="contactEmail" className="block text-sm font-medium text-gray-300 mb-1">
                    Contact Email
                  </label>
                  <input
                    type="email"
                    id="contactEmail"
                    name="contactEmail"
                    value={settings.contactEmail}
                    onChange={handleChange}
                    className="w-full bg-gray-700/80 border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:border-primary"
                    required
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label htmlFor="siteDescription" className="block text-sm font-medium text-gray-300 mb-1">
                    Site Description
                  </label>
                  <textarea
                    id="siteDescription"
                    name="siteDescription"
                    value={settings.siteDescription}
                    onChange={handleChange}
                    rows={3}
                    className="w-full bg-gray-700/80 border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:border-primary"
                  />
                </div>
                
                <div>
                  <label htmlFor="discordInviteUrl" className="block text-sm font-medium text-gray-300 mb-1">
                    Discord Invite URL
                  </label>
                  <input
                    type="url"
                    id="discordInviteUrl"
                    name="discordInviteUrl"
                    value={settings.discordInviteUrl}
                    onChange={handleChange}
                    className="w-full bg-gray-700/80 border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:border-primary"
                  />
                </div>
              </div>
            </div>
            
            <div className="game-card border-gray-800 bg-secondary/80 backdrop-blur-sm">
              <h2 className="text-xl font-semibold text-white mb-4">
                <span className="text-primary">Feature Settings</span>
              </h2>
              
              <div className="space-y-4">
                <div className="flex items-center p-2 hover:bg-gray-800/50 rounded-md transition-colors">
                  <input
                    type="checkbox"
                    id="enableRegistration"
                    name="enableRegistration"
                    checked={settings.enableRegistration}
                    onChange={handleChange}
                    className="h-4 w-4 text-primary focus:ring-primary border-gray-600 rounded bg-gray-700"
                  />
                  <label htmlFor="enableRegistration" className="ml-2 block text-sm text-gray-300">
                    Enable User Registration
                  </label>
                </div>
                
                <div className="flex items-center p-2 hover:bg-gray-800/50 rounded-md transition-colors">
                  <input
                    type="checkbox"
                    id="enableStore"
                    name="enableStore"
                    checked={settings.enableStore}
                    onChange={handleChange}
                    className="h-4 w-4 text-primary focus:ring-primary border-gray-600 rounded bg-gray-700"
                  />
                  <label htmlFor="enableStore" className="ml-2 block text-sm text-gray-300">
                    Enable Store
                  </label>
                </div>
                
                <div className="flex items-center p-2 hover:bg-gray-800/50 rounded-md transition-colors">
                  <input
                    type="checkbox"
                    id="enableJobs"
                    name="enableJobs"
                    checked={settings.enableJobs}
                    onChange={handleChange}
                    className="h-4 w-4 text-primary focus:ring-primary border-gray-600 rounded bg-gray-700"
                  />
                  <label htmlFor="enableJobs" className="ml-2 block text-sm text-gray-300">
                    Enable Jobs
                  </label>
                </div>
                
                <div className="flex items-center p-2 hover:bg-gray-800/50 rounded-md transition-colors">
                  <input
                    type="checkbox"
                    id="maintenanceMode"
                    name="maintenanceMode"
                    checked={settings.maintenanceMode}
                    onChange={handleMaintenanceModeToggle}
                    className="h-4 w-4 text-primary focus:ring-primary border-gray-600 rounded bg-gray-700"
                  />
                  <div className="ml-2">
                    <label htmlFor="maintenanceMode" className="block text-sm text-gray-300 font-medium">
                      Maintenance Mode
                    </label>
                    <p className="text-xs text-gray-400 mt-0.5">
                      When enabled, only admins can access the site. All other users will see a maintenance page.
                    </p>
                  </div>
                  {settings.maintenanceMode && (
                    <span className="ml-auto px-2 py-0.5 bg-amber-500/20 text-amber-400 rounded-md text-xs animate-pulse-slow">
                      Active
                    </span>
                  )}
                </div>
              </div>
            </div>
            
            <div className="game-card border-gray-800 bg-secondary/80 backdrop-blur-sm">
              <h2 className="text-xl font-semibold text-white mb-4">
                <span className="text-primary">Maintenance Mode</span>
              </h2>
              
              <div className="space-y-4">
                <div className="flex items-center p-2 hover:bg-gray-800/50 rounded-md transition-colors">
                  <input
                    type="checkbox"
                    id="maintenanceMode"
                    name="maintenanceMode"
                    checked={settings.maintenanceMode}
                    onChange={handleMaintenanceModeToggle}
                    className="h-4 w-4 text-primary focus:ring-primary border-gray-600 rounded bg-gray-700"
                  />
                  <label htmlFor="maintenanceMode" className="ml-2 block text-sm text-gray-300">
                    Enable Maintenance Mode
                  </label>
                </div>
                
                <div className="mt-6">
                  <h3 className="text-lg font-medium text-white mb-4">Maintenance Page Content</h3>
                  
                  <div className="mb-6">
                    <div className="flex items-center mb-2">
                      <div className="w-6 h-6 flex items-center justify-center rounded-full bg-blue-500/20 text-blue-400 text-xs font-bold mr-2">EN</div>
                      <h4 className="text-md font-medium text-gray-300">English Content</h4>
                    </div>
                    
                    <div className="space-y-4 pl-8">
                      <div>
                        <label htmlFor="maintenanceTitleEn" className="block text-sm font-medium text-gray-300 mb-1">
                          Title
                        </label>
                        <input
                          type="text"
                          id="maintenanceTitleEn"
                          value={settings.maintenanceContent.en.title}
                          onChange={(e) => handleMaintenanceContentChange('en', 'title', e.target.value)}
                          className="w-full bg-gray-700/80 border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:border-primary"
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="maintenanceMessageEn" className="block text-sm font-medium text-gray-300 mb-1">
                          Message
                        </label>
                        <textarea
                          id="maintenanceMessageEn"
                          value={settings.maintenanceContent.en.message}
                          onChange={(e) => handleMaintenanceContentChange('en', 'message', e.target.value)}
                          rows={3}
                          className="w-full bg-gray-700/80 border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:border-primary"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex items-center mb-2">
                      <div className="w-6 h-6 flex items-center justify-center rounded-full bg-green-500/20 text-green-400 text-xs font-bold mr-2">AR</div>
                      <h4 className="text-md font-medium text-gray-300">Arabic Content</h4>
                    </div>
                    
                    <div className="space-y-4 pl-8">
                      <div>
                        <label htmlFor="maintenanceTitleAr" className="block text-sm font-medium text-gray-300 mb-1">
                          Title
                        </label>
                        <input
                          type="text"
                          id="maintenanceTitleAr"
                          value={settings.maintenanceContent.ar.title}
                          onChange={(e) => handleMaintenanceContentChange('ar', 'title', e.target.value)}
                          className="w-full bg-gray-700/80 border border-gray-600 rounded-md py-2 px-3 text-white text-right focus:outline-none focus:border-primary"
                          dir="rtl"
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="maintenanceMessageAr" className="block text-sm font-medium text-gray-300 mb-1">
                          Message
                        </label>
                        <textarea
                          id="maintenanceMessageAr"
                          value={settings.maintenanceContent.ar.message}
                          onChange={(e) => handleMaintenanceContentChange('ar', 'message', e.target.value)}
                          rows={3}
                          className="w-full bg-gray-700/80 border border-gray-600 rounded-md py-2 px-3 text-white text-right focus:outline-none focus:border-primary"
                          dir="rtl"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-6">
                    <button
                      type="button"
                      onClick={saveMaintenanceContent}
                      className="px-4 py-2 bg-primary hover:bg-primary/80 text-white rounded-md transition-colors"
                      disabled={saving}
                    >
                      {saving ? 'Saving...' : 'Save Maintenance Content'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2 bg-primary hover:bg-primary/80 text-white font-medium rounded-md transition-colors disabled:opacity-50 btn-primary"
              >
                {saving ? 'Saving...' : 'Save Settings'}
              </button>
            </div>
          </form>
        </div>
      )}
    </RoleGuard>
  );
} 