'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { RoleGuard } from '../../../../components/RoleGuard';
import { Button } from '../../../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/card';
import { Input } from '../../../../components/ui/input';
import { Textarea } from '../../../../components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../../components/ui/tabs';
import { Label } from '../../../../components/ui/label';
import { toast } from 'sonner';
import { defaultContactContent } from '../../../models/Contact';


interface ContactContent {
  en: {
    title: string;
    subtitle: string;
    contactInfoTitle: string;
    contactInfoSubtitle: string;
    socialLinksTitle: string;
    formTitle: string;
    formSubtitle: string;
    faqTitle: string;
    faqSubtitle: string;
    successMessage: string;
    formLabels: {
      name: string;
      email: string;
      subject: string;
      message: string;
      send: string;
      sending: string;
      namePlaceholder: string;
      emailPlaceholder: string;
      subjectPlaceholder: string;
      messagePlaceholder: string;
      discord: string;
      website: string;
    };
    contactInfo: {
      email: string;
      discord: string;
      discordText: string;
      website: string;
      websiteText: string;
    };
    faqs: Array<{
      question: string;
      answer: string;
    }>;
  };
  ar: {
    title: string;
    subtitle: string;
    contactInfoTitle: string;
    contactInfoSubtitle: string;
    socialLinksTitle: string;
    formTitle: string;
    formSubtitle: string;
    faqTitle: string;
    faqSubtitle: string;
    successMessage: string;
    formLabels: {
      name: string;
      email: string;
      subject: string;
      message: string;
      send: string;
      sending: string;
      namePlaceholder: string;
      emailPlaceholder: string;
      subjectPlaceholder: string;
      messagePlaceholder: string;
      discord: string;
      website: string;
    };
    contactInfo: {
      email: string;
      discord: string;
      discordText: string;
      website: string;
      websiteText: string;
    };
    faqs: Array<{
      question: string;
      answer: string;
    }>;
  };
  socialLinks: Array<{
    name: string;
    url: string;
    icon?: string;
  }>;
}

export default function AdminContactPage() {
  const router = useRouter();
  const [content, setContent] = useState<ContactContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('en');
  const [activeFaqIndex, setActiveFaqIndex] = useState(-1);

  // Helper function to get language-specific content
  const getLangContent = (lang: string) => {
    if (!content) return null;
    return lang === 'en' ? content.en : content.ar;
  };

  useEffect(() => {
    const fetchContent = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/admin/content?type=contact');
        
        if (!response.ok) {
          throw new Error('Failed to fetch contact content');
        }
        
        const data = await response.json();
        
        // Initialize content with default values if not present
        let contentData = data.content || defaultContactContent;
        
        // Ensure socialLinks exists
        if (!contentData.socialLinks) {
          contentData.socialLinks = [];
        }
        
        // Ensure social links titles exist
        if (!contentData.en.socialLinksTitle) {
          contentData.en.socialLinksTitle = 'Follow Us';
        }
        if (!contentData.ar.socialLinksTitle) {
          contentData.ar.socialLinksTitle = 'تابعنا';
        }
        
        setContent(contentData);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching contact content:', error);
        toast.error('Failed to load contact page content');
        setContent(defaultContactContent); // Use default content on error
        setLoading(false);
      }
    };
    
    fetchContent();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, lang: string, section?: string, field?: string, nestedField?: string) => {
    if (!content) return;
    
    const { name, value } = e.target;
    
    setContent(prevContent => {
      if (!prevContent) return prevContent;
      
      const updatedContent = { ...prevContent };
      const langContent = updatedContent[lang as keyof typeof updatedContent] as any;
      
      if (section && field && nestedField) {
      
        if (!langContent[section]) langContent[section] = {};
        if (!langContent[section][field]) langContent[section][field] = {};
        langContent[section][field][nestedField] = value;
      } else if (section && field) {
        
        if (!langContent[section]) langContent[section] = {};
        langContent[section][field] = value;
      } else {
     
        langContent[name] = value;
      }
      
      return updatedContent;
    });
  };

  const handleFaqChange = (lang: string, index: number, field: string, value: string) => {
    if (!content) return;
    
    setContent(prevContent => {
      if (!prevContent) return prevContent;
      
      const updatedContent = { ...prevContent };
      const langContent = lang === 'en' ? updatedContent.en : updatedContent.ar;
      const updatedFaqs = [...langContent.faqs];
      
      updatedFaqs[index] = {
        ...updatedFaqs[index],
        [field]: value
      };
      
      if (lang === 'en') {
        updatedContent.en = {
          ...updatedContent.en,
          faqs: updatedFaqs
        };
      } else {
        updatedContent.ar = {
          ...updatedContent.ar,
          faqs: updatedFaqs
        };
      }
      
      return updatedContent;
    });
  };

  const addFaq = (lang: string) => {
    if (!content) return;
    
    const updatedContent = { ...content };
    
    updatedContent.en.faqs = [
      ...updatedContent.en.faqs,
      { question: '', answer: '' }
    ];
    
    updatedContent.ar.faqs = [
      ...updatedContent.ar.faqs,
      { question: '', answer: '' }
    ];
    
    setContent(updatedContent);
    setActiveFaqIndex(updatedContent.en.faqs.length - 1);
  };

  const removeFaq = (index: number) => {
    if (!content) return;
    
    if (!confirm('Are you sure you want to delete this FAQ?')) {
      return;
    }
    
    const updatedContent = { ...content };
    
    updatedContent.en.faqs = updatedContent.en.faqs.filter((_, i) => i !== index);
    updatedContent.ar.faqs = updatedContent.ar.faqs.filter((_, i) => i !== index);
    
    setContent(updatedContent);
    setActiveFaqIndex(-1);
  };

  const handleSocialLinkChange = (index: number, field: string, value: string) => {
    if (!content) return;
    
    const updatedLinks = [...(content.socialLinks || [])];
    updatedLinks[index] = {
      ...updatedLinks[index],
      [field]: value
    };
    
    setContent({
      ...content,
      socialLinks: updatedLinks
    });
  };

  const addSocialLink = () => {
    if (!content) return;
    
    setContent({
      ...content,
      socialLinks: [
        ...(content.socialLinks || []),
        { name: '', url: '', icon: '' }
      ]
    });
  };

  const removeSocialLink = (index: number) => {
    if (!content) return;
    
    if (!confirm('Are you sure you want to delete this social link?')) {
      return;
    }
    
    setContent({
      ...content,
      socialLinks: (content.socialLinks || []).filter((_, i) => i !== index)
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content) return;
    
    try {
      setSaving(true);
      
      const response = await fetch('/api/admin/content', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ type: 'contact', content }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to save contact content');
      }
      
      toast.success('Contact page content saved successfully');
      setSaving(false);
    } catch (error) {
      console.error('Error saving contact content:', error);
      toast.error('Failed to save contact page content');
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen">
     
        <div className="flex-1 p-8">
          <h1 className="text-2xl font-bold mb-6">Loading...</h1>
        </div>
      </div>
    );
  }

  if (!content) {
    return (
      <div className="flex min-h-screen">
        <div className="flex-1 p-8">
          <h1 className="text-2xl font-bold mb-6">Error loading content</h1>
          <Button onClick={() => router.refresh()}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <RoleGuard allowedRoles={['admin', 'owner']} redirectTo="/login">
      <div className="flex min-h-screen">
     
        <div className="flex-1 p-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Contact Page Content</h1>
            <Button 
              onClick={handleSubmit} 
              disabled={saving}
              className="bg-primary hover:bg-primary/90"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="en">English</TabsTrigger>
              <TabsTrigger value="ar">Arabic</TabsTrigger>
              <TabsTrigger value="social">Social Links</TabsTrigger>
            </TabsList>
            
            {['en', 'ar'].map((lang) => {
              const langContent = getLangContent(lang);
              if (!langContent) return null;
              
              return (
              <TabsContent key={lang} value={lang} className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Page Headers</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor={`${lang}-title`}>Page Title</Label>
                        <Input
                          id={`${lang}-title`}
                          name="title"
                          value={langContent.title}
                          onChange={(e) => handleInputChange(e, lang)}
                          dir={lang === 'ar' ? 'rtl' : 'ltr'}
                          className={lang === 'ar' ? 'text-right' : ''}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`${lang}-subtitle`}>Page Subtitle</Label>
                        <Input
                          id={`${lang}-subtitle`}
                          name="subtitle"
                          value={langContent.subtitle}
                          onChange={(e) => handleInputChange(e, lang)}
                          dir={lang === 'ar' ? 'rtl' : 'ltr'}
                          className={lang === 'ar' ? 'text-right' : ''}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Contact Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor={`${lang}-contactInfoTitle`}>Section Title</Label>
                        <Input
                          id={`${lang}-contactInfoTitle`}
                          name="contactInfoTitle"
                          value={langContent.contactInfoTitle}
                          onChange={(e) => handleInputChange(e, lang)}
                          dir={lang === 'ar' ? 'rtl' : 'ltr'}
                          className={lang === 'ar' ? 'text-right' : ''}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`${lang}-contactInfoSubtitle`}>Section Subtitle</Label>
                        <Input
                          id={`${lang}-contactInfoSubtitle`}
                          name="contactInfoSubtitle"
                          value={langContent.contactInfoSubtitle}
                          onChange={(e) => handleInputChange(e, lang)}
                          dir={lang === 'ar' ? 'rtl' : 'ltr'}
                          className={lang === 'ar' ? 'text-right' : ''}
                        />
                      </div>
                    </div>
                    
                    <div className="mt-4 border-t pt-4">
                      <h3 className="font-medium mb-2">Contact Details</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor={`${lang}-contactInfo-email`}>Email</Label>
                          <Input
                            id={`${lang}-contactInfo-email`}
                            value={langContent.contactInfo.email}
                            onChange={(e) => handleInputChange(e, lang, 'contactInfo', 'email')}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={`${lang}-contactInfo-discord`}>Discord URL</Label>
                          <Input
                            id={`${lang}-contactInfo-discord`}
                            value={langContent.contactInfo.discord}
                            onChange={(e) => handleInputChange(e, lang, 'contactInfo', 'discord')}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={`${lang}-contactInfo-discordText`}>Discord Text</Label>
                          <Input
                            id={`${lang}-contactInfo-discordText`}
                            value={langContent.contactInfo.discordText}
                            onChange={(e) => handleInputChange(e, lang, 'contactInfo', 'discordText')}
                            dir={lang === 'ar' ? 'rtl' : 'ltr'}
                            className={lang === 'ar' ? 'text-right' : ''}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={`${lang}-contactInfo-website`}>Website URL</Label>
                          <Input
                            id={`${lang}-contactInfo-website`}
                            value={langContent.contactInfo.website}
                            onChange={(e) => handleInputChange(e, lang, 'contactInfo', 'website')}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={`${lang}-contactInfo-websiteText`}>Website Text</Label>
                          <Input
                            id={`${lang}-contactInfo-websiteText`}
                            value={langContent.contactInfo.websiteText}
                            onChange={(e) => handleInputChange(e, lang, 'contactInfo', 'websiteText')}
                            dir={lang === 'ar' ? 'rtl' : 'ltr'}
                            className={lang === 'ar' ? 'text-right' : ''}
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Contact Form</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor={`${lang}-formTitle`}>Form Title</Label>
                        <Input
                          id={`${lang}-formTitle`}
                          name="formTitle"
                          value={langContent.formTitle}
                          onChange={(e) => handleInputChange(e, lang)}
                          dir={lang === 'ar' ? 'rtl' : 'ltr'}
                          className={lang === 'ar' ? 'text-right' : ''}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`${lang}-formSubtitle`}>Form Subtitle</Label>
                        <Input
                          id={`${lang}-formSubtitle`}
                          name="formSubtitle"
                          value={langContent.formSubtitle}
                          onChange={(e) => handleInputChange(e, lang)}
                          dir={lang === 'ar' ? 'rtl' : 'ltr'}
                          className={lang === 'ar' ? 'text-right' : ''}
                        />
                      </div>
                    </div>
                    
                    <div className="mt-4 border-t pt-4">
                      <h3 className="font-medium mb-2">Form Labels</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {Object.keys(langContent.formLabels).map((labelKey) => (
                          <div key={labelKey} className="space-y-2">
                            <Label htmlFor={`${lang}-formLabels-${labelKey}`}>{labelKey}</Label>
                            <Input
                              id={`${lang}-formLabels-${labelKey}`}
                              value={(langContent.formLabels as any)[labelKey]}
                              onChange={(e) => handleInputChange(e, lang, 'formLabels', labelKey)}
                              dir={lang === 'ar' ? 'rtl' : 'ltr'}
                              className={lang === 'ar' ? 'text-right' : ''}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor={`${lang}-successMessage`}>Success Message</Label>
                      <Input
                        id={`${lang}-successMessage`}
                        name="successMessage"
                        value={langContent.successMessage}
                        onChange={(e) => handleInputChange(e, lang)}
                        dir={lang === 'ar' ? 'rtl' : 'ltr'}
                        className={lang === 'ar' ? 'text-right' : ''}
                      />
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <CardTitle>FAQs</CardTitle>
                      <Button 
                        onClick={() => addFaq(lang)} 
                        variant="outline"
                        size="sm"
                      >
                        Add FAQ
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      <div className="space-y-2">
                        <Label htmlFor={`${lang}-faqTitle`}>FAQ Section Title</Label>
                        <Input
                          id={`${lang}-faqTitle`}
                          name="faqTitle"
                          value={langContent.faqTitle}
                          onChange={(e) => handleInputChange(e, lang)}
                          dir={lang === 'ar' ? 'rtl' : 'ltr'}
                          className={lang === 'ar' ? 'text-right' : ''}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`${lang}-faqSubtitle`}>FAQ Section Subtitle</Label>
                        <Input
                          id={`${lang}-faqSubtitle`}
                          name="faqSubtitle"
                          value={langContent.faqSubtitle}
                          onChange={(e) => handleInputChange(e, lang)}
                          dir={lang === 'ar' ? 'rtl' : 'ltr'}
                          className={lang === 'ar' ? 'text-right' : ''}
                        />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {langContent.faqs.map((faq, index) => (
                      <Card 
                        key={index} 
                        className={`p-4 cursor-pointer transition-colors ${
                          activeFaqIndex === index ? 'bg-muted' : 'hover:bg-muted/50'
                        }`}
                        onClick={() => setActiveFaqIndex(activeFaqIndex === index ? -1 : index)}
                      >
                        <div className="flex justify-between items-center">
                          <h3 className="font-medium">FAQ {index + 1}</h3>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                removeFaq(index);
                              }}
                            >
                              Delete
                            </Button>
                          </div>
                        </div>
                        
                        {activeFaqIndex === index && (
                          <div className="mt-4 space-y-4">
                            <div className="space-y-2">
                              <Label htmlFor={`${lang}-faq-${index}-question`}>Question</Label>
                              <Input
                                id={`${lang}-faq-${index}-question`}
                                value={faq.question}
                                onChange={(e) => handleFaqChange(lang, index, 'question', e.target.value)}
                                dir={lang === 'ar' ? 'rtl' : 'ltr'}
                                className={lang === 'ar' ? 'text-right' : ''}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor={`${lang}-faq-${index}-answer`}>Answer</Label>
                              <Textarea
                                id={`${lang}-faq-${index}-answer`}
                                value={faq.answer}
                                onChange={(e) => handleFaqChange(lang, index, 'answer', e.target.value)}
                                dir={lang === 'ar' ? 'rtl' : 'ltr'}
                                className={lang === 'ar' ? 'text-right' : ''}
                                rows={3}
                              />
                            </div>
                          </div>
                        )}
                      </Card>
                    ))}
                  </CardContent>
                </Card>
              </TabsContent>
              );
            })}
            
            <TabsContent value="social">
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle>Social Links</CardTitle>
                    <Button 
                      onClick={addSocialLink} 
                      variant="outline"
                      size="sm"
                    >
                      Add Social Link
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 mb-4">
                    <Label htmlFor="socialLinksTitle-en">Section Title (English)</Label>
                    <Input
                      id="socialLinksTitle-en"
                      value={content.en.socialLinksTitle}
                      onChange={(e) => handleInputChange(e, 'en', 'socialLinksTitle')}
                    />
                  </div>
                  
                  <div className="space-y-2 mb-6">
                    <Label htmlFor="socialLinksTitle-ar">Section Title (Arabic)</Label>
                    <Input
                      id="socialLinksTitle-ar"
                      value={content.ar.socialLinksTitle}
                      onChange={(e) => handleInputChange(e, 'ar', 'socialLinksTitle')}
                      dir="rtl"
                      className="text-right"
                    />
                  </div>
                  
                  <div className="space-y-4">
                    {(content.socialLinks || []).map((link, index) => (
                      <div key={index} className="border border-gray-200 dark:border-gray-800 rounded-lg p-4">
                        <div className="flex justify-between items-center mb-2">
                          <h3 className="font-medium">Social Link #{index + 1}</h3>
                          <Button
                            onClick={() => removeSocialLink(index)}
                            variant="destructive"
                            size="sm"
                          >
                            Remove
                          </Button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor={`social-${index}-name`}>Name</Label>
                            <Input
                              id={`social-${index}-name`}
                              value={link.name}
                              onChange={(e) => handleSocialLinkChange(index, 'name', e.target.value)}
                              placeholder="e.g. Twitter, Discord"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor={`social-${index}-url`}>URL</Label>
                            <Input
                              id={`social-${index}-url`}
                              value={link.url}
                              onChange={(e) => handleSocialLinkChange(index, 'url', e.target.value)}
                              placeholder="https://..."
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor={`social-${index}-icon`}>Icon</Label>
                            <Input
                              id={`social-${index}-icon`}
                              value={link.icon || ''}
                              onChange={(e) => handleSocialLinkChange(index, 'icon', e.target.value)}
                              placeholder="e.g. Twitter, Instagram"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
          
          <div className="mt-8 flex justify-end">
            <Button 
              onClick={handleSubmit} 
              disabled={saving}
              className="bg-primary hover:bg-primary/90"
              size="lg"
            >
              {saving ? 'Saving...' : 'Save All Changes'}
            </Button>
          </div>
        </div>
      </div>
    </RoleGuard>
  );
}
