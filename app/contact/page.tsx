'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { ContactContent, defaultContactContent } from '../models/Contact';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Button } from '../../components/ui/button';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../../components/ui/accordion';
import { CheckCircle2, XCircle, Mail, MessageSquare, Globe, ExternalLink, Phone, MapPin, Send } from 'lucide-react';
import { Separator } from '../../components/ui/separator';
import { Badge } from '../../components/ui/badge';
import { useTranslation } from '../../lib/hooks/useTranslation';
import { usePageContent } from '../../lib/usePageContent';

interface SocialLink {
  name: string;
  url: string;
  icon?: string;
}

interface FAQ {
  question: string;
  answer: string;
}

export default function ContactPage() {
  const { locale, isRTL } = useTranslation();
  const { content, localizedContent, isLoading, error: contentError } = usePageContent('contact');
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [subject, setSubject] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const successMessage = content?.[locale]?.successMessage || 
        (locale === 'en' ? 'Your message has been sent successfully! We\'ll get back to you soon.' : 'تم إرسال رسالتك بنجاح! سنرد عليك قريبًا.');
      
      setSuccess(successMessage);
      setName('');
      setEmail('');
      setSubject('');
      setMessage('');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An unknown error occurred');
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-400">Loading content...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (contentError || !content) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-6">
              <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-white mb-2">Error Loading Content</h2>
              <p className="text-gray-400 mb-4">{contentError || 'Failed to load contact page content'}</p>
              <Button onClick={() => router.refresh()}>Try Again</Button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Get the appropriate content based on the current language
  const t = content[locale];

  // Floating particles for background effect
  const particles = Array(6).fill(0);

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-grow" dir={isRTL ? "rtl" : "ltr"}>
        {/* Animated background elements */}
        <div className="animated-bg">
          <div className="line"></div>
          <div className="line"></div>
          <div className="line"></div>
          <div className="line"></div>
          <div className="line"></div>
        </div>
        
        {/* Floating particles */}
        <div className="particles-container fixed inset-0 z-0 pointer-events-none overflow-hidden">
          {particles.map((_, i) => (
            <div 
              key={i}
              className={`particle absolute w-24 h-24 rounded-full bg-primary opacity-5 blur-3xl animation-delay-${i * 2000}`}
              style={{
                left: `${Math.random() * 100}%`,
                bottom: `-50px`,
                animationDuration: `${15 + Math.random() * 15}s`
              }}
            />
          ))}
        </div>
        
        <section className="relative py-20 overflow-hidden">
          <div className="absolute inset-0 bg-cyber-grid opacity-5 z-0"></div>
          
          <div className="container mx-auto px-4 relative z-10">
            <div className={`text-center mb-16`}>      
              <h1 className="text-4xl md:text-6xl font-display font-bold mb-6 cyberpunk-border inline-block">
                <span className="text-primary animate-text-flicker">
                  {t?.title || (locale === 'en' ? 'Contact Us' : 'اتصل بنا')}
                </span>
              </h1>
              <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                {t?.subtitle || (locale === 'en' ? "Have questions or feedback? We'd love to hear from you." : 'هل لديك أسئلة أو ملاحظات؟ نود أن نسمع منك.')}
              </p>
            </div>
            
            <div className="max-w-6xl mx-auto">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                <div className="lg:col-span-1">
                  <Card className="game-card h-full">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center">
                        <span className={`bg-primary/20 p-1.5 rounded-md text-primary ${isRTL ? 'ml-2' : 'mr-2'}`}>
                          <Mail className="h-5 w-5" />
                        </span>
                        {t?.contactInfoTitle || (locale === 'en' ? 'Contact Information' : 'معلومات الاتصال')}
                      </CardTitle>
                      <CardDescription className="text-gray-400">
                        {t?.contactInfoSubtitle || (locale === 'en' ? 'Reach out to us through these channels' : 'تواصل معنا من خلال هذه القنوات')}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-4">
                        <div className={`flex items-start ${isRTL ? 'flex-row-reverse space-x-4 space-x-reverse' : 'space-x-4'}`}>
                          <div className="mt-0.5">
                            <div className="contact-icon-box">
                              <Mail className="h-5 w-5" />
                            </div>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-400">Email</p>
                            <a 
                              href={`mailto:${t?.contactInfo?.email || 'contact@crazytown.com'}`} 
                              className={`text-white hover:text-primary transition-colors flex items-center group ${isRTL ? 'flex-row-reverse' : ''}`}
                            >
                              {t?.contactInfo?.email || 'contact@crazytown.com'}
                              <ExternalLink className={`h-3.5 w-3.5 ${isRTL ? 'mr-1' : 'ml-1'} opacity-0 group-hover:opacity-100 transition-opacity`} />
                            </a>
                          </div>
                        </div>
                        
                        <div className={`flex items-start ${isRTL ? 'flex-row-reverse space-x-4 space-x-reverse' : 'space-x-4'}`}>
                          <div className="mt-0.5">
                            <div className="contact-icon-box">
                              <MessageSquare className="h-5 w-5" />
                            </div>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-400">Discord</p>
                            <a 
                              href={t?.contactInfo?.discord || 'https://discord.gg/crazytown'} 
                              className={`text-white hover:text-primary transition-colors flex items-center group ${isRTL ? 'flex-row-reverse' : ''}`}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              {t?.contactInfo?.discordText || (locale === 'en' ? 'Join our Discord' : 'انضم إلى ديسكورد')}
                              <ExternalLink className={`h-3.5 w-3.5 ${isRTL ? 'mr-1' : 'ml-1'} opacity-0 group-hover:opacity-100 transition-opacity`} />
                            </a>
                          </div>
                        </div>
                        
                        <div className={`flex items-start ${isRTL ? 'flex-row-reverse space-x-4 space-x-reverse' : 'space-x-4'}`}>
                          <div className="mt-0.5">
                            <div className="contact-icon-box">
                              <Globe className="h-5 w-5" />
                            </div>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-400">Website</p>
                            <a 
                              href={t?.contactInfo?.website || 'https://crazytown.com'} 
                              className={`text-white hover:text-primary transition-colors flex items-center group ${isRTL ? 'flex-row-reverse' : ''}`}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              {t?.contactInfo?.websiteText || 'crazytown.com'}
                              <ExternalLink className={`h-3.5 w-3.5 ${isRTL ? 'mr-1' : 'ml-1'} opacity-0 group-hover:opacity-100 transition-opacity`} />
                            </a>
                          </div>
                        </div>
                      </div>
                      
                      <Separator className="my-4 bg-gray-800" />
                      
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-3 flex items-center">
                          <span className={`bg-primary/20 p-1 rounded-md text-primary ${isRTL ? 'ml-2' : 'mr-2'}`}>
                            <Globe className="h-4 w-4" />
                          </span>
                          {t?.socialLinksTitle || (locale === 'en' ? 'Follow Us' : 'تابعنا')}
                        </h3>
                        <div className={`flex ${isRTL ? 'space-x-3 space-x-reverse' : 'space-x-3'}`}>
                          {(content.socialLinks || []).map((social: SocialLink, index: number) => (
                            <a 
                              key={index}
                              href={social.url} 
                              className="social-icon"
                              target="_blank"
                              rel="noopener noreferrer"
                              aria-label={social.name}
                            >
                              {social.name === 'Twitter' && (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                                </svg>
                              )}
                              {social.name === 'Discord' && (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M19.54 0c1.356 0 2.46 1.104 2.46 2.472v21.528l-2.58-2.28-1.452-1.344-1.536-1.428.636 2.22h-13.608c-1.356 0-2.46-1.104-2.46-2.472v-16.224c0-1.368 1.104-2.472 2.46-2.472h16.08zm-4.632 15.672c2.652-.084 3.672-1.824 3.672-1.824 0-3.864-1.728-6.996-1.728-6.996-1.728-1.296-3.372-1.26-3.372-1.26l-.168.192c2.04.624 2.988 1.524 2.988 1.524-1.248-.684-2.472-1.02-3.612-1.152-.864-.096-1.692-.072-2.424.024l-.204.024c-.42.036-1.44.192-2.724.756-.444.204-.708.348-.708.348s.996-.948 3.156-1.572l-.12-.144s-1.644-.036-3.372 1.26c0 0-1.728 3.132-1.728 6.996 0 0 1.008 1.74 3.66 1.824 0 0 .444-.54.804-.996-1.524-.456-2.1-1.416-2.1-1.416l.336.204.048.036.047.027.014.006.047.027c.3.168.6.3.876.408.492.192 1.08.384 1.764.516.9.168 1.956.228 3.108.012.564-.096 1.14-.264 1.74-.516.42-.156.888-.384 1.38-.708 0 0-.6.984-2.172 1.428.36.456.792.972.792.972zm-5.58-5.604c-.684 0-1.224.6-1.224 1.332 0 .732.552 1.332 1.224 1.332.684 0 1.224-.6 1.224-1.332.012-.732-.54-1.332-1.224-1.332zm4.38 0c-.684 0-1.224.6-1.224 1.332 0 .732.552 1.332 1.224 1.332.684 0 1.224-.6 1.224-1.332 0-.732-.54-1.332-1.224-1.332z"/>
                                </svg>
                              )}
                              {social.name === 'Instagram' && (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M7.168 0c-3.953 0-7.168 3.216-7.168 7.168v9.664c0 3.953 3.216 7.168 7.168 7.168h9.664c3.953 0 7.168-3.216 7.168-7.168v-9.664c0-3.953-3.216-7.168-7.168-7.168h-9.664zm9.663 2.938c0-.801.649-1.45 1.45-1.45.801 0 1.45.649 1.45 1.45 0 .801-.649 1.45-1.45 1.45-.801 0-1.45-.649-1.45-1.45zm-9.663 9.062c0-2.943 2.388-5.33 5.33-5.33 2.943 0 5.33 2.388 5.33 5.33s-2.388 5.33-5.33 5.33c-2.943 0-5.33-2.388-5.33-5.33zm5.33-3.252c-1.796 0-3.252 1.456-3.252 3.252s1.456 3.252 3.252 3.252 3.252-1.456 3.252-3.252-1.456-3.252-3.252-3.252z"/>
                                </svg>
                              )}
                              {social.name === 'YouTube' && (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M21.593 7.203c-.23-.858-.957-1.535-1.851-1.625-2.121-.219-4.257-.305-6.418-.308-2.161.003-4.298.089-6.418.308-.895.09-1.621.767-1.851 1.625-.401 1.474-.463 3.095-.455 4.797-.009 1.702.054 3.323.455 4.797.23.858.957 1.535 1.851 1.625 2.12.219 4.257.305 6.418.308 2.161-.003 4.297-.089 6.418-.308.895-.09 1.621-.767 1.851-1.625.401-1.474.462-3.095.455-4.797.009-1.702-.054-3.323-.455-4.797zm-13.993 7.797v-6l5.562 3-5.562 3z"/>
                                </svg>
                              )}
                            </a>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                <div className="lg:col-span-2">
                  <Card className="game-card overflow-hidden">
                    <CardHeader className="border-b border-gray-800 bg-gray-900/30">
                      <CardTitle className="text-white flex items-center">
                        <span className={`bg-primary/20 p-1.5 rounded-md text-primary ${isRTL ? 'ml-2' : 'mr-2'}`}>
                          <Send className={`h-5 w-5 ${isRTL ? 'rotate-180' : ''}`} />
                        </span>
                        {t?.formTitle || (locale === 'en' ? 'Send Us a Message' : 'أرسل لنا رسالة')}
                      </CardTitle>
                      <CardDescription className="text-gray-400">
                        {t?.formSubtitle || (locale === 'en' ? "Fill out the form below and we'll get back to you as soon as possible" : 'املأ النموذج أدناه وسنرد عليك في أقرب وقت ممكن')}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-6">
                      {success && (
                        <Alert className="mb-6 bg-green-900/30 border-green-500/30 text-green-400">
                          <CheckCircle2 className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                          <AlertDescription>
                            {success}
                          </AlertDescription>
                        </Alert>
                      )}
                      {error && (
                        <Alert className="mb-6 bg-red-900/30 border-red-500/30 text-red-400">
                          <XCircle className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                          <AlertDescription>
                            {error}
                          </AlertDescription>
                        </Alert>
                      )}
                      
                      <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <label htmlFor="name" className={`block text-sm font-medium text-gray-300 ${isRTL ? 'text-right' : ''}`}>
                              {t?.formLabels?.name || (locale === 'en' ? 'Your Name' : 'اسمك')}
                            </label>
                            <Input
                              id="name"
                              value={name}
                              onChange={(e) => setName(e.target.value)}
                              className="contact-form-input"
                              required
                              dir={locale === 'ar' ? 'rtl' : 'ltr'}
                              placeholder={t?.formLabels?.namePlaceholder || (locale === 'en' ? 'Enter your name' : 'أدخل اسمك')}
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <label htmlFor="email" className={`block text-sm font-medium text-gray-300 ${isRTL ? 'text-right' : ''}`}>
                              {t?.formLabels?.email || (locale === 'en' ? 'Your Email' : 'بريدك الإلكتروني')}
                            </label>
                            <Input
                              id="email"
                              type="email"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              className="contact-form-input"
                              required
                              dir="ltr"
                              placeholder={t?.formLabels?.emailPlaceholder || (locale === 'en' ? 'Enter your email' : 'أدخل بريدك الإلكتروني')}
                            />
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <label htmlFor="subject" className={`block text-sm font-medium text-gray-300 ${isRTL ? 'text-right' : ''}`}>
                            {t?.formLabels?.subject || (locale === 'en' ? 'Subject' : 'الموضوع')}
                          </label>
                          <Input
                            id="subject"
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            className="contact-form-input"
                            required
                            dir={locale === 'ar' ? 'rtl' : 'ltr'}
                            placeholder={t?.formLabels?.subjectPlaceholder || (locale === 'en' ? 'Enter subject' : 'أدخل الموضوع')}
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <label htmlFor="message" className={`block text-sm font-medium text-gray-300 ${isRTL ? 'text-right' : ''}`}>
                            {t?.formLabels?.message || (locale === 'en' ? 'Message' : 'الرسالة')}
                          </label>
                          <Textarea
                            id="message"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            className="contact-form-input min-h-[150px]"
                            required
                            dir={locale === 'ar' ? 'rtl' : 'ltr'}
                            placeholder={t?.formLabels?.messagePlaceholder || (locale === 'en' ? 'Enter your message' : 'أدخل رسالتك هنا')}
                          />
                        </div>
                        
                        <Button 
                          type="submit" 
                          disabled={submitting} 
                          className="w-full btn-primary"
                        >
                          {submitting ? (
                            <>
                              <span className={`h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin ${isRTL ? 'ml-2' : 'mr-2'}`}></span>
                              {t?.formLabels?.sending || (locale === 'en' ? 'Sending...' : 'جاري الإرسال...')}
                            </>
                          ) : t?.formLabels?.send || (locale === 'en' ? 'Send Message' : 'إرسال الرسالة')}
                        </Button>
                      </form>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        <section className="py-16 relative overflow-hidden">
          <div className="absolute inset-0 bg-cyber-grid opacity-5 z-0"></div>
          <div className="container mx-auto px-4 relative z-10">
            <div className="text-center mb-10">
              <h2 className={`text-3xl font-bold text-white mb-2 cyberpunk-border inline-block`}>
                {t?.faqTitle || (locale === 'en' ? 'Frequently Asked Questions' : 'الأسئلة الشائعة')}
              </h2>
              <p className="text-gray-400">
                {t?.faqSubtitle || (locale === 'en' ? 'Find answers to common questions about our services' : 'اعثر على إجابات للأسئلة الشائعة حول خدماتنا')}
              </p>
            </div>
            
            <div className="max-w-3xl mx-auto">
              <Accordion type="single" collapsible className="space-y-4">
                {(t?.faqs || []).map((item: FAQ, index: number) => (
                  <AccordionItem 
                    key={index} 
                    value={`item-${index}`}
                    className="game-card overflow-hidden border-0"
                  >
                    <AccordionTrigger className={`px-6 py-4 hover:no-underline hover:bg-gray-800/50 ${isRTL ? 'text-right' : 'text-left'} group`}>
                      <span className={`text-white ${isRTL ? 'text-right w-full' : 'text-left'} group-hover:text-primary transition-colors`}>{item.question}</span>
                    </AccordionTrigger>
                    <AccordionContent className={`px-6 pb-4 pt-2 text-gray-400 ${isRTL ? 'text-right' : 'text-left'}`}>
                      {item.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
                {(!t?.faqs || t?.faqs.length === 0) && (
                  <div className="text-center py-8 text-gray-400 game-card">
                    {locale === 'en' ? 'No FAQs available at the moment.' : 'لا توجد أسئلة متكررة في الوقت الحالي.'}
                  </div>
                )}
              </Accordion>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
} 