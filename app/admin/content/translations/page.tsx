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
import { InfoIcon, AlertTriangle } from 'lucide-react';
import RuleTranslationHelper from '../../../../components/admin/RuleTranslationHelper';
import { Separator } from '../../../../components/ui/separator';
import { Badge } from '../../../../components/ui/badge';
import Link from 'next/link';

type NestedObject = {
  [key: string]: string | NestedObject;
};

type TranslationsState = {
  en: NestedObject;
  ar: NestedObject;
};

export default function TranslationsPage() {
  const { t } = useTranslation();
  const [translations, setTranslations] = useState<TranslationsState>({ en: {}, ar: {} });
  const [activeTab, setActiveTab] = useState('en');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [activeView, setActiveView] = useState('all'); // 'all', 'rules', 'maintenance', or 'rule-content'
  const [maintenanceContent, setMaintenanceContent] = useState<{
    en: { title: string; message: string };
    ar: { title: string; message: string };
  }>({
    en: { title: '', message: '' },
    ar: { title: '', message: '' }
  });
  const [maintenanceLoading, setMaintenanceLoading] = useState(false);
  const [maintenanceSaving, setMaintenanceSaving] = useState(false);
  const [stats, setStats] = useState<{
    totalKeys: number;
    enTranslations: number;
    arTranslations: number;
    missingEn: number;
    missingAr: number;
    completionRate: {
      en: number;
      ar: number;
    };
  } | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);

  useEffect(() => {
    const fetchTranslations = async () => {
      try {
        setLoading(true);
        
        // Fetch translations from database via API
        const [enRes, arRes] = await Promise.all([
          fetch('/api/admin/content/translations?language=en'),
          fetch('/api/admin/content/translations?language=ar')
        ]);
        
        if (!enRes.ok || !arRes.ok) {
          throw new Error('Failed to fetch translations from database');
        }
        
        const enData = await enRes.json();
        const arData = await arRes.json();
        
        if (!enData.success || !arData.success) {
          throw new Error('API returned error status');
        }
        
        setTranslations({
          en: enData.translations, 
          ar: arData.translations
        });
        
        const topLevelKeys = new Set(Object.keys(enData.translations));
        setExpandedSections(topLevelKeys);
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching translations:', error);
        toast.error('Failed to load translations from database');
        setLoading(false);
      }
    };
    
    fetchTranslations();
  }, []);

  useEffect(() => {
    const fetchMaintenanceContent = async () => {
      try {
        setMaintenanceLoading(true);
        const response = await fetch('/api/admin/maintenance');
        if (response.ok) {
          const data = await response.json();
          if (data.content) {
            setMaintenanceContent(data.content);
          }
        }
      } catch (error) {
        console.error('Error fetching maintenance content:', error);
        toast.error('Failed to load maintenance content');
      } finally {
        setMaintenanceLoading(false);
      }
    };

    if (activeView === 'maintenance') {
      fetchMaintenanceContent();
    }
  }, [activeView]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setStatsLoading(true);
        const response = await fetch('/api/admin/content/translations/stats');
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setStats(data.stats);
          }
        }
      } catch (error) {
        console.error('Error fetching translation stats:', error);
      } finally {
        setStatsLoading(false);
      }
    };

    fetchStats();
  }, []);

  const handleSaveTranslations = async () => {
    try {
      setSaving(true);
      
      
      const [enRes, arRes] = await Promise.all([
        fetch('/api/admin/content/translations', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            language: 'en',
            translations: translations.en
          }),
        }),
        fetch('/api/admin/content/translations', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            language: 'ar',
            translations: translations.ar
          }),
        })
      ]);
      
      if (!enRes.ok || !arRes.ok) {
        throw new Error('Failed to save translations');
      }
      
      toast.success('Translations saved successfully');
      setSaving(false);
    } catch (error) {
      console.error('Error saving translations:', error);
      toast.error('Failed to save translations');
      setSaving(false);
    }
  };

  const handleSaveMaintenanceContent = async () => {
    try {
      setMaintenanceSaving(true);
      
      const response = await fetch('/api/admin/maintenance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: maintenanceContent
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
      setMaintenanceSaving(false);
    }
  };

  const updateTranslation = (path: string, value: string) => {
    const keys = path.split('.');
    const language = activeTab as 'en' | 'ar';
    
    setTranslations(prev => {
      
      const newTranslations = JSON.parse(JSON.stringify(prev));
      
      
      let current = newTranslations[language];
      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]];
      }
      
      
      current[keys[keys.length - 1]] = value;
      
      return newTranslations;
    });
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

  const renderTranslationFields = (
    obj: NestedObject, 
    path: string = '', 
    level: number = 0,
    otherLanguage: 'en' | 'ar' = activeTab === 'en' ? 'ar' : 'en'
  ) => {
    const filteredEntries = Object.entries(obj).filter(([key, value]) => {
      const currentPath = path ? `${path}.${key}` : key;
      if (typeof value === 'string') {
        return searchQuery ? 
          value.toLowerCase().includes(searchQuery.toLowerCase()) || 
          key.toLowerCase().includes(searchQuery.toLowerCase()) || 
          currentPath.toLowerCase().includes(searchQuery.toLowerCase()) : 
          true;
      } else {
        
        return searchQuery ? 
          hasMatchingChild(value, searchQuery) || 
          key.toLowerCase().includes(searchQuery.toLowerCase()) || 
          currentPath.toLowerCase().includes(searchQuery.toLowerCase()) : 
          true;
      }
    });
    
    if (filteredEntries.length === 0) return null;
    
    return (
      <div className="space-y-4" style={{ marginLeft: `${level * 16}px` }}>
        {filteredEntries.map(([key, value]) => {
          const currentPath = path ? `${path}.${key}` : key;
          
          if (typeof value === 'object') {
            const isExpanded = expandedSections.has(currentPath);
            
            return (
              <div key={currentPath} className="mb-2">
                <div 
                  className="flex items-center cursor-pointer bg-gray-800/50 p-2 rounded-md hover:bg-gray-800"
                  onClick={() => toggleSection(currentPath)}
                >
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className={`h-4 w-4 mr-2 transition-transform ${isExpanded ? 'transform rotate-90' : ''}`} 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                  <span className="font-medium text-primary">{key}</span>
                </div>
                
                {isExpanded && renderTranslationFields(value, currentPath, level + 1, otherLanguage)}
              </div>
            );
          } else {
            
            const otherLangValue = getNestedValue(translations[otherLanguage], currentPath);
            
            return (
              <div key={currentPath} className="mb-4 bg-gray-800/30 p-3 rounded-md border border-gray-700">
                <div className="mb-2">
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-sm font-medium text-gray-300">
                      {currentPath}
                    </label>
                    {activeTab === 'ar' && (
                      <span className="text-xs bg-gray-700 px-2 py-0.5 rounded text-gray-300">RTL</span>
                    )}
                  </div>
                  
                  {value.length > 50 ? (
                    <Textarea
                      value={value}
                      onChange={(e) => updateTranslation(currentPath, e.target.value)}
                      className="bg-gray-900 border-gray-700"
                      dir={activeTab === 'ar' ? 'rtl' : 'ltr'}
                    />
                  ) : (
                    <Input
                      value={value}
                      onChange={(e) => updateTranslation(currentPath, e.target.value)}
                      className="bg-gray-900 border-gray-700"
                      dir={activeTab === 'ar' ? 'rtl' : 'ltr'}
                    />
                  )}
                </div>
                
                
                <div className="mt-2 p-2 bg-gray-800/50 rounded text-sm text-gray-400">
                  <span className="font-medium text-gray-300 mr-1">{otherLanguage === 'en' ? 'English:' : 'Arabic:'}</span>
                  <span dir={otherLanguage === 'ar' ? 'rtl' : 'ltr'} className="inline-block">
                    {otherLangValue || '(empty)'}
                  </span>
                </div>
              </div>
            );
          }
        })}
      </div>
    );
  };

  
  const hasMatchingChild = (obj: NestedObject, query: string): boolean => {
    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'string') {
        if (value.toLowerCase().includes(query.toLowerCase()) || 
            key.toLowerCase().includes(query.toLowerCase())) {
          return true;
        }
      } else if (hasMatchingChild(value, query)) {
        return true;
      }
    }
    return false;
  };

          
  const getNestedValue = (obj: NestedObject, path: string): string => {
    const keys = path.split('.');
    let current: any = obj;
    
    for (const key of keys) {
      if (current === undefined || current === null || typeof current !== 'object') {
        return '';
      }
      current = current[key];
    }
    
    return typeof current === 'string' ? current : '';
  };

  const toggleSection = (path: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(path)) {
        newSet.delete(path);
      } else {
        newSet.add(path);
      }
      return newSet;
    });
  };

  return (
    <RoleGuard allowedRoles={['admin', 'owner']} redirectTo="/login">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-white">
            <span className="cyberpunk-border inline-block">{t('admin.translations.title', 'Translations Management')}</span>
          </h1>
        </div>
        
        <Card className="bg-secondary/80 border-gray-800 mb-6">
          <CardHeader>
            <CardTitle className="flex justify-between items-center">
              <span>View Options</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stats && (
              <div className="mb-6 p-4 bg-gray-900/50 rounded-lg border border-gray-800">
                <h3 className="text-lg font-medium text-white mb-3">Translation Statistics</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">{stats.totalKeys}</div>
                    <div className="text-sm text-gray-400">Total Keys</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-400">{stats.enTranslations}</div>
                    <div className="text-sm text-gray-400">English ({stats.completionRate.en}%)</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-400">{stats.arTranslations}</div>
                    <div className="text-sm text-gray-400">Arabic ({stats.completionRate.ar}%)</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-400">{stats.missingEn + stats.missingAr}</div>
                    <div className="text-sm text-gray-400">Missing</div>
                  </div>
                </div>
              </div>
            )}
            <div className="flex items-center space-x-4">
              <Button 
                variant={activeView === 'all' ? 'default' : 'outline'} 
                onClick={() => setActiveView('all')}
                className={activeView === 'all' ? 'bg-primary hover:bg-primary/80' : ''}
              >
                All Translations
              </Button>
              <Button 
                variant={activeView === 'rules' ? 'default' : 'outline'} 
                onClick={() => {
                  setActiveView('rules');
                  setExpandedSections(new Set(['rules']));
                  setSearchQuery('rules');
                }}
                className={activeView === 'rules' ? 'bg-primary hover:bg-primary/80' : ''}
              >
                Rules Translation Helper
              </Button>
              <Button 
                variant="outline"
                asChild
                className="flex items-center gap-2"
              >
                <Link href="/admin/content/maintenance">
                  Maintenance Page
                  <Badge className="ml-1 bg-primary/20 text-primary border-primary/30 text-xs">New</Badge>
                </Link>
              </Button>
            </div>
            
            {activeView === 'rules' && (
              <Alert className="mt-4 bg-primary/10 border-primary/30">
                <InfoIcon className="h-4 w-4 text-primary" />
                <AlertDescription className="text-gray-300">
                  This view focuses on rule translations only. Changes will be saved along with all other translations when you click "Save All Translations".
                </AlertDescription>
              </Alert>
            )}
            
            {activeView === 'maintenance' && (
              <Alert className="mt-4 bg-primary/10 border-primary/30">
                <InfoIcon className="h-4 w-4 text-primary" />
                <AlertDescription className="text-gray-300">
                  This view allows you to translate the maintenance page content. Changes will be saved when you click "Save Changes".
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
        
        {activeView === 'maintenance' ? (
          <Card className="bg-secondary/80 border-gray-800">
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span>Maintenance Page Translation</span>
                <Button 
                  onClick={handleSaveMaintenanceContent} 
                  disabled={maintenanceLoading || maintenanceSaving} 
                  className="bg-primary hover:bg-primary/80"
                >
                  {maintenanceSaving ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Saving...
                    </>
                  ) : 'Save Changes'}
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {maintenanceLoading ? (
                <div className="flex justify-center items-center py-20">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                </div>
              ) : (
                <>
                  <Alert className="mb-6 bg-amber-900/30 border-amber-500/30">
                    <AlertTriangle className="h-4 w-4 text-amber-500" />
                    <AlertDescription className="text-amber-400">
                      These translations are shown to users when the site is in maintenance mode.
                    </AlertDescription>
                  </Alert>
                  
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
                          <h5 className="text-lg font-bold text-white mb-2">{maintenanceContent.en.title || 'Site Under Maintenance'}</h5>
                          <p className="text-gray-300">{maintenanceContent.en.message || 'We\'re currently performing scheduled maintenance. Please check back soon.'}</p>
                        </div>
                      </div>
                      
                      <div className="p-4 bg-gray-900 rounded-lg border border-gray-800">
                        <h4 className="text-sm font-medium text-gray-400 mb-2">Arabic (العربية)</h4>
                        <div className="bg-gray-800 p-4 rounded-lg text-right" dir="rtl">
                          <h5 className="text-lg font-bold text-white mb-2">{maintenanceContent.ar.title || 'الموقع تحت الصيانة'}</h5>
                          <p className="text-gray-300">{maintenanceContent.ar.message || 'نحن نقوم حاليًا بإجراء صيانة مجدولة. يرجى التحقق مرة أخرى قريبًا.'}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        ) : (
          <Card className="bg-secondary/80 border-gray-800">
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span>{activeView === 'rules' ? 'Edit Rules Translations' : 'Edit Site Translations'}</span>
              <Button 
                onClick={handleSaveTranslations} 
                disabled={loading || saving} 
                className="bg-primary hover:bg-primary/80"
              >
                {saving ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                  </>
                ) : 'Save All Translations'}
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
              </div>
            ) : (
              <>
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full max-w-md">
                      <TabsList className="bg-gray-800 border border-gray-700">
                        <TabsTrigger 
                          value="en" 
                          className="data-[state=active]:bg-primary data-[state=active]:text-white"
                        >
                          English
                        </TabsTrigger>
                        <TabsTrigger 
                          value="ar" 
                          className="data-[state=active]:bg-primary data-[state=active]:text-white"
                        >
                          Arabic
                        </TabsTrigger>
                      </TabsList>
                    </Tabs>
                    
                      {activeView === 'all' && (
                    <div className="relative max-w-xs">
                      <Input
                        type="text"
                        placeholder="Search translations..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="bg-gray-900 border-gray-700 pr-10"
                      />
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 absolute right-3 top-1/2 transform -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                      )}
                  </div>
                  
                  <div className="bg-gray-900/50 p-2 rounded mb-4 text-sm text-yellow-300">
                    <strong>Note:</strong> Changes will be applied after saving and may require a page refresh to see updates.
                  </div>
                </div>
                
                <div className="space-y-6">
                  {activeTab === 'en' ? (
                    <div>{renderTranslationFields(translations.en)}</div>
                  ) : (
                    <div>{renderTranslationFields(translations.ar)}</div>
                  )}
                </div>
              </>
            )}
          </CardContent>
        </Card>
        )}
      </div>
    </RoleGuard>
  );
}
