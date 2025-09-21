'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { RoleGuard } from '../../../../components/RoleGuard';
import { Button } from '../../../../components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../../../components/ui/card';
import { Input } from '../../../../components/ui/input';
import { Textarea } from '../../../../components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../../components/ui/tabs';
import { toast } from 'sonner';
import Image from 'next/image';

interface TeamMember {
  id?: string;
  name: { en: string; ar: string };
  role: { en: string; ar: string };
  avatar: string;
}

interface AboutContent {
  title: { en: string; ar: string };
  subtitle: { en: string; ar: string };
  aboutText: { en: string; ar: string };
  serverInfoText: { en: string; ar: string };
  featuresItems: Array<{
    id?: string;
    title: { en: string; ar: string };
    description: { en: string; ar: string };
  }>;
  teamMembers: TeamMember[];
}

export default function AboutContentPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const [activeLanguage, setActiveLanguage] = useState('en');
  const [content, setContent] = useState<AboutContent>({
    title: { en: '', ar: '' },
    subtitle: { en: '', ar: '' },
    aboutText: { en: '', ar: '' },
    serverInfoText: { en: '', ar: '' },
    featuresItems: [],
    teamMembers: []
  });

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/content?type=about');
      
      if (response.ok) {
        const data = await response.json();
        if (data.content) {
          setContent(data.content);
        }
      } else {
        toast.error('Failed to load about page content');
      }
    } catch (error) {
      console.error('Error loading about page content:', error);
      toast.error('An error occurred while loading content');
    } finally {
      setLoading(false);
    }
  };

  const saveContent = async () => {
    try {
      setSaving(true);
      const response = await fetch('/api/admin/content', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ type: 'about', content })
      });
      
      if (response.ok) {
        toast.success('About page content saved successfully');
      } else {
        toast.error('Failed to save about page content');
      }
    } catch (error) {
      console.error('Error saving about page content:', error);
      toast.error('An error occurred while saving content');
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (section: keyof AboutContent, field: string, value: string) => {
    if (section === 'title' || section === 'subtitle' || section === 'aboutText' || section === 'serverInfoText') {
      setContent(prev => ({
        ...prev,
        [section]: {
          ...prev[section],
          [activeLanguage]: value
        }
      }));
    }
  };

  const handleFeatureChange = (index: number, field: string, value: string) => {
    setContent(prev => {
      const updatedFeatures = [...prev.featuresItems];
      const currentFeature = { ...updatedFeatures[index] };
      
      if (field === 'title') {
        currentFeature.title = {
          ...currentFeature.title,
          [activeLanguage]: value
        };
      } else if (field === 'description') {
        currentFeature.description = {
          ...currentFeature.description,
          [activeLanguage]: value
        };
      }
      
      updatedFeatures[index] = currentFeature;
      return { ...prev, featuresItems: updatedFeatures };
    });
  };

  const addFeature = () => {
    setContent(prev => ({
      ...prev,
      featuresItems: [
        ...prev.featuresItems,
        {
          id: Date.now().toString(),
          title: { en: 'New Feature', ar: 'ميزة جديدة' },
          description: { en: 'Description', ar: 'وصف' }
        }
      ]
    }));
  };

  const removeFeature = (index: number) => {
    setContent(prev => {
      const updatedFeatures = [...prev.featuresItems];
      updatedFeatures.splice(index, 1);
      return { ...prev, featuresItems: updatedFeatures };
    });
  };

  const handleTeamMemberChange = (index: number, field: string, value: string) => {
    setContent(prev => {
      const updatedTeam = [...prev.teamMembers];
      const currentMember = { ...updatedTeam[index] };
      
      if (field === 'avatar') {
        currentMember.avatar = value;
      } else if (field === 'name') {
        currentMember.name = {
          ...currentMember.name,
          [activeLanguage]: value
        };
      } else if (field === 'role') {
        currentMember.role = {
          ...currentMember.role,
          [activeLanguage]: value
        };
      }
      
      updatedTeam[index] = currentMember;
      return { ...prev, teamMembers: updatedTeam };
    });
  };

  const addTeamMember = () => {
    setContent(prev => ({
      ...prev,
      teamMembers: [
        ...prev.teamMembers,
        {
          id: Date.now().toString(),
          name: { en: 'New Member', ar: 'عضو جديد' },
          role: { en: 'Role', ar: 'دور' },
          avatar: '/placeholder-avatar.svg'
        }
      ]
    }));
  };

  const removeTeamMember = (index: number) => {
    setContent(prev => {
      const updatedTeam = [...prev.teamMembers];
      updatedTeam.splice(index, 1);
      return { ...prev, teamMembers: updatedTeam };
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading content...</p>
        </div>
      </div>
    );
  }

  return (
    <RoleGuard allowedRoles={['admin', 'owner']} redirectTo="/login">
      <div>
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-white">
            <span className="cyberpunk-border inline-block">About Page Content</span>
          </h1>
          <div className="flex items-center space-x-4">
            <Button 
              onClick={() => router.push('/about')}
              variant="outline"
              className="border-primary/30 hover:bg-primary/20 hover:text-primary transition-all duration-300"
            >
              Preview Page
            </Button>
            <Button 
              onClick={saveContent}
              disabled={saving}
              className="bg-primary hover:bg-primary/80"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>

        <div className="mb-6">
          <Tabs value={activeLanguage} onValueChange={setActiveLanguage}>
            <TabsList className="bg-secondary/80 backdrop-blur-sm border border-gray-800">
              <TabsTrigger value="en">English</TabsTrigger>
              <TabsTrigger value="ar">العربية</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <Tabs defaultValue="general" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 mb-8 bg-secondary/80 backdrop-blur-sm border border-gray-800">
            <TabsTrigger 
              value="general" 
              className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary"
            >
              General Content
            </TabsTrigger>
            <TabsTrigger 
              value="features" 
              className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary"
            >
              Features
            </TabsTrigger>
            <TabsTrigger 
              value="team" 
              className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary"
            >
              Team Members
            </TabsTrigger>
          </TabsList>

          <TabsContent value="general">
            <Card className="game-card border-gray-800 bg-secondary/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>General Content</CardTitle>
                <CardDescription>Edit the main content sections of the About page</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">Title</label>
                  <Input 
                    value={content.title[activeLanguage as keyof typeof content.title] || ''}
                    onChange={(e) => handleInputChange('title', activeLanguage, e.target.value)}
                    className="bg-gray-900/50 border-gray-700"
                    placeholder={activeLanguage === 'en' ? "About Our Server" : "عن السيرفر"}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">Subtitle</label>
                  <Input 
                    value={content.subtitle[activeLanguage as keyof typeof content.subtitle] || ''}
                    onChange={(e) => handleInputChange('subtitle', activeLanguage, e.target.value)}
                    className="bg-gray-900/50 border-gray-700"
                    placeholder={activeLanguage === 'en' ? "Discover the world of Crazy Town FiveM" : "اكتشف عالم كريزي تاون FiveM"}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">About Text</label>
                  <Textarea 
                    value={content.aboutText[activeLanguage as keyof typeof content.aboutText] || ''}
                    onChange={(e) => handleInputChange('aboutText', activeLanguage, e.target.value)}
                    className="bg-gray-900/50 border-gray-700 min-h-[150px]"
                    placeholder={activeLanguage === 'en' ? "About us description..." : "وصف من نحن..."}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">Server Info Text</label>
                  <Textarea 
                    value={content.serverInfoText[activeLanguage as keyof typeof content.serverInfoText] || ''}
                    onChange={(e) => handleInputChange('serverInfoText', activeLanguage, e.target.value)}
                    className="bg-gray-900/50 border-gray-700 min-h-[150px]"
                    placeholder={activeLanguage === 'en' ? "Server information description..." : "وصف معلومات السيرفر..."}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="features">
            <Card className="game-card border-gray-800 bg-secondary/80 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Features</CardTitle>
                  <CardDescription>Manage the features displayed on the About page</CardDescription>
                </div>
                <Button 
                  onClick={addFeature}
                  className="bg-primary hover:bg-primary/80"
                >
                  Add Feature
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {content.featuresItems.map((feature, index) => (
                    <div key={feature.id || index} className="p-4 border border-gray-700 rounded-lg bg-gray-800/50 relative">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="absolute top-2 right-2 text-red-500 hover:text-red-400 hover:bg-red-500/20"
                        onClick={() => removeFeature(index)}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </Button>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-300">Title</label>
                          <Input 
                            value={feature.title[activeLanguage as keyof typeof feature.title] || ''}
                            onChange={(e) => handleFeatureChange(index, 'title', e.target.value)}
                            className="bg-gray-900/50 border-gray-700"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-300">Description</label>
                          <Textarea 
                            value={feature.description[activeLanguage as keyof typeof feature.description] || ''}
                            onChange={(e) => handleFeatureChange(index, 'description', e.target.value)}
                            className="bg-gray-900/50 border-gray-700"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {content.featuresItems.length === 0 && (
                    <div className="text-center py-8 text-gray-400">
                      No features added yet. Click "Add Feature" to create one.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="team">
            <Card className="game-card border-gray-800 bg-secondary/80 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Team Members</CardTitle>
                  <CardDescription>Manage the team members displayed on the About page</CardDescription>
                </div>
                <Button 
                  onClick={addTeamMember}
                  className="bg-primary hover:bg-primary/80"
                >
                  Add Team Member
                </Button>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {content.teamMembers.map((member, index) => (
                    <div key={member.id || index} className="p-4 border border-gray-700 rounded-lg bg-gray-800/50 relative">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="absolute top-2 right-2 text-red-500 hover:text-red-400 hover:bg-red-500/20"
                        onClick={() => removeTeamMember(index)}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </Button>
                      
                      <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-shrink-0">
                          <div className="w-24 h-24 rounded-full overflow-hidden border border-gray-700 mx-auto md:mx-0">
                            <Image 
                              src={member.avatar || '/placeholder-avatar.svg'} 
                              alt="Avatar" 
                              width={96} 
                              height={96} 
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="mt-2 space-y-2">
                            <label className="text-sm font-medium text-gray-300">Avatar URL</label>
                            <Input 
                              value={member.avatar || ''}
                              onChange={(e) => handleTeamMemberChange(index, 'avatar', e.target.value)}
                              className="bg-gray-900/50 border-gray-700 text-sm"
                              placeholder="/placeholder-avatar.svg"
                            />
                          </div>
                        </div>
                        
                        <div className="flex-grow space-y-4">
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300">Name</label>
                            <Input 
                              value={member.name[activeLanguage as keyof typeof member.name] || ''}
                              onChange={(e) => handleTeamMemberChange(index, 'name', e.target.value)}
                              className="bg-gray-900/50 border-gray-700"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300">Role</label>
                            <Input 
                              value={member.role[activeLanguage as keyof typeof member.role] || ''}
                              onChange={(e) => handleTeamMemberChange(index, 'role', e.target.value)}
                              className="bg-gray-900/50 border-gray-700"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {content.teamMembers.length === 0 && (
                    <div className="text-center py-8 text-gray-400 col-span-2">
                      No team members added yet. Click "Add Team Member" to create one.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </RoleGuard>
  );
} 