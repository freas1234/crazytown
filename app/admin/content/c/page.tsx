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

interface ContactContent {
  title: { en: string; ar: string };
  subtitle: { en: string; ar: string };
  contactInfo: {
    email: string;
    discord: string;
    serverIp: string;
  };
  socialLinks: Array<{
    name: string;
    url: string;
    icon?: string;
  }>;
  formLabels: {
    name: { en: string; ar: string };
    email: { en: string; ar: string };
    subject: { en: string; ar: string };
    message: { en: string; ar: string };
    submitButton: { en: string; ar: string };
    successMessage: { en: string; ar: string };
    errorMessage: { en: string; ar: string };
  };
  faqSection: {
    title: { en: string; ar: string };
    items: Array<{
      id?: string;
      question: { en: string; ar: string };
      answer: { en: string; ar: string };
    }>;
  };
}

export default function ContactContentPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const [activeLanguage, setActiveLanguage] = useState('en');
  const [content, setContent] = useState<ContactContent>({
    title: { en: '', ar: '' },
    subtitle: { en: '', ar: '' },
    contactInfo: {
      email: '',
      discord: '',
      serverIp: ''
    },
    socialLinks: [
      { name: 'Twitter', url: '', icon: 'Twitter' },
      { name: 'Discord', url: '', icon: 'MessageSquare' },
      { name: 'Instagram', url: '', icon: 'Instagram' },
      { name: 'YouTube', url: '', icon: 'Youtube' }
    ],
    formLabels: {
      name: { en: '', ar: '' },
      email: { en: '', ar: '' },
      subject: { en: '', ar: '' },
      message: { en: '', ar: '' },
      submitButton: { en: '', ar: '' },
      successMessage: { en: '', ar: '' },
      errorMessage: { en: '', ar: '' }
    },
    faqSection: {
      title: { en: '', ar: '' },
      items: []
    }
  });

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/content/contact');
      
      if (response.ok) {
        const data = await response.json();
        if (data.content) {
          setContent(data.content);
        }
      } else {
        toast.error('Failed to load contact page content');
      }
    } catch (error) {
      console.error('Error loading contact page content:', error);
      toast.error('An error occurred while loading content');
    } finally {
      setLoading(false);
    }
  };

  const saveContent = async () => {
    try {
      setSaving(true);
      const response = await fetch('/api/admin/content/contact', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ content })
      });
      
      if (response.ok) {
        toast.success('Contact page content saved successfully');
      } else {
        toast.error('Failed to save contact page content');
      }
    } catch (error) {
      console.error('Error saving contact page content:', error);
      toast.error('An error occurred while saving content');
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (section: keyof ContactContent, field: string, value: string) => {
    if (section === 'title' || section === 'subtitle') {
      setContent(prev => ({
        ...prev,
        [section]: {
          ...prev[section],
          [activeLanguage]: value
        }
      }));
    } else if (section === 'contactInfo') {
      setContent(prev => ({
        ...prev,
        contactInfo: {
          ...prev.contactInfo,
          [field]: value
        }
      }));
    // socialLinks are now handled directly in the JSX
    } else if (section === 'formLabels') {
      setContent(prev => ({
        ...prev,
        formLabels: {
          ...prev.formLabels,
          [field]: {
            ...prev.formLabels[field as keyof typeof prev.formLabels],
            [activeLanguage]: value
          }
        }
      }));
    } else if (section === 'faqSection' && field === 'title') {
      setContent(prev => ({
        ...prev,
        faqSection: {
          ...prev.faqSection,
          title: {
            ...prev.faqSection.title,
            [activeLanguage]: value
          }
        }
      }));
    }
  };

  const handleFaqChange = (index: number, field: string, value: string) => {
    setContent(prev => {
      const updatedFaqs = [...prev.faqSection.items];
      const currentFaq = { ...updatedFaqs[index] };
      
      if (field === 'question') {
        currentFaq.question = {
          ...currentFaq.question,
          [activeLanguage]: value
        };
      } else if (field === 'answer') {
        currentFaq.answer = {
          ...currentFaq.answer,
          [activeLanguage]: value
        };
      }
      
      updatedFaqs[index] = currentFaq;
      return { 
        ...prev, 
        faqSection: {
          ...prev.faqSection,
          items: updatedFaqs
        } 
      };
    });
  };

  const addFaq = () => {
    setContent(prev => ({
      ...prev,
      faqSection: {
        ...prev.faqSection,
        items: [
          ...prev.faqSection.items,
          {
            id: Date.now().toString(),
            question: { en: 'New Question', ar: 'سؤال جديد' },
            answer: { en: 'Answer', ar: 'إجابة' }
          }
        ]
      }
    }));
  };

  const removeFaq = (index: number) => {
    setContent(prev => {
      const updatedFaqs = [...prev.faqSection.items];
      updatedFaqs.splice(index, 1);
      return { 
        ...prev, 
        faqSection: {
          ...prev.faqSection,
          items: updatedFaqs
        } 
      };
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
            <span className="cyberpunk-border inline-block">Contact Page Content</span>
          </h1>
          <div className="flex items-center space-x-4">
            <Button 
              onClick={() => router.push('/contact')}
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
              value="form" 
              className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary"
            >
              Form Labels
            </TabsTrigger>
            <TabsTrigger 
              value="faq" 
              className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary"
            >
              FAQ Section
            </TabsTrigger>
          </TabsList>

          <TabsContent value="general">
            <Card className="game-card border-gray-800 bg-secondary/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>General Content</CardTitle>
                <CardDescription>Edit the main content sections of the Contact page</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">Title</label>
                  <Input 
                    value={content.title[activeLanguage as keyof typeof content.title] || ''}
                    onChange={(e) => handleInputChange('title', activeLanguage, e.target.value)}
                    className="bg-gray-900/50 border-gray-700"
                    placeholder={activeLanguage === 'en' ? "Contact Us" : "اتصل بنا"}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">Subtitle</label>
                  <Input 
                    value={content.subtitle[activeLanguage as keyof typeof content.subtitle] || ''}
                    onChange={(e) => handleInputChange('subtitle', activeLanguage, e.target.value)}
                    className="bg-gray-900/50 border-gray-700"
                    placeholder={activeLanguage === 'en' ? "Have questions or feedback? We'd love to hear from you." : "هل لديك أسئلة أو ملاحظات؟ نود أن نسمع منك."}
                  />
                </div>
                
                <div className="pt-4 border-t border-gray-800">
                  <h3 className="text-lg font-medium mb-4">Contact Information</h3>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-300">Email</label>
                      <Input 
                        value={content.contactInfo.email || ''}
                        onChange={(e) => handleInputChange('contactInfo', 'email', e.target.value)}
                        className="bg-gray-900/50 border-gray-700"
                        placeholder="contact@crazytown.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-300">Discord</label>
                      <Input 
                        value={content.contactInfo.discord || ''}
                        onChange={(e) => handleInputChange('contactInfo', 'discord', e.target.value)}
                        className="bg-gray-900/50 border-gray-700"
                        placeholder="discord.gg/crazytown"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-300">Server IP</label>
                      <Input 
                        value={content.contactInfo.serverIp || ''}
                        onChange={(e) => handleInputChange('contactInfo', 'serverIp', e.target.value)}
                        className="bg-gray-900/50 border-gray-700"
                        placeholder="connect.crazytown.com"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="pt-4 border-t border-gray-800">
                  <h3 className="text-lg font-medium mb-4">Social Links</h3>
                  <div className="space-y-4">
                    {content.socialLinks.map((link, index) => (
                      <div key={index} className="space-y-2">
                        <label className="text-sm font-medium text-gray-300">{link.name}</label>
                        <Input 
                          value={link.url || ''}
                          onChange={(e) => {
                            const updatedLinks = [...content.socialLinks];
                            updatedLinks[index] = { ...updatedLinks[index], url: e.target.value };
                            setContent(prev => ({ ...prev, socialLinks: updatedLinks }));
                          }}
                          className="bg-gray-900/50 border-gray-700"
                          placeholder={`https://${link.name.toLowerCase()}.com/crazytown`}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="form">
            <Card className="game-card border-gray-800 bg-secondary/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Form Labels</CardTitle>
                <CardDescription>Edit the contact form labels and messages</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">Name Field Label</label>
                  <Input 
                    value={content.formLabels.name[activeLanguage as keyof typeof content.formLabels.name] || ''}
                    onChange={(e) => handleInputChange('formLabels', 'name', e.target.value)}
                    className="bg-gray-900/50 border-gray-700"
                    placeholder={activeLanguage === 'en' ? "Your Name" : "اسمك"}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">Email Field Label</label>
                  <Input 
                    value={content.formLabels.email[activeLanguage as keyof typeof content.formLabels.email] || ''}
                    onChange={(e) => handleInputChange('formLabels', 'email', e.target.value)}
                    className="bg-gray-900/50 border-gray-700"
                    placeholder={activeLanguage === 'en' ? "Your Email" : "بريدك الإلكتروني"}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">Subject Field Label</label>
                  <Input 
                    value={content.formLabels.subject[activeLanguage as keyof typeof content.formLabels.subject] || ''}
                    onChange={(e) => handleInputChange('formLabels', 'subject', e.target.value)}
                    className="bg-gray-900/50 border-gray-700"
                    placeholder={activeLanguage === 'en' ? "Subject" : "الموضوع"}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">Message Field Label</label>
                  <Input 
                    value={content.formLabels.message[activeLanguage as keyof typeof content.formLabels.message] || ''}
                    onChange={(e) => handleInputChange('formLabels', 'message', e.target.value)}
                    className="bg-gray-900/50 border-gray-700"
                    placeholder={activeLanguage === 'en' ? "Message" : "الرسالة"}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">Submit Button Text</label>
                  <Input 
                    value={content.formLabels.submitButton[activeLanguage as keyof typeof content.formLabels.submitButton] || ''}
                    onChange={(e) => handleInputChange('formLabels', 'submitButton', e.target.value)}
                    className="bg-gray-900/50 border-gray-700"
                    placeholder={activeLanguage === 'en' ? "Send Message" : "إرسال الرسالة"}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">Success Message</label>
                  <Textarea 
                    value={content.formLabels.successMessage[activeLanguage as keyof typeof content.formLabels.successMessage] || ''}
                    onChange={(e) => handleInputChange('formLabels', 'successMessage', e.target.value)}
                    className="bg-gray-900/50 border-gray-700"
                    placeholder={activeLanguage === 'en' ? "Your message has been sent successfully! We'll get back to you soon." : "تم إرسال رسالتك بنجاح! سنرد عليك قريبًا."}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">Error Message</label>
                  <Textarea 
                    value={content.formLabels.errorMessage[activeLanguage as keyof typeof content.formLabels.errorMessage] || ''}
                    onChange={(e) => handleInputChange('formLabels', 'errorMessage', e.target.value)}
                    className="bg-gray-900/50 border-gray-700"
                    placeholder={activeLanguage === 'en' ? "There was an error sending your message. Please try again." : "حدث خطأ أثناء إرسال رسالتك. يرجى المحاولة مرة أخرى."}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="faq">
            <Card className="game-card border-gray-800 bg-secondary/80 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>FAQ Section</CardTitle>
                  <CardDescription>Manage the frequently asked questions displayed on the Contact page</CardDescription>
                </div>
                <Button 
                  onClick={addFaq}
                  className="bg-primary hover:bg-primary/80"
                >
                  Add FAQ
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">FAQ Section Title</label>
                    <Input 
                      value={content.faqSection.title[activeLanguage as keyof typeof content.faqSection.title] || ''}
                      onChange={(e) => handleInputChange('faqSection', 'title', e.target.value)}
                      className="bg-gray-900/50 border-gray-700"
                      placeholder={activeLanguage === 'en' ? "Frequently Asked Questions" : "الأسئلة الشائعة"}
                    />
                  </div>
                  
                  {content.faqSection.items.map((faq, index) => (
                    <div key={faq.id || index} className="p-4 border border-gray-700 rounded-lg bg-gray-800/50 relative">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="absolute top-2 right-2 text-red-500 hover:text-red-400 hover:bg-red-500/20"
                        onClick={() => removeFaq(index)}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </Button>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-300">Question</label>
                          <Input 
                            value={faq.question[activeLanguage as keyof typeof faq.question] || ''}
                            onChange={(e) => handleFaqChange(index, 'question', e.target.value)}
                            className="bg-gray-900/50 border-gray-700"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-300">Answer</label>
                          <Textarea 
                            value={faq.answer[activeLanguage as keyof typeof faq.answer] || ''}
                            onChange={(e) => handleFaqChange(index, 'answer', e.target.value)}
                            className="bg-gray-900/50 border-gray-700"
                            rows={3}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {content.faqSection.items.length === 0 && (
                    <div className="text-center py-8 text-gray-400">
                      No FAQs added yet. Click "Add FAQ" to create one.
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