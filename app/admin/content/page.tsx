'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminAuth } from '../../../lib/hooks/useAdminAuth';
import { useTranslation } from '../../../lib/hooks/useTranslation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../../components/ui/card';  
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Textarea } from '../../../components/ui/textarea';
import { Label } from '../../../components/ui/label';
import { AlertCircle, CheckCircle2, Trash2 } from 'lucide-react';
import { Alert, AlertDescription } from '../../../components/ui/alert';
import Link from 'next/link';
import { RoleGuard } from '../../../components/RoleGuard';
import { usePageContent } from '../../../lib/usePageContent';

export default function ContentPage() {
  const { user: currentUser, isLoading } = useAdminAuth();
  const { t, locale } = useTranslation();
  const router = useRouter();
  
  const [activeTab, setActiveTab] = useState('metadata');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const [metadata, setMetadata] = useState({
    title: '',
    description: '',
  });
  
  const [hero, setHero] = useState({
    en: {
      title: '',
      subtitle: '',
      cta: '',
    },
    ar: {
      title: '',
      subtitle: '',
      cta: '',
    }
  });
  
  const [featuredCards, setFeaturedCards] = useState({
    en: {
      title: '',
      cards: [
        { title: '', description: '', link: '', linkText: '', icon: '' },
        { title: '', description: '', link: '', linkText: '', icon: '' },
        { title: '', description: '', link: '', linkText: '', icon: '' },
      ]
    },
    ar: {
      title: '',
      cards: [
        { title: '', description: '', link: '', linkText: '', icon: '' },
        { title: '', description: '', link: '', linkText: '', icon: '' },
        { title: '', description: '', link: '', linkText: '', icon: '' },
      ]
    }
  });
  
  const [adminContent, setAdminContent] = useState<any>({
    pages: {
      about: {
        title: "About Page",
        description: "Manage the About page content",
        actionButton: "Manage About Content"
      },
      contact: {
        title: "Contact Page",
        description: "Manage the Contact page content",
        actionButton: "Manage Contact Content"
      },
      metadata: {
        title: "Site Metadata",
        description: "Manage site-wide metadata",
        actionButton: "Manage Metadata"
      },
      translations: {
        title: "Translations",
        description: "Manage website translations",
        actionButton: "Manage Translations"
      }
    }
  });
  
  useEffect(() => {
    async function fetchContent() {
      try {
        const metadataResponse = await fetch('/api/admin/content/metadata');
        if (metadataResponse.ok) {
          const metadataData = await metadataResponse.json();
          if (metadataData.content) {
            setMetadata(metadataData.content.data);
          }
        }
        
        const heroResponse = await fetch('/api/admin/content/hero');
        if (heroResponse.ok) {
          const heroData = await heroResponse.json();
          if (heroData.content) {
            setHero(heroData.content.data);
          }
        }
        
        const featuredResponse = await fetch('/api/admin/content/featuredCards');
        if (featuredResponse.ok) {
          const featuredData = await featuredResponse.json();
          if (featuredData.content) {
            setFeaturedCards(featuredData.content.data);
          }
        }
      } catch (err) {
        console.error('Error fetching content:', err);
        setError('Failed to load content. Please try again.');
      }
    }
    
    if (!isLoading && currentUser) {
      fetchContent();
    }
  }, [currentUser, isLoading]);
  
  useEffect(() => {
    const fetchAdminContent = async () => {
      try {
        const response = await fetch('/api/admin/content/adminContent');
        if (response.ok) {
          const data = await response.json();
          if (data.content && data.content[locale]) {
            setAdminContent(data.content[locale]);
          }
        }
      } catch (error) {
        console.error('Error fetching admin content:', error);
      }
    };
    
    fetchAdminContent();
  }, [locale]);
  

  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">{t('loading', 'Loading...')}</p>
        </div>
      </div>
    );
  }
  
  if (!currentUser || (currentUser.role !== 'admin' && currentUser.role !== 'owner')) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">{t('access_denied', 'Access Denied')}</h2>
          <p className="text-gray-400 mb-4">{t('no_permission', 'You do not have permission to access this page.')}</p>
          <Button onClick={() => router.push('/')}>{t('return_to_home', 'Return to Home')}</Button>
        </div>
      </div>
    );
  }
  
  const { pages } = adminContent;

  return (
    <RoleGuard allowedRoles={['admin', 'owner']} redirectTo="/login">
      <div className="px-2 sm:px-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-6 sm:mb-8">
          <span className="cyberpunk-border inline-block">{t('content_management', 'Content Management')}</span>
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        
        
        
        <Card className="game-card border-gray-800 bg-secondary/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white">{pages?.about?.title || t('about_page', 'About Page')}</CardTitle>
            <CardDescription className="text-gray-400">{pages?.about?.description || t('manage_about_page_content', 'Manage the About page content')}</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-gray-300 mb-4">
              {t('about_page_description', 'Edit the About page content, including text sections, features, and team members. Supports both English and Arabic languages.')}
            </p>
          </CardContent>
          <CardFooter>
            <Button asChild className="w-full bg-primary hover:bg-primary/80">
              <Link href="/admin/content/about">{pages?.about?.actionButton || t('manage_about_content', 'Manage About Content')}</Link>
            </Button>
          </CardFooter>
        </Card>
        
        <Card className="game-card border-gray-800 bg-secondary/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white">{pages?.metadata?.title || t('site_metadata', 'Site Metadata')}</CardTitle>
            <CardDescription className="text-gray-400">{pages?.metadata?.description || t('manage_site_metadata', 'Manage site-wide metadata')}</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-gray-300 mb-4">
              {t('metadata_description', 'Edit site-wide metadata like title, description, keywords, and social media links.')}
            </p>
          </CardContent>
          <CardFooter>
            <Button asChild className="w-full bg-primary hover:bg-primary/80">
              <Link href="/admin/content/metadata">{pages?.metadata?.actionButton || t('manage_metadata', 'Manage Metadata')}</Link>
            </Button>
          </CardFooter>
        </Card>
        
        <Card className="game-card border-gray-800 bg-secondary/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white">{pages?.contact?.title || t('contact_page', 'Contact Page')}</CardTitle>
            <CardDescription className="text-gray-400">{pages?.contact?.description || t('manage_contact_page_content', 'Manage the Contact page content')}</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-gray-300 mb-4">
              {t('contact_page_description', 'Edit the Contact page content, including contact information, form labels, and FAQ section. Supports both English and Arabic languages.')}
            </p>
          </CardContent>
          <CardFooter>
            <Button asChild className="w-full bg-primary hover:bg-primary/80">
              <Link href="/admin/content/contact">{pages?.contact?.actionButton || t('manage_contact_content', 'Manage Contact Content')}</Link>
            </Button>
          </CardFooter>
        </Card>

        <Card className="game-card border-gray-800 bg-secondary/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white">{pages?.translations?.title || t('translations', 'Translations')}</CardTitle>
            <CardDescription className="text-gray-400">{pages?.translations?.description || t('manage_translations', 'Manage website translations')}</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-gray-300 mb-4">
              {t('translations_description', 'Manage multilingual content and translations for the website. Add, edit, or remove translation keys for both English and Arabic languages.')}
            </p>
          </CardContent>
          <CardFooter>
            <Button asChild className="w-full bg-primary hover:bg-primary/80">
              <Link href="/admin/content/translations">{pages?.translations?.actionButton || t('manage_translations', 'Manage Translations')}</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
    </RoleGuard>
  );
} 