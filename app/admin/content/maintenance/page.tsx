'use client';

import { useState, useEffect } from 'react';
import { RoleGuard } from '../../../../components/RoleGuard';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../../components/ui/tabs';
import { Button } from '../../../../components/ui/button';
import { Input } from '../../../../components/ui/input';
import { Textarea } from '../../../../components/ui/textarea';
import { toast } from 'sonner';
import { useTranslation } from '../../../../lib/hooks/useTranslation';
import { Alert, AlertDescription } from '../../../../components/ui/alert';
import { AlertTriangle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function MaintenanceTranslationsPage() {
  const { locale } = useTranslation();
  const [maintenanceContent, setMaintenanceContent] = useState<{
    en: { title: string; message: string };
    ar: { title: string; message: string };
  }>({
    en: { title: '', message: '' },
    ar: { title: '', message: '' }
  });
  const [siteName, setSiteName] = useState<string>('WEXON STORE');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchMaintenanceContent = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/admin/maintenance');
        if (response.ok) {
          const data = await response.json();
          if (data.content) {
            setMaintenanceContent(data.content);
          }
          if (data.siteName) {
            setSiteName(data.siteName);
          }
        }
      } catch (error) {
        console.error('Error fetching maintenance content:', error);
        toast.error('Failed to load maintenance content');
      } finally {
        setLoading(false);
      }
    };

    fetchMaintenanceContent();
  }, []);

  const handleSaveMaintenanceContent = async () => {
    try {
      setSaving(true);
      
      const response = await fetch('/api/admin/maintenance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: maintenanceContent,
          siteName: siteName
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to save maintenance content');
      }
      
      toast.success('Maintenance content saved successfully');
    } catch (error) {
      console.error('Error saving maintenance content:', error);
      toast.error('Failed to save maintenance content');
    } finally {
      setSaving(false);
    }
  };

  const updateMaintenanceField = (
    language: 'en' | 'ar', 
    field: 'title' | 'message', 
    value: string
  ) => {
    setMaintenanceContent(prev => ({
      ...prev,
      [language]: {
        ...prev[language],
        [field]: value
      }
    }));
  };

  return (
    <RoleGuard allowedRoles={['admin', 'owner']} redirectTo="/login">
      <div>
        <div className="mb-8 flex items-center">
          <Link href="/admin/content/translations" className="mr-4">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white">
              <span className="cyberpunk-border inline-block">Maintenance Page Translations</span>
            </h1>
            <p className="text-gray-400 mt-1">Edit maintenance page content in different languages</p>
          </div>
        </div>
        
        <Card className="border-gray-800 bg-secondary/80 backdrop-blur-sm">
          <CardHeader className="border-b border-gray-800">
            <div className="flex justify-between items-center">
              <CardTitle className="text-white">Maintenance Page Content</CardTitle>
              <Button 
                onClick={handleSaveMaintenanceContent} 
                disabled={saving}
                className="bg-primary hover:bg-primary/80"
              >
                {saving ? (
                  <>
                    <span className="mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    Saving...
                  </>
                ) : 'Save Changes'}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : (
              <>
                <Alert className="mb-6 bg-amber-900/30 border-amber-500/30">
                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                  <AlertDescription className="text-amber-400">
                    These translations are shown to users when the site is in maintenance mode.
                  </AlertDescription>
                </Alert>
                
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Site Name
                  </label>
                  <Input
                    value={siteName}
                    onChange={(e) => setSiteName(e.target.value)}
                    placeholder="WEXON STORE"
                    className="bg-gray-900 border-gray-700"
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    This will be displayed in the maintenance page header
                  </p>
                </div>
                
                <Tabs defaultValue="en" className="mb-6">
                  <TabsList className="grid grid-cols-2 w-48 mb-6">
                    <TabsTrigger value="en">English</TabsTrigger>
                    <TabsTrigger value="ar">العربية</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="en" className="space-y-6">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Title
                        </label>
                        <Input
                          value={maintenanceContent.en.title}
                          onChange={(e) => updateMaintenanceField('en', 'title', e.target.value)}
                          placeholder="Site Under Maintenance"
                          className="bg-gray-900 border-gray-700"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Message
                        </label>
                        <Textarea
                          value={maintenanceContent.en.message}
                          onChange={(e) => updateMaintenanceField('en', 'message', e.target.value)}
                          placeholder="We're currently performing scheduled maintenance. Please check back soon."
                          className="bg-gray-900 border-gray-700 min-h-[100px]"
                        />
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="ar" className="space-y-6">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Title (العنوان)
                        </label>
                        <Input
                          value={maintenanceContent.ar.title}
                          onChange={(e) => updateMaintenanceField('ar', 'title', e.target.value)}
                          placeholder="الموقع تحت الصيانة"
                          className="bg-gray-900 border-gray-700 text-right"
                          dir="rtl"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Message (الرسالة)
                        </label>
                        <Textarea
                          value={maintenanceContent.ar.message}
                          onChange={(e) => updateMaintenanceField('ar', 'message', e.target.value)}
                          placeholder="نحن نقوم حاليًا بإجراء صيانة مجدولة. يرجى التحقق مرة أخرى قريبًا."
                          className="bg-gray-900 border-gray-700 min-h-[100px] text-right"
                          dir="rtl"
                        />
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
                
                <div className="mt-6 p-4 bg-gray-900/50 rounded-lg border border-gray-800">
                  <h3 className="text-lg font-medium text-white mb-3">Preview</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-4 bg-gray-900 rounded-lg border border-gray-800">
                      <h4 className="text-sm font-medium text-gray-400 mb-2">English</h4>
                      <div className="bg-gray-800 p-4 rounded-lg">
                        <div className="flex justify-center mb-4">
                          <div className="relative flex items-center">
                            <span className="text-primary font-display text-2xl font-bold animate-text-flicker">{siteName.split(' ')[0] || 'WEXON '}</span>
                            <span className="text-white font-display text-2xl font-bold">{siteName.split(' ').slice(1).join(' ') || 'STORE'}</span>
                          </div>
                        </div>
                        <h5 className="text-lg font-bold text-white mb-2 text-center">{maintenanceContent.en.title || 'Site Under Maintenance'}</h5>
                        <p className="text-gray-300 text-center">{maintenanceContent.en.message || 'We\'re currently performing scheduled maintenance. Please check back soon.'}</p>
                      </div>
                    </div>
                    
                    <div className="p-4 bg-gray-900 rounded-lg border border-gray-800">
                      <h4 className="text-sm font-medium text-gray-400 mb-2">Arabic (العربية)</h4>
                      <div className="bg-gray-800 p-4 rounded-lg text-right" dir="rtl">
                        <div className="flex justify-center mb-4">
                          <div className="relative flex items-center">
                            <span className="text-primary font-display text-2xl font-bold animate-text-flicker">{siteName.split(' ')[0] || 'WEXON'}</span>
                            <span className="text-white font-display text-2xl font-bold">{siteName.split(' ').slice(1).join(' ') || 'STORE'}</span>
                          </div>
                        </div>
                        <h5 className="text-lg font-bold text-white mb-2 text-center">{maintenanceContent.ar.title || 'الموقع تحت الصيانة'}</h5>
                        <p className="text-gray-300 text-center">{maintenanceContent.ar.message || 'نحن نقوم حاليًا بإجراء صيانة مجدولة. يرجى التحقق مرة أخرى قريبًا.'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </RoleGuard>
  );
} 