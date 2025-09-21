'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminAuth } from '../../../../lib/hooks/useAdminAuth';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/card';
import { Button } from '../../../../components/ui/button';
import { Input } from '../../../../components/ui/input';
import { Textarea } from '../../../../components/ui/textarea';
import { Label } from '../../../../components/ui/label';
import { AlertCircle, CheckCircle2, ArrowLeft } from 'lucide-react';
import { Alert, AlertDescription } from '../../../../components/ui/alert';
import { RoleGuard } from '../../../../components/RoleGuard';
import Link from 'next/link';

export default function MetadataContentPage() {
  const { user: currentUser, isLoading } = useAdminAuth();
  const router = useRouter();
  
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const [metadata, setMetadata] = useState({
    title: '',
    description: '',
    keywords: '',
    ogTitle: '',
    ogDescription: '',
    ogImage: '',
    twitterHandle: '',
    themeColor: '#000000',
  });
  
  useEffect(() => {
    async function fetchContent() {
      try {
        const response = await fetch('/api/admin/content?type=metadata');
        if (response.ok) {
          const data = await response.json();
          if (data.content) {
            setMetadata({
              ...metadata,
              ...data.content
            });
          }
        }
      } catch (err) {
        console.error('Error fetching metadata:', err);
        setError('Failed to load metadata. Please try again.');
      }
    }
    
    if (!isLoading && currentUser) {
      fetchContent();
    }
  }, [currentUser, isLoading]);
  
  const saveMetadata = async () => {
    setSaving(true);
    setError(null);
    setSuccess(null);
    
    try {
      const response = await fetch('/api/admin/content', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ type: 'metadata', content: metadata }),
      });
      
      if (response.ok) {
        setSuccess('Website metadata updated successfully');
      } else {
        const data = await response.json();
        setError(data.message || 'Failed to update metadata');
      }
    } catch (err) {
      console.error('Error saving metadata:', err);
      setError('An unexpected error occurred');
    } finally {
      setSaving(false);
    }
  };
  
  const handleChange = (field: string, value: string) => {
    setMetadata(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading content...</p>
        </div>
      </div>
    );
  }
  
  if (!currentUser || (currentUser.role !== 'admin' && currentUser.role !== 'owner')) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
          <p className="text-gray-400 mb-4">You do not have permission to access this page.</p>
          <Button onClick={() => router.push('/')}>Return to Home</Button>
        </div>
      </div>
    );
  }
  
  return (
    <RoleGuard allowedRoles={['admin', 'owner']} redirectTo="/login">
      <div>
        <div className="flex items-center mb-6">
          <Button variant="ghost" size="sm" className="mr-2" asChild>
            <Link href="/admin/content">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back
            </Link>
          </Button>
          <h1 className="text-3xl font-bold text-white">
            <span className="cyberpunk-border inline-block">Site Metadata Management</span>
          </h1>
        </div>
        
        {error && (
          <Alert variant="destructive" className="mb-6 bg-red-900/30 border-red-500/30 text-red-400">
            <AlertCircle className="h-4 w-4 mr-2" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {success && (
          <Alert className="mb-6 bg-green-900/30 border-green-500/30 text-green-400">
            <CheckCircle2 className="h-4 w-4 mr-2" />
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}
        
        <Card className="border-gray-800 bg-secondary/80 backdrop-blur-sm mb-8">
          <CardHeader>
            <CardTitle className="text-white">Website Metadata</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="title" className="text-white">Site Title</Label>
                  <Input
                    id="title"
                    value={metadata.title}
                    onChange={(e) => handleChange('title', e.target.value)}
                    className="bg-gray-900/50 border-gray-700 text-white"
                  />
                </div>
                
                <div>
                  <Label htmlFor="themeColor" className="text-white">Theme Color</Label>
                  <div className="flex space-x-2">
                    <Input
                      id="themeColor"
                      value={metadata.themeColor}
                      onChange={(e) => handleChange('themeColor', e.target.value)}
                      className="bg-gray-900/50 border-gray-700 text-white"
                    />
                    <input
                      type="color"
                      value={metadata.themeColor}
                      onChange={(e) => handleChange('themeColor', e.target.value)}
                      className="h-10 w-10 rounded border border-gray-700"
                    />
                  </div>
                </div>
              </div>
              
              <div>
                <Label htmlFor="description" className="text-white">Site Description</Label>
                <Textarea
                  id="description"
                  value={metadata.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  className="bg-gray-900/50 border-gray-700 text-white"
                  rows={3}
                />
              </div>
              
              <div>
                <Label htmlFor="keywords" className="text-white">Keywords (comma separated)</Label>
                <Input
                  id="keywords"
                  value={metadata.keywords}
                  onChange={(e) => handleChange('keywords', e.target.value)}
                  className="bg-gray-900/50 border-gray-700 text-white"
                  placeholder="gaming, cyberpunk, minecraft, server"
                />
              </div>
              
              <div className="pt-4 border-t border-gray-800">
                <h3 className="text-lg font-bold text-white mb-4">Social Media Metadata</h3>
                
                <div className="space-y-6">
                  <div>
                    <Label htmlFor="ogTitle" className="text-white">Open Graph Title</Label>
                    <Input
                      id="ogTitle"
                      value={metadata.ogTitle}
                      onChange={(e) => handleChange('ogTitle', e.target.value)}
                      className="bg-gray-900/50 border-gray-700 text-white"
                      placeholder="Same as site title if empty"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="ogDescription" className="text-white">Open Graph Description</Label>
                    <Textarea
                      id="ogDescription"
                      value={metadata.ogDescription}
                      onChange={(e) => handleChange('ogDescription', e.target.value)}
                      className="bg-gray-900/50 border-gray-700 text-white"
                      rows={3}
                      placeholder="Same as site description if empty"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="ogImage" className="text-white">Open Graph Image URL</Label>
                    <Input
                      id="ogImage"
                      value={metadata.ogImage}
                      onChange={(e) => handleChange('ogImage', e.target.value)}
                      className="bg-gray-900/50 border-gray-700 text-white"
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="twitterHandle" className="text-white">Twitter Handle</Label>
                    <Input
                      id="twitterHandle"
                      value={metadata.twitterHandle}
                      onChange={(e) => handleChange('twitterHandle', e.target.value)}
                      className="bg-gray-900/50 border-gray-700 text-white"
                      placeholder="@yourtwitterhandle"
                    />
                  </div>
                </div>
              </div>
              
              <div className="pt-6 flex justify-end">
                <Button 
                  onClick={saveMetadata} 
                  disabled={saving}
                  className="bg-primary hover:bg-primary/80 text-white"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </RoleGuard>
  );
} 