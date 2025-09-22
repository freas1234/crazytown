'use client';

import { useState, useEffect } from 'react';
import { RoleGuard } from '../../../components/RoleGuard';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { toast } from 'sonner';

export default function TestMaintenancePage() {
  const [maintenanceStatus, setMaintenanceStatus] = useState<{
    maintenanceMode: boolean;
    content: any;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    fetchMaintenanceStatus();
  }, []);

  const fetchMaintenanceStatus = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/maintenance');
      if (response.ok) {
        const data = await response.json();
        setMaintenanceStatus(data);
      }
    } catch (error) {
      console.error('Error fetching maintenance status:', error);
      toast.error('Failed to fetch maintenance status');
    } finally {
      setLoading(false);
    }
  };

  const testMaintenanceMode = async (enable: boolean) => {
    try {
      setTesting(true);
      
      // Enable maintenance mode
      const enableResponse = await fetch('/api/admin/maintenance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ enabled: enable }),
      });
      
      if (!enableResponse.ok) {
        throw new Error('Failed to toggle maintenance mode');
      }
      
      const enableData = await enableResponse.json();
      toast.success(`Maintenance mode ${enable ? 'enabled' : 'disabled'}`);
      
      // Wait a moment
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Test the public maintenance API
      const publicResponse = await fetch('/api/maintenance');
      if (publicResponse.ok) {
        const publicData = await publicResponse.json();
        console.log('Public maintenance API response:', publicData);
        toast.success('Public maintenance API is working correctly');
      }
      
      // Refresh status
      await fetchMaintenanceStatus();
      
    } catch (error) {
      console.error('Error testing maintenance mode:', error);
      toast.error('Failed to test maintenance mode');
    } finally {
      setTesting(false);
    }
  };

  const testMiddlewareRedirect = async () => {
    try {
      setTesting(true);
      
      // Enable maintenance mode first
      await testMaintenanceMode(true);
      
      toast.info('Maintenance mode enabled. Now test the redirect by visiting the homepage.');
      toast.info('You should be redirected to /maintenance when accessing the site.');
      
    } catch (error) {
      console.error('Error testing middleware redirect:', error);
      toast.error('Failed to test middleware redirect');
    } finally {
      setTesting(false);
    }
  };

  return (
    <RoleGuard allowedRoles={['admin', 'owner']} redirectTo="/login">
      <div>
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white">
            <span className="cyberpunk-border inline-block">Maintenance System Test</span>
          </h1>
          <p className="text-gray-400 mt-1">Test the maintenance system functionality</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="border-gray-800 bg-secondary/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white">Current Status</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-4">
                  <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : maintenanceStatus ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Maintenance Mode:</span>
                    <span className={`px-2 py-1 rounded text-sm font-medium ${
                      maintenanceStatus.maintenanceMode 
                        ? 'bg-red-500/20 text-red-400 border border-red-500/30' 
                        : 'bg-green-500/20 text-green-400 border border-green-500/30'
                    }`}>
                      {maintenanceStatus.maintenanceMode ? 'ENABLED' : 'DISABLED'}
                    </span>
                  </div>
                  
                  <div className="text-sm text-gray-400">
                    <p><strong>English Title:</strong> {maintenanceStatus.content?.en?.title || 'Not set'}</p>
                    <p><strong>Arabic Title:</strong> {maintenanceStatus.content?.ar?.title || 'Not set'}</p>
                  </div>
                </div>
              ) : (
                <p className="text-red-400">Failed to load status</p>
              )}
            </CardContent>
          </Card>
          
          <Card className="border-gray-800 bg-secondary/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white">Test Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                onClick={() => testMaintenanceMode(true)}
                disabled={testing}
                className="w-full bg-red-600 hover:bg-red-700"
              >
                {testing ? 'Testing...' : 'Enable Maintenance Mode'}
              </Button>
              
              <Button 
                onClick={() => testMaintenanceMode(false)}
                disabled={testing}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                {testing ? 'Testing...' : 'Disable Maintenance Mode'}
              </Button>
              
              <Button 
                onClick={testMiddlewareRedirect}
                disabled={testing}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                {testing ? 'Testing...' : 'Test Middleware Redirect'}
              </Button>
              
              <Button 
                onClick={fetchMaintenanceStatus}
                disabled={loading}
                variant="outline"
                className="w-full"
              >
                {loading ? 'Refreshing...' : 'Refresh Status'}
              </Button>
            </CardContent>
          </Card>
        </div>
        
        <Card className="border-gray-800 bg-secondary/80 backdrop-blur-sm mt-6">
          <CardHeader>
            <CardTitle className="text-white">How to Test</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 text-sm text-gray-300">
              <div>
                <h4 className="font-medium text-white mb-2">1. Enable Maintenance Mode</h4>
                <p>Click "Enable Maintenance Mode" to turn on maintenance mode.</p>
              </div>
              
              <div>
                <h4 className="font-medium text-white mb-2">2. Test Redirect</h4>
                <p>After enabling maintenance mode, try visiting the homepage (/) in a new tab. You should be redirected to /maintenance.</p>
              </div>
              
              <div>
                <h4 className="font-medium text-white mb-2">3. Test Admin Access</h4>
                <p>As an admin, you should still be able to access /admin and other admin pages even when maintenance mode is enabled.</p>
              </div>
              
              <div>
                <h4 className="font-medium text-white mb-2">4. Test API Endpoints</h4>
                <p>The maintenance API endpoints should work correctly:</p>
                <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                  <li><code className="bg-gray-800 px-1 rounded">GET /api/maintenance</code> - Public maintenance status</li>
                  <li><code className="bg-gray-800 px-1 rounded">GET /api/admin/maintenance</code> - Admin maintenance status</li>
                  <li><code className="bg-gray-800 px-1 rounded">POST /api/admin/maintenance</code> - Toggle maintenance mode</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-medium text-white mb-2">5. Disable Maintenance Mode</h4>
                <p>Click "Disable Maintenance Mode" to turn off maintenance mode and restore normal site access.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </RoleGuard>
  );
} 