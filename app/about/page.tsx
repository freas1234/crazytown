'use client';

import { useEffect, useState } from 'react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { Card } from '../../components/ui/card';
import Link from 'next/link';
import Image from 'next/image';
import { useTranslation } from '../../lib/hooks/useTranslation';
import { useSiteSettings } from '../../lib/hooks/useSiteSettings';

interface FeatureItem {
  id?: string;
  title: { en: string; ar: string };
  description: { en: string; ar: string };
}

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
  featuresItems: FeatureItem[];
  teamMembers: TeamMember[];
}

const defaultContent: AboutContent = {
  title: {
    en: "About Our Server",
    ar: "عن السيرفر"
  },
  subtitle: {
    en: "Discover the world of Crazy Town FiveM",
    ar: "اكتشف عالم كريزي تاون FiveM"
  },
  aboutText: {
    en: "Crazy Town is a premier FiveM roleplay server offering an immersive gaming experience. Our server is built on a foundation of quality roleplay, community engagement, and continuous improvement. We strive to create a welcoming environment for all players, whether you're new to roleplay or a seasoned veteran. Our dedicated team of administrators and developers work tirelessly to ensure the server runs smoothly and provides new content regularly.",
    ar: "كريزي تاون هو سيرفر لعب أدوار FiveM متميز يقدم تجربة ألعاب غامرة. تم بناء السيرفر على أساس لعب أدوار عالي الجودة، ومشاركة المجتمع، والتحسين المستمر. نسعى جاهدين لخلق بيئة ترحيبية لجميع اللاعبين، سواء كنت جديدًا في لعب الأدوار أو محترفًا متمرسًا. يعمل فريقنا المخصص من المسؤولين والمطورين بلا كلل لضمان تشغيل السيرفر بسلاسة وتوفير محتوى جديد بانتظام."
  },
  serverInfoText: {
    en: "Our server features a custom economy system, unique job opportunities, and regular events. We pride ourselves on maintaining a balanced gameplay experience that rewards both casual players and those who invest significant time in the server. With custom scripts, vehicles, and properties, Crazy Town offers something for everyone.",
    ar: "يتميز السيرفر بنظام اقتصادي مخصص، وفرص عمل فريدة، وفعاليات منتظمة. نحن نفتخر بالحفاظ على تجربة لعب متوازنة تكافئ كلاً من اللاعبين العاديين وأولئك الذين يستثمرون وقتًا كبيرًا في السيرفر. مع نصوص برمجية مخصصة ومركبات وممتلكات، يقدم كريزي تاون شيئًا للجميع."
  },
  featuresItems: [
    {
      title: {
        en: "Custom Economy",
        ar: "نظام اقتصادي مخصص"
      },
      description: {
        en: "Balanced economic system with multiple ways to earn and spend money",
        ar: "نظام اقتصادي متوازن مع طرق متعددة لكسب وإنفاق المال"
      }
    },
    {
      title: {
        en: "Unique Jobs",
        ar: "وظائف فريدة"
      },
      description: {
        en: "Various legal and illegal job opportunities with progression systems",
        ar: "فرص عمل قانونية وغير قانونية متنوعة مع أنظمة تقدم"
      }
    },
    {
      title: {
        en: "Active Staff",
        ar: "طاقم نشط"
      },
      description: {
        en: "Dedicated team available to assist players and maintain server quality",
        ar: "فريق مخصص متاح لمساعدة اللاعبين والحفاظ على جودة السيرفر"
      }
    },
    {
      title: {
        en: "Regular Events",
        ar: "فعاليات منتظمة"
      },
      description: {
        en: "Weekly community events with special rewards and activities",
        ar: "فعاليات مجتمعية أسبوعية مع مكافآت وأنشطة خاصة"
      }
    }
  ],
  teamMembers: [
    {
      name: {
        en: "Alex",
        ar: "أليكس"
      },
      role: {
        en: "Owner & Lead Developer",
        ar: "المالك والمطور الرئيسي"
      },
      avatar: "/placeholder-avatar.svg"
    },
    {
      name: {
        en: "Sarah",
        ar: "سارة"
      },
      role: {
        en: "Community Manager",
        ar: "مديرة المجتمع"
      },
      avatar: "/placeholder-avatar.svg"
    }
  ]
};

export default function AboutPage() {
  const { locale, setLocale, isRTL } = useTranslation();
  const { settings } = useSiteSettings();
  
  const [content, setContent] = useState<AboutContent>(defaultContent);
  const [loading, setLoading] = useState(true);
  
  // Listen for settings updates
  useEffect(() => {
    const handleSettingsUpdate = () => {
      window.location.reload();
    };
    
    window.addEventListener('settingsUpdated', handleSettingsUpdate);
    
    return () => {
      window.removeEventListener('settingsUpdated', handleSettingsUpdate);
    };
  }, []);
  
  useEffect(() => {
    fetchContent();
  }, [locale]);
  
  const fetchContent = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/content/about');
      if (response.ok) {
        const data = await response.json();
        if (data.content) {
          setContent({
            ...defaultContent,
            ...data.content,
            featuresItems: Array.isArray(data.content.featuresItems) 
              ? data.content.featuresItems 
              : defaultContent.featuresItems,
            teamMembers: Array.isArray(data.content.teamMembers) 
              ? data.content.teamMembers 
              : defaultContent.teamMembers
          });
        }
      }
    } catch (error) {
      console.error('Error fetching about content:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen" dir={isRTL ? 'rtl' : 'ltr'}>
      <Header />
      
      <main className="flex-grow">
        <section className="py-16 relative overflow-hidden parallax-bg">
          <div className="absolute inset-0 bg-cyber-grid opacity-5 z-0"></div>
          <div className="absolute -top-20 -right-20 w-96 h-96 bg-primary opacity-10 rounded-full blur-3xl animate-pulse-slow"></div>
          
          <div className="relative z-10 container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl font-display font-bold mb-4 cyberpunk-border">
                <span className="text-primary animate-text-flicker">{content.title[locale as keyof typeof content.title]}</span>
              </h1>
              <p className="text-xl text-gray-400 mb-8">{content.subtitle[locale as keyof typeof content.subtitle]}</p>
            </div>
          </div>
        </section>
        
        <section className="py-16 bg-gray-900/30">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
              <div>
                <h2 className="text-3xl font-display font-bold mb-6 cyberpunk-border inline-block">
                  <span className="text-white">{locale === 'en' ? 'About Us' : 'من نحن'}</span>
                </h2>
                <p className="text-gray-400 mb-6 leading-relaxed">{content.aboutText[locale as keyof typeof content.aboutText]}</p>
                <p className="text-gray-400 leading-relaxed">{content.serverInfoText[locale as keyof typeof content.serverInfoText]}</p>
              </div>
              
              <div className="relative">
                <div className="absolute -top-4 -left-4 w-12 h-12 border-t-2 border-l-2 border-primary opacity-70"></div>
                <div className="absolute -bottom-4 -right-4 w-12 h-12 border-b-2 border-r-2 border-primary opacity-70"></div>
                
                <div className="overflow-hidden rounded-lg border border-primary/30 bg-secondary/80 shadow-md hover:shadow-xl transition-shadow duration-300">
                  <Image 
                    src="/placeholder-product.svg" 
                    alt="Server Screenshot" 
                    width={600}
                    height={400}
                    className="w-full h-auto rounded-lg"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>
        
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-center mb-12">
              <div className="h-px w-16 bg-primary opacity-50"></div>
              <h2 className="text-3xl font-display font-bold mx-4 text-white relative cyberpunk-border">
                <span className="text-primary">{locale === 'en' ? 'Key Features' : 'المميزات الرئيسية'}</span>
              </h2>
              <div className="h-px w-16 bg-primary opacity-50"></div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {(content.featuresItems || []).map((feature, index) => (
                <div key={feature.id || index} className="group p-6 rounded-lg border border-gray-800 bg-secondary/80 shadow-md hover:border-primary/30 hover:shadow-xl transition-all duration-300">
                  <div className="flex items-start">
                    <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center text-primary mr-3 group-hover:bg-primary/20 transition-colors">
                      <span className="text-lg font-bold">{index + 1}</span>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold mb-2 group-hover:text-primary transition-colors">
                        {feature.title[locale as keyof typeof feature.title]}
                      </h3>
                      <p className="text-gray-400 text-sm group-hover:text-gray-300 transition-colors">
                        {feature.description[locale as keyof typeof feature.description]}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
        
        <section className="py-16 bg-gray-900/30">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-center mb-12">
              <div className="h-px w-16 bg-primary opacity-50"></div>
              <h2 className="text-3xl font-display font-bold mx-4 text-white relative cyberpunk-border">
                <span className="text-primary">{locale === 'en' ? 'Our Team' : 'فريقنا'}</span>
              </h2>
              <div className="h-px w-16 bg-primary opacity-50"></div>
            </div>
                
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {(content.teamMembers || []).map((member, index) => (
                <div key={member.id || index} className="text-center group p-6 rounded-lg border border-gray-800 bg-secondary/80 shadow-md hover:border-primary/30 hover:shadow-xl transition-all duration-300">
                  <div className="mb-4 relative mx-auto w-24 h-24 rounded-full overflow-hidden border border-primary/30">
                    <Image 
                      src={member.avatar || '/placeholder-avatar.svg'} 
                      alt={member.name[locale as keyof typeof member.name]} 
                      width={96}
                      height={96}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                  <h3 className="text-lg font-bold mb-1 group-hover:text-primary transition-colors">
                    {member.name[locale as keyof typeof member.name]}
                  </h3>
                  <p className="text-gray-400 text-sm">
                    {member.role[locale as keyof typeof member.role]}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
        
        <section className="py-16 relative overflow-hidden">
          <div className="absolute inset-0 bg-cyber-grid opacity-5 z-0"></div>
          <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-primary opacity-10 rounded-full blur-3xl animate-pulse-slow"></div>
          
          <div className="relative z-10 container mx-auto px-4 text-center">
            <h2 className="text-3xl font-display font-bold mb-6 cyberpunk-border inline-block">
              <span className="text-primary animate-text-flicker">{locale === 'en' ? 'Join Our Discord' : 'انضم إلى Discord الخاص بنا'}</span>
            </h2>
            <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
              {locale === 'en' 
                ? "Join our Discord community to connect with other players, stay updated on server news, and participate in events." 
                : "انضم إلى مجتمع Discord للتواصل مع اللاعبين الآخرين، والبقاء على اطلاع بأخبار السيرفر، والمشاركة في الفعاليات."}
            </p>
            <Link 
              href={settings?.discordInviteUrl || 'https://discord.gg/crazytown'} 
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-6 py-3 bg-gradient-to-r from-primary to-primary/70 hover:from-primary/90 hover:to-primary/60 text-white font-medium rounded-lg shadow-lg transition-all"
            >
              <span className="text-lg">Discord</span>
            </Link>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}